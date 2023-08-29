import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import type { IDatasetSummaryArgs } from './DatasetSummary';
import { DatasetSummary } from './DatasetSummary';
import {
  IRI_A,
  IRI_XSD_INTEGER,
  IRI_VOID_CLASSES,
  IRI_VOID_DATASET,
  IRI_VOID_DISTINCT_OBJECTS,
  IRI_VOID_DISTINCT_SUBJECTS,
  IRI_VOID_PROPERTIES,
  IRI_VOID_PROPERTY,
  IRI_VOID_PROPERTY_PARTITION,
  IRI_VOID_TRIPLES,
  IRI_VOID_URI_SPACE,
} from './Namespaces';

export class DatasetSummaryVoID extends DatasetSummary {
  private readonly subjectCardinalities: Record<string, number>;
  private readonly predicateCardinalities: Record<string, number>;
  private readonly objectCardinalities: Record<string, number>;
  private readonly graphCardinalities: Record<string, number>;
  private readonly classCardinalities: Record<string, number>;

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

  public register(quad: RDF.Quad): void {
    this.triples++;
    if (quad.subject.termType === 'NamedNode') {
      this.subjectCardinalities[quad.subject.value] = (this.subjectCardinalities[quad.subject.value] ?? 0) + 1;
    }
    if (quad.predicate.termType === 'NamedNode') {
      this.predicateCardinalities[quad.predicate.value] = (this.predicateCardinalities[quad.predicate.value] ?? 0) + 1;
      if (quad.predicate.value === IRI_A.value && quad.object.termType === 'NamedNode') {
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

  public quads(): RDF.Quad[] {
    const factory: RDF.DataFactory = new DataFactory();
    const dataset_uri: RDF.NamedNode = factory.namedNode(this.dataset);
    const output: RDF.Quad[] = [
      factory.quad(
        dataset_uri,
        IRI_A,
        IRI_VOID_DATASET,
      ),
      factory.quad(
        dataset_uri,
        IRI_VOID_URI_SPACE,
        factory.literal(dataset_uri.value),
      ),
      factory.quad(
        dataset_uri,
        IRI_VOID_TRIPLES,
        factory.literal(this.triples.toString(10), IRI_XSD_INTEGER),
      ),
      factory.quad(
        dataset_uri,
        IRI_VOID_PROPERTIES,
        factory.literal(Object.keys(this.predicateCardinalities).length.toString(10), IRI_XSD_INTEGER),
      ),
      factory.quad(
        dataset_uri,
        IRI_VOID_CLASSES,
        factory.literal(Object.keys(this.classCardinalities).length.toString(10), IRI_XSD_INTEGER),
      ),
      factory.quad(
        dataset_uri,
        IRI_VOID_DISTINCT_OBJECTS,
        factory.literal(Object.keys(this.objectCardinalities).length.toString(10), IRI_XSD_INTEGER),
      ),
      factory.quad(
        dataset_uri,
        IRI_VOID_DISTINCT_SUBJECTS,
        factory.literal(Object.keys(this.subjectCardinalities).length.toString(10), IRI_XSD_INTEGER),
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
          IRI_VOID_PROPERTY_PARTITION,
          predicateCardinality,
        ),
        factory.quad(
          predicateCardinality,
          IRI_VOID_PROPERTY,
          factory.namedNode(predicate),
        ),
        factory.quad(
          predicateCardinality,
          IRI_VOID_TRIPLES,
          factory.literal(cardinality.toString(10), IRI_XSD_INTEGER),
        ),
      );
    }
    return output;
  }
}

