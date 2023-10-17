import type * as RDF from '@rdfjs/types';
import { AsyncIterator } from 'asynciterator';
import { Bloem } from 'bloem';
import { DataFactory } from 'rdf-data-factory';
import { RDFS, MEM, XSD } from '../common/Namespaces';
import type { QuadWithSource } from '../loaders/DataLoader';
import type { IDatasetSummaryArgs } from './DatasetSummary';
import { DatasetSummary } from './DatasetSummary';

export class DatasetSummaryBloom extends DatasetSummary {
  private readonly size: number;
  private readonly slices: number;
  private readonly zeroFilledBuffer: Buffer;

  public constructor(args: IDatasetSummaryBloomArgs) {
    super(args);
    this.size = args.size;
    this.slices = args.slices;
    this.zeroFilledBuffer = Buffer.alloc(this.size);
  }

  public async from(stream: AsyncIterator<QuadWithSource>): Promise<AsyncIterator<RDF.Quad>> {
    const output = new AsyncIterator<RDF.Quad>();
    const filtersByDataset: Map<string, IDatasetBloomFilters> = new Map();
    stream.on('data', (quad: QuadWithSource) => {
      const dataset = this.sourceToDataset(quad.source);
      if (dataset) {
        let filters = filtersByDataset.get(dataset);
        if (!filters) {
          filters = {
            subject: new Bloem(this.size, this.slices, this.zeroFilledBuffer),
            predicate: new Bloem(this.size, this.slices, this.zeroFilledBuffer),
            object: new Bloem(this.size, this.slices, this.zeroFilledBuffer),
            combined: new Bloem(this.size, this.slices, this.zeroFilledBuffer),
          };
          filtersByDataset.set(dataset, filters);
        }
        if (quad.subject.termType === 'NamedNode') {
          const subjectBuffer = this.namedNodeToBuffer(quad.subject);
          filters.subject.add(subjectBuffer);
          filters.combined.add(subjectBuffer);
        }
        if (quad.predicate.termType === 'NamedNode') {
          const predicateBuffer = this.namedNodeToBuffer(quad.predicate);
          filters.predicate.add(predicateBuffer);
          filters.combined.add(predicateBuffer);
        }
        if (quad.object.termType === 'NamedNode') {
          const objectBuffer = this.namedNodeToBuffer(quad.object);
          filters.object.add(objectBuffer);
          filters.combined.add(objectBuffer);
        }
      }
    }).on('end', () => {
      const df = new DataFactory();
      for (const [ uri, filters ] of filtersByDataset) {
        const ds = df.namedNode(uri);
        const sf = df.blankNode();
        const pf = df.blankNode();
        const of = df.blankNode();
        output.append([
          // Subject filter
          df.quad(sf, RDFS.type, MEM.BloomFilter),
          df.quad(sf, RDFS.type, MEM.ApproximateMembershipFunction),
          df.quad(sf, MEM.sourceCollection, ds),
          df.quad(sf, MEM.projectedProperty, RDFS.subject),
          df.quad(sf, MEM.binaryRepresentation, df.literal(
            (<any>filters.subject).bitfield.buffer.toString('base64'),
            XSD.base64Binary,
          )),
          // Predicate filter
          df.quad(pf, RDFS.type, MEM.BloomFilter),
          df.quad(pf, RDFS.type, MEM.ApproximateMembershipFunction),
          df.quad(pf, MEM.sourceCollection, ds),
          df.quad(pf, MEM.projectedProperty, RDFS.predicate),
          df.quad(pf, MEM.binaryRepresentation, df.literal(
            (<any>filters.predicate).bitfield.buffer.toString('base64'),
            XSD.base64Binary,
          )),
          // Object filter
          df.quad(of, RDFS.type, MEM.BloomFilter),
          df.quad(of, RDFS.type, MEM.ApproximateMembershipFunction),
          df.quad(of, MEM.sourceCollection, ds),
          df.quad(of, MEM.projectedProperty, RDFS.object),
          df.quad(of, MEM.binaryRepresentation, df.literal(
            (<any>filters.object).bitfield.buffer.toString('base64'),
            XSD.base64Binary,
          )),
        ]);
      }
      output.emit('end');
    }).on('error', error => output.emit('error', error));

    return output;
  }

  private namedNodeToBuffer(node: RDF.NamedNode): Buffer {
    return Buffer.from(node.value, 'utf8');
  }
}

export interface IDatasetSummaryBloomArgs extends IDatasetSummaryArgs {
  size: number;
  slices: number;
}

export interface IDatasetBloomFilters {
  subject: Bloem;
  predicate: Bloem;
  object: Bloem;
  combined: Bloem;
}
