import type * as RDF from '@rdfjs/types';
import { NamedNode } from 'rdf-data-factory';

const rdf_uri: RDF.NamedNode = new NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#');

export const RDF_NS: Record<string, RDF.NamedNode> = {
  type: new NamedNode(`${rdf_uri.value}type`),
};
