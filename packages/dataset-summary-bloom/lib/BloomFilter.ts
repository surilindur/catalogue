import type { IDatasetSummary, IDatasetSummaryArgs } from '@catalogue/dataset-summary';
import { XSD_NS, RDF_NS, MEM_NS } from '@catalogue/rdf-namespaces';
import type * as RDF from '@rdfjs/types';
import { Bloem } from 'bloem';
import { DataFactory } from 'rdf-data-factory';

/**
 * Class for generating a Bloom filter for a dataset.
 */
export class BloomFilter implements IDatasetSummary {
  private readonly size: number;
  private readonly slices: number;

  private subjectBuffer: Buffer;
  private predicateBuffer: Buffer;
  private objectBuffer: Buffer;
  private graphBuffer: Buffer;
  private classBuffer: Buffer;

  private subjectFilter: Bloem;
  private predicateFilter: Bloem;
  private objectFilter: Bloem;
  private graphFilter: Bloem;
  private classFilter: Bloem;

  public constructor(args: IBloomFilterArgs) {
    this.size = args.size;
    this.slices = args.slices;
    this.subjectBuffer = Buffer.alloc(this.size);
    this.predicateBuffer = Buffer.alloc(this.size);
    this.objectBuffer = Buffer.alloc(this.size);
    this.graphBuffer = Buffer.alloc(this.size);
    this.classBuffer = Buffer.alloc(this.size);
    this.subjectFilter = new Bloem(this.size, this.slices, this.subjectBuffer);
    this.predicateFilter = new Bloem(this.size, this.slices, this.predicateBuffer);
    this.objectFilter = new Bloem(this.size, this.slices, this.objectBuffer);
    this.graphFilter = new Bloem(this.size, this.slices, this.graphBuffer);
    this.classFilter = new Bloem(this.size, this.slices, this.classBuffer);
  }

  public add(...quads: RDF.Quad[]): void {
    for (const quad of quads) {
      this.register(quad);
    }
  }

  public reset(): void {
    this.subjectBuffer = Buffer.alloc(this.size);
    this.predicateBuffer = Buffer.alloc(this.size);
    this.objectBuffer = Buffer.alloc(this.size);
    this.graphBuffer = Buffer.alloc(this.size);
    this.classBuffer = Buffer.alloc(this.size);
    this.subjectFilter = new Bloem(this.size, this.slices, this.subjectBuffer);
    this.predicateFilter = new Bloem(this.size, this.slices, this.predicateBuffer);
    this.objectFilter = new Bloem(this.size, this.slices, this.objectBuffer);
    this.graphFilter = new Bloem(this.size, this.slices, this.graphBuffer);
    this.classFilter = new Bloem(this.size, this.slices, this.classBuffer);
  }

  private register(quad: RDF.Quad): void {
    const namedNodeToBuffer = (node: RDF.NamedNode): Buffer => Buffer.from(node.value, 'utf8');
    if (quad.subject.termType === 'NamedNode') {
      this.subjectFilter.add(namedNodeToBuffer(quad.subject));
    }
    if (quad.predicate.termType === 'NamedNode') {
      this.predicateFilter.add(namedNodeToBuffer(quad.predicate));
      if (quad.predicate === RDF_NS.type && quad.object.termType === 'NamedNode') {
        this.classFilter.add(namedNodeToBuffer(quad.object));
      }
    }
    if (quad.object.termType === 'NamedNode') {
      this.objectFilter.add(namedNodeToBuffer(quad.object));
    }
    if (quad.graph.termType === 'NamedNode') {
      this.graphFilter.add(namedNodeToBuffer(quad.graph));
    }
  }

  public toRdf(dataset: string): RDF.Quad[] {
    const factory: RDF.DataFactory = new DataFactory();
    const dataset_uri: RDF.NamedNode = factory.namedNode(dataset);
    const output: RDF.Quad[] = [
      factory.quad(
        dataset_uri,
        MEM_NS.bits,
        factory.literal(this.subjectFilter),
      ),
      factory.quad(
        dataset_uri,
        VoID_NS.uriSpace,
        factory.literal(dataset_uri.value),
      ),
      factory.quad(
        dataset_uri,
        VoID_NS.triples,
        factory.literal(this.triples.toString(10), XSD_NS.integer),
      ),
      factory.quad(
        dataset_uri,
        VoID_NS.properties,
        factory.literal(this.predicateCardinalities.size.toString(10), XSD_NS.integer),
      ),
      factory.quad(
        dataset_uri,
        VoID_NS.classes,
        factory.literal(this.classCardinalities.size.toString(10), XSD_NS.integer),
      ),
      factory.quad(
        dataset_uri,
        VoID_NS.distinctObjects,
        factory.literal(this.objectCardinalities.size.toString(10), XSD_NS.integer),
      ),
      factory.quad(
        dataset_uri,
        VoID_NS.distinctSubjects,
        factory.literal(this.subjectCardinalities.size.toString(10), XSD_NS.integer),
      ),
      // This is not possible to implement this way :(
      // factory.quad(
      //   dataset,
      //   VoID_NS.documents,
      //   factory.literal(this.documents.toString(10), XSD_NS.integer),
      // ),
    ];
    for (const [ predicate, cardinality ] of this.predicateCardinalities) {
      const predicateCardinality = factory.blankNode();
      output.push(
        factory.quad(
          predicateCardinality,
          VoID_NS.voidProperty,
          predicate,
        ),
        factory.quad(
          predicateCardinality,
          VoID_NS.triples,
          factory.literal(cardinality.toString(10), XSD_NS.integer),
        ),
        factory.quad(
          dataset_uri,
          VoID_NS.propertyPartition,
          predicateCardinality,
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
