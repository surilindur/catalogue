import type * as RDF from '@rdfjs/types';
import { NamedNode } from 'rdf-data-factory';

const void_uri: RDF.NamedNode = new NamedNode('http://rdfs.org/ns/void#');

export const VoID_NS: Record<string, RDF.NamedNode> = {
  Dataset: new NamedNode(`${void_uri.value}Dataset`),
  uriSpace: new NamedNode(`${void_uri.value}uriSpace`),
  triples: new NamedNode(`${void_uri.value}triples`),
  classes: new NamedNode(`${void_uri.value}classes`),
  properties: new NamedNode(`${void_uri.value}properties`),
  property: new NamedNode(`${void_uri.value}property`),
  propertyPartition: new NamedNode(`${void_uri.value}propertyPartition`),
  distinctSubjects: new NamedNode(`${void_uri.value}distinctSubjects`),
  distinctObjects: new NamedNode(`${void_uri.value}distinctObjects`),
  documents: new NamedNode(`${void_uri.value}documents`),
};
