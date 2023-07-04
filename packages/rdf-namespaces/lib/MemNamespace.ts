import type * as RDF from '@rdfjs/types';
import { NamedNode } from 'rdf-data-factory';

const mem_uri: RDF.NamedNode = new NamedNode('http://semweb.mmlab.be/ns/membership#');

export const MEM_NS: Record<string, RDF.NamedNode> = {
  binaryRepresentation: new NamedNode(`${mem_uri.value}binaryRepresentation`),
  hashSize: new NamedNode(`${mem_uri.value}hashSize`),
  bitSize: new NamedNode(`${mem_uri.value}bitSize`),
  sourceCollection: new NamedNode(`${mem_uri.value}sourceCollection`),
  ApproximateMembershipFunction: new NamedNode(`${mem_uri.value}ApproximateMembershipFunction`),
  projectedProperty: new NamedNode(`${mem_uri.value}projectedProperty`),
  BloomFilter: new NamedNode(`${mem_uri.value}BloomFilter`),
};
