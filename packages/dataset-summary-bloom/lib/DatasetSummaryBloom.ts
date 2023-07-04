import type * as RDF from '@rdfjs/types';
import { DatasetSummary, type IDatasetSummaryArgs } from '@solidlab/catalogue-dataset-summary';
import { RDF_NS, MEM_NS, XSD_NS } from '@solidlab/catalogue-rdf-namespaces';
import { Bloem } from 'bloem';
import { DataFactory } from 'rdf-data-factory';

/**
 * Class for generating a Bloom filter for a dataset.
 */
export class DatasetSummaryBloom extends DatasetSummary {
  private readonly size: number;
  private readonly slices: number;

  private subjectFilter: Bloem;
  private predicateFilter: Bloem;
  private objectFilter: Bloem;
  private graphFilter: Bloem;
  private classFilter: Bloem;

  private combinedFilter: Bloem;

  public constructor(args: IBloomFilterArgs) {
    super(args);
    this.size = args.size;
    this.slices = args.slices;
    const zeroFilledBuffer: Buffer = Buffer.alloc(this.size);
    this.subjectFilter = new Bloem(this.size, this.slices, zeroFilledBuffer);
    this.predicateFilter = new Bloem(this.size, this.slices, zeroFilledBuffer);
    this.objectFilter = new Bloem(this.size, this.slices, zeroFilledBuffer);
    this.graphFilter = new Bloem(this.size, this.slices, zeroFilledBuffer);
    this.classFilter = new Bloem(this.size, this.slices, zeroFilledBuffer);
    this.combinedFilter = new Bloem(this.size, this.slices, zeroFilledBuffer);
  }

  public add(...quads: RDF.Quad[]): void {
    for (const quad of quads) {
      this.register(quad);
    }
  }

  public reset(): void {
    const zeroFilledBuffer: Buffer = Buffer.alloc(this.size);
    this.subjectFilter = new Bloem(this.size, this.slices, zeroFilledBuffer);
    this.predicateFilter = new Bloem(this.size, this.slices, zeroFilledBuffer);
    this.objectFilter = new Bloem(this.size, this.slices, zeroFilledBuffer);
    this.graphFilter = new Bloem(this.size, this.slices, zeroFilledBuffer);
    this.classFilter = new Bloem(this.size, this.slices, zeroFilledBuffer);
    this.combinedFilter = new Bloem(this.size, this.slices, zeroFilledBuffer);
  }

  private register(quad: RDF.Quad): void {
    const namedNodeToBuffer = (node: RDF.NamedNode): Buffer => Buffer.from(node.value, 'utf8');
    if (quad.subject.termType === 'NamedNode') {
      const value: Buffer = namedNodeToBuffer(quad.subject);
      this.subjectFilter.add(value);
      this.combinedFilter.add(value);
    }
    if (quad.predicate.termType === 'NamedNode') {
      const value: Buffer = namedNodeToBuffer(quad.predicate);
      this.predicateFilter.add(value);
      this.combinedFilter.add(value);
      if (quad.predicate === RDF_NS.type && quad.object.termType === 'NamedNode') {
        this.classFilter.add(namedNodeToBuffer(quad.object));
      }
    }
    if (quad.object.termType === 'NamedNode') {
      const value: Buffer = namedNodeToBuffer(quad.object);
      this.objectFilter.add(value);
      this.combinedFilter.add(value);
    }
    if (quad.graph.termType === 'NamedNode') {
      const value: Buffer = namedNodeToBuffer(quad.graph);
      this.graphFilter.add(value);
      this.combinedFilter.add(value);
    }
  }

  public toRdf(dataset: string): RDF.Quad[] {
    const output: RDF.Quad[] = [];
    const factory: RDF.DataFactory = new DataFactory();
    const datasetUri: RDF.NamedNode = factory.namedNode(this.replaceDatasetKeyValues(dataset));
    const filtersByProperty: Record<string, Bloem> = {
      // eslint-disable-next-line id-length
      s: this.subjectFilter,
      // eslint-disable-next-line id-length
      p: this.predicateFilter,
      // eslint-disable-next-line id-length
      o: this.objectFilter,
      // eslint-disable-next-line id-length
      g: this.graphFilter,
      spog: this.combinedFilter,
    };
    for (const [ projectedProperty, bloomFilter ] of Object.entries(filtersByProperty)) {
      const filterNode: RDF.NamedNode = factory.namedNode(`${datasetUri.value}#bloomfilter-${projectedProperty}`);
      output.push(
        factory.quad(
          filterNode,
          RDF_NS.type,
          MEM_NS.ApproximateMembershipFunction,
        ),
        factory.quad(
          filterNode,
          RDF_NS.type,
          MEM_NS.BloomFilter,
        ),
        factory.quad(
          filterNode,
          MEM_NS.sourceCollection,
          filterNode,
        ),
        factory.quad(
          filterNode,
          MEM_NS.projectedProperty,
          factory.literal(projectedProperty),
        ),
        factory.quad(
          filterNode,
          MEM_NS.binaryRepresentation,
          factory.literal((<any> bloomFilter).bitfield.buffer.toString('base64')),
        ),
        factory.quad(
          filterNode,
          MEM_NS.bitSize,
          factory.literal(this.size.toString(10), XSD_NS.integer),
        ),
        factory.quad(
          filterNode,
          MEM_NS.hashSize,
          factory.literal(this.slices.toString(10), XSD_NS.integer),
        ),
      );
    }
    return output;
  }
}

export interface IBloomFilterArgs extends IDatasetSummaryArgs {
  size: number;
  slices: number;
}
