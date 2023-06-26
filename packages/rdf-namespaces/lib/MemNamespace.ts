import type * as RDF from '@rdfjs/types';
import { NamedNode } from 'rdf-data-factory';

const mem_uri: RDF.NamedNode = new NamedNode('http://semweb.mmlab.be/ns/membership#');

export const MEM_NS: Record<string, RDF.NamedNode> = {
  filter: new NamedNode(`${mem_uri.value}filter`),
  hashes: new NamedNode(`${mem_uri.value}filter`),
  bits: new NamedNode(`${mem_uri.value}filter`),
};
