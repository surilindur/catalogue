import type * as RDF from '@rdfjs/types';
import { NamedNode } from 'rdf-data-factory';

const xsd_uri: RDF.NamedNode = new NamedNode('http://www.w3.org/2001/XMLSchema#');

export const XSD_NS: Record<string, RDF.NamedNode> = {
  integer: new NamedNode(`${xsd_uri.value}integer`),
};
