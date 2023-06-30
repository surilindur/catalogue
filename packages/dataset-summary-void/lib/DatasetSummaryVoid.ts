import type * as RDF from '@rdfjs/types';
import { DatasetSummary, type IDatasetSummaryArgs } from '@solidlab/catalogue-dataset-summary';
import { XSD_NS, RDF_NS, VoID_NS } from '@solidlab/catalogue-rdf-namespaces';
import { DataFactory } from 'rdf-data-factory';

/**
 * Class for generating a Vocabulary of Interlinked Datasets description
 * for a dataset by instantiating it with the dataset URI and registering triples.
 * See: https://www.w3.org/TR/void/
 */
export class DatasetSummaryVoid extends DatasetSummary {
  private subjectCardinalities: Record<string, number>;
  private predicateCardinalities: Record<string, number>;
  private objectCardinalities: Record<string, number>;
  private graphCardinalities: Record<string, number>;
  private classCardinalities: Record<string, number>;

  private triples: number;

  public constructor(args: IDatasetSummaryArgs) {
    super(args);
    this.triples = 0;
    this.subjectCardinalities = {};
    this.predicateCardinalities = {};
    this.objectCardinalities = {};
    this.graphCardinalities = {};
    this.classCardinalities = {};
  }

  public add(...quads: RDF.Quad[]): void {
    for (const quad of quads) {
      this.register(quad);
    }
  }

  public reset(): void {
    this.triples = 0;
    this.subjectCardinalities = {};
    this.predicateCardinalities = {};
    this.objectCardinalities = {};
    this.graphCardinalities = {};
    this.classCardinalities = {};
  }

  private register(quad: RDF.Quad): void {
    this.triples++;
    if (quad.subject.termType === 'NamedNode') {
      this.subjectCardinalities[quad.subject.value] = (this.subjectCardinalities[quad.subject.value] ?? 0) + 1;
    }
    if (quad.predicate.termType === 'NamedNode') {
      this.predicateCardinalities[quad.predicate.value] = (this.predicateCardinalities[quad.predicate.value] ?? 0) + 1;
      if (quad.predicate === RDF_NS.type && quad.object.termType === 'NamedNode') {
        this.classCardinalities[quad.object.value] = (this.classCardinalities[quad.object.value] ?? 0) + 1;
      }
    }
    if (quad.object.termType === 'NamedNode') {
      this.objectCardinalities[quad.object.value] = (this.objectCardinalities[quad.object.value] ?? 0) + 1;
    }
    if (quad.graph.termType === 'NamedNode') {
      this.graphCardinalities[quad.graph.value] = (this.graphCardinalities[quad.graph.value] ?? 0) + 1;
    }
  }

  public toRdf(dataset: string): RDF.Quad[] {
    const factory: RDF.DataFactory = new DataFactory();
    const dataset_uri: RDF.NamedNode = factory.namedNode(this.replaceDatasetKeyValues(dataset));
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
        factory.literal(Object.keys(this.predicateCardinalities).length.toString(10), XSD_NS.integer),
      ),
      factory.quad(
        dataset_uri,
        VoID_NS.classes,
        factory.literal(Object.keys(this.classCardinalities).length.toString(10), XSD_NS.integer),
      ),
      factory.quad(
        dataset_uri,
        VoID_NS.distinctObjects,
        factory.literal(Object.keys(this.objectCardinalities).length.toString(10), XSD_NS.integer),
      ),
      factory.quad(
        dataset_uri,
        VoID_NS.distinctSubjects,
        factory.literal(Object.keys(this.subjectCardinalities).length.toString(10), XSD_NS.integer),
      ),
      // This is not possible to implement this way :(
      // factory.quad(
      //   dataset,
      //   VoID_NS.documents,
      //   factory.literal(this.documents.toString(10), XSD_NS.integer),
      // ),
    ];
    for (const [ predicate, cardinality ] of Object.entries(this.predicateCardinalities)) {
      const predicateCardinality = factory.blankNode();
      output.push(
        factory.quad(
          dataset_uri,
          VoID_NS.propertyPartition,
          predicateCardinality,
        ),
        factory.quad(
          predicateCardinality,
          VoID_NS.property,
          factory.namedNode(predicate),
        ),
        factory.quad(
          predicateCardinality,
          VoID_NS.triples,
          factory.literal(cardinality.toString(10), XSD_NS.integer),
        ),
      );
    }
    return output;
  }
}
