import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';

const PREFIX_MEM = 'http://semweb.mmlab.be/ns/membership#';
const PREFIX_RDFS = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const PREFIX_VOID = 'http://rdfs.org/ns/void#';
const PREFIX_XSD = 'http://www.w3.org/2001/XMLSchema#';
const PREFIX_W3F = 'http://www.w3.org/ns/formats/';

type Namespace<TKeys extends string> = Record<TKeys, RDF.NamedNode>;

const df: DataFactory = new DataFactory();

function createNamespace<TKeys extends string>(prefix: string, entries: Record<string, string>): Namespace<TKeys> {
  const output: Record<string, RDF.NamedNode> = {};
  for (const value of Object.values(entries)) {
    output[value] = df.namedNode(`${prefix}${value}`);
  }
  return <Namespace<TKeys>>output;
}

enum VoIDKeys {
  Dataset = 'Dataset',
  DatasetDescription = 'DatasetDescription',
  uriSpace = 'uriSpace',
  triples = 'triples',
  entities = 'entities',
  feature = 'feature',
  properties = 'properties',
  property = 'property',
  propertyPartition = 'propertyPartition',
  classes = 'classes',
  class = 'class',
  classPartition = 'classPartition',
  distinctSubjects = 'distinctSubjects',
  distinctObjects = 'distinctObjects',
  documents = 'documents',
}

enum W3FKeys {
  NTriples = 'N-Triples',
}

enum MEMKeys {
  binaryRepresentation = 'binaryRepresentation',
  hashSize = 'hashSize',
  bitSize = 'bitSize',
  sourceCollection = 'sourceCollection',
  ApproximateMembershipFunction = 'ApproximateMembershipFunction',
  projectedProperty = 'projectedProperty',
  BloomFilter = 'BloomFilter',
}

enum XSDKeys {
  integer = 'integer',
  string = 'string',
  base64Binary = 'base64Binary',
}

enum RDFKeys {
  type = 'type',
  subject = 'subject',
  predicate = 'predicate',
  object = 'object',
}

export const VoID: Namespace<VoIDKeys> = createNamespace(PREFIX_VOID, VoIDKeys);
export const W3F: Namespace<W3FKeys> = createNamespace(PREFIX_W3F, W3FKeys);
export const MEM: Namespace<MEMKeys> = createNamespace(PREFIX_MEM, MEMKeys);
export const XSD: Namespace<XSDKeys> = createNamespace(PREFIX_XSD, XSDKeys);
export const RDFS: Namespace<RDFKeys> = createNamespace(PREFIX_RDFS, RDFKeys);
