import type { IDatasetSummary } from '@catalogue/dataset-summary-generator';
import { XSD_NS, RDF_NS, VoID_NS } from '@catalogue/rdf-namespaces';
import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';

/**
 * Class for generating a Vocabulary of Interlinked Datasets description
 * for a dataset by instantiating it with the dataset URI and registering triples.
 * See: https://www.w3.org/TR/void/
 */
export class VoIDDescription implements IDatasetSummary {
  private readonly subjectCardinalities: Map<RDF.NamedNode, number>;
  private readonly predicateCardinalities: Map<RDF.NamedNode, number>;
  private readonly objectCardinalities: Map<RDF.NamedNode, number>;
  private readonly graphCardinalities: Map<RDF.NamedNode, number>;
  private readonly classCardinalities: Map<RDF.NamedNode, number>;

  private triples: number;

  public constructor() {
    this.triples = 0;
    this.subjectCardinalities = new Map();
    this.predicateCardinalities = new Map();
    this.objectCardinalities = new Map();
    this.graphCardinalities = new Map();
    this.classCardinalities = new Map();
  }

  public add(...quads: RDF.Quad[]): void {
    for (const quad of quads) {
      this.register(quad);
    }
  }

  public reset(): void {
    this.triples = 0;
    this.subjectCardinalities.clear();
    this.predicateCardinalities.clear();
    this.objectCardinalities.clear();
    this.graphCardinalities.clear();
    this.classCardinalities.clear();
  }

  private register(quad: RDF.Quad): void {
    this.triples++;
    if (quad.subject.termType === 'NamedNode') {
      this.subjectCardinalities.set(
        quad.subject,
        (this.subjectCardinalities.get(quad.subject) ?? 0) + 1,
      );
    }
    if (quad.predicate.termType === 'NamedNode') {
      this.predicateCardinalities.set(
        quad.predicate,
        (this.predicateCardinalities.get(quad.predicate) ?? 0) + 1,
      );
      if (quad.predicate === RDF_NS.type && quad.object.termType === 'NamedNode') {
        this.classCardinalities.set(
          quad.object,
          (this.classCardinalities.get(quad.object) ?? 0) + 1,
        );
      }
    }
    if (quad.object.termType === 'NamedNode') {
      this.predicateCardinalities.set(
        quad.object,
        (this.objectCardinalities.get(quad.object) ?? 0) + 1,
      );
    }
    if (quad.graph.termType === 'NamedNode') {
      this.predicateCardinalities.set(
        quad.graph,
        (this.graphCardinalities.get(quad.graph) ?? 0) + 1,
      );
    }
  }

  public toRdf(dataset: string): RDF.Quad[] {
    const factory: RDF.DataFactory = new DataFactory();
    const dataset_uri: RDF.NamedNode = factory.namedNode(dataset);
    const output: RDF.Quad[] = [
      factory.quad(
        dataset_uri,
        RDF_NS.type,
        VoID_NS.Dataset,
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
