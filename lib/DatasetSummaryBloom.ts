import type * as RDF from '@rdfjs/types';
import { Bloem } from 'bloem';
import { DataFactory } from 'rdf-data-factory';
import { DatasetSummary, type IDatasetSummaryArgs } from './DatasetSummary';
import {
  IRI_A, IRI_MEM_APPROXIMATE_MEMBERSHIP_FUNCTION,
  IRI_MEM_BINARY_REPRESENTATION,
  IRI_MEM_BIT_SIZE,
  IRI_MEM_BLOOM_FILTER,
  IRI_MEM_HASH_SIZE,
  IRI_MEM_PROJECTED_PROPERTY,
  IRI_MEM_SOURCE_COLLECTION,
  IRI_XSD_INTEGER,
} from './Namespaces';

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
      if (quad.predicate.value === IRI_A.value && quad.object.termType === 'NamedNode') {
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
          IRI_A,
          IRI_MEM_APPROXIMATE_MEMBERSHIP_FUNCTION,
        ),
        factory.quad(
          filterNode,
          IRI_A,
          IRI_MEM_BLOOM_FILTER,
        ),
        factory.quad(
          filterNode,
          IRI_MEM_SOURCE_COLLECTION,
          datasetUri,
        ),
        factory.quad(
          filterNode,
          IRI_MEM_PROJECTED_PROPERTY,
          factory.literal(projectedProperty),
        ),
        factory.quad(
          filterNode,
          IRI_MEM_BINARY_REPRESENTATION,
          factory.literal((<any>bloomFilter).bitfield.buffer.toString('base64')),
        ),
        factory.quad(
          filterNode,
          IRI_MEM_BIT_SIZE,
          factory.literal(this.size.toString(10), IRI_XSD_INTEGER),
        ),
        factory.quad(
          filterNode,
          IRI_MEM_HASH_SIZE,
          factory.literal(this.slices.toString(10), IRI_XSD_INTEGER),
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
