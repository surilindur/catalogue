import type * as RDF from '@rdfjs/types';
import { DF, DatasetSummary, type IDatasetSummaryArgs } from './DatasetSummary';

export class DatasetSummaryVoID extends DatasetSummary {
  protected totalQuads: number;
  protected readonly distinctSubjects: Set<string>;
  protected readonly distinctObjects: Set<string>;
  protected readonly distinctClasses: Set<string>;
  protected readonly quadCountByPredicate: Map<string, number>;
  protected readonly entitiesByClass: Map<string, Set<string>>;

  public static readonly VOID_PREFIX = 'http://rdfs.org/ns/void#';
  public static readonly VOID_TRIPLES = DF.namedNode(`${DatasetSummaryVoID.VOID_PREFIX}triples`);
  public static readonly VOID_ENTITIES = DF.namedNode(`${DatasetSummaryVoID.VOID_PREFIX}entities`);
  public static readonly VOID_CLASS = DF.namedNode(`${DatasetSummaryVoID.VOID_PREFIX}class`);
  public static readonly VOID_CLASSES = DF.namedNode(`${DatasetSummaryVoID.VOID_PREFIX}classes`);
  public static readonly VOID_PROPERTY = DF.namedNode(`${DatasetSummaryVoID.VOID_PREFIX}property`);
  public static readonly VOID_PROPERTIES = DF.namedNode(`${DatasetSummaryVoID.VOID_PREFIX}properties`);
  public static readonly VOID_URISPACE = DF.namedNode(`${DatasetSummaryVoID.VOID_PREFIX}uriSpace`);
  public static readonly VOID_DATASET = DF.namedNode(`${DatasetSummaryVoID.VOID_PREFIX}Dataset`);
  public static readonly VOID_DISTINCT_SUBJECTS = DF.namedNode(`${DatasetSummaryVoID.VOID_PREFIX}distinctSubjects`);
  public static readonly VOID_DISTINCT_OBJECTS = DF.namedNode(`${DatasetSummaryVoID.VOID_PREFIX}distinctObjects`);
  public static readonly VOID_PROPERTY_PARTITION = DF.namedNode(`${DatasetSummaryVoID.VOID_PREFIX}propertyPartition`);
  public static readonly VOID_CLASS_PARTITION = DF.namedNode(`${DatasetSummaryVoID.VOID_PREFIX}classPartition`);

  public constructor(args: IDatasetSummaryArgs) {
    super(args);
    this.totalQuads = 0;
    this.distinctSubjects = new Set();
    this.distinctObjects = new Set();
    this.distinctClasses = new Set();
    this.quadCountByPredicate = new Map();
    this.entitiesByClass = new Map();
  }

  public register(quad: RDF.Quad): void {
    this.totalQuads++;
    if (quad.subject.termType === 'BlankNode' || quad.subject.termType === 'NamedNode') {
      this.distinctSubjects.add(quad.subject.value);
    }
    if (quad.object.termType === 'BlankNode' || quad.object.termType === 'NamedNode') {
      this.distinctObjects.add(quad.object.value);
    } else if (quad.object.termType === 'Literal') {
      this.distinctObjects.add(quad.object.value + quad.object.language + quad.object.datatype.value);
    }
    if (quad.predicate.termType === 'NamedNode') {
      if (quad.predicate.value === DatasetSummaryVoID.RDF_TYPE.value && quad.object.termType === 'NamedNode') {
        this.distinctClasses.add(quad.object.value);
        if (quad.object.value in this.entitiesByClass) {
          this.entitiesByClass.get(quad.object.value)!.add(quad.subject.value);
        } else {
          this.entitiesByClass.set(quad.object.value, new Set([ quad.subject.value ]));
        }
      }
      this.quadCountByPredicate.set(quad.predicate.value, this.quadCountByPredicate.get(quad.predicate.value) ?? 0 + 1);
    }
  }

  public toQuads(): RDF.Quad[] {
    const dataset = DF.namedNode(this.dataset.toString());
    const result: RDF.Quad[] = [
      DF.quad(dataset, DatasetSummaryVoID.RDF_TYPE, DatasetSummaryVoID.VOID_DATASET),
      DF.quad(dataset, DatasetSummaryVoID.VOID_URISPACE, DF.literal(this.dataset.toString())),
      DF.quad(dataset, DatasetSummaryVoID.VOID_CLASSES, DF.literal(
        this.distinctClasses.size.toString(10),
        DatasetSummaryVoID.XSD_INTEGER,
      )),
      DF.quad(dataset, DatasetSummaryVoID.VOID_TRIPLES, DF.literal(
        this.totalQuads.toString(10),
        DatasetSummaryVoID.XSD_INTEGER,
      )),
      DF.quad(dataset, DatasetSummaryVoID.VOID_PROPERTIES, DF.literal(
        this.quadCountByPredicate.size.toString(10),
        DatasetSummaryVoID.XSD_INTEGER,
      )),
      DF.quad(dataset, DatasetSummaryVoID.VOID_DISTINCT_SUBJECTS, DF.literal(
        this.distinctSubjects.size.toString(10),
        DatasetSummaryVoID.XSD_INTEGER,
      )),
      DF.quad(dataset, DatasetSummaryVoID.VOID_DISTINCT_OBJECTS, DF.literal(
        this.distinctSubjects.size.toString(10),
        DatasetSummaryVoID.XSD_INTEGER,
      )),
    ];
    for (const [ predicate, count ] of this.quadCountByPredicate) {
      const partitionId = DF.blankNode();
      result.push(
        DF.quad(dataset, DatasetSummaryVoID.VOID_PROPERTY_PARTITION, partitionId),
        DF.quad(partitionId, DatasetSummaryVoID.RDF_TYPE, DatasetSummaryVoID.VOID_DATASET),
        DF.quad(partitionId, DatasetSummaryVoID.VOID_PROPERTY, DF.namedNode(predicate)),
        DF.quad(partitionId, DatasetSummaryVoID.VOID_TRIPLES, DF.literal(
          count.toString(10),
          DatasetSummaryVoID.XSD_INTEGER,
        )),
      );
    }
    for (const [ rdfclass, entities ] of this.entitiesByClass) {
      const partitionId = DF.blankNode();
      result.push(
        DF.quad(dataset, DatasetSummaryVoID.VOID_CLASS_PARTITION, partitionId),
        DF.quad(partitionId, DatasetSummaryVoID.RDF_TYPE, DatasetSummaryVoID.VOID_DATASET),
        DF.quad(partitionId, DatasetSummaryVoID.VOID_CLASS, DF.namedNode(rdfclass)),
        DF.quad(partitionId, DatasetSummaryVoID.VOID_ENTITIES, DF.literal(
          entities.size.toString(),
          DatasetSummaryVoID.XSD_INTEGER,
        )),
      );
    }
    return result;
  }
}
