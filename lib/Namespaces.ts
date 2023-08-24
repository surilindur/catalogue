import { NamedNode } from 'rdf-data-factory';

const MEM_PREFIX = 'http://semweb.mmlab.be/ns/membership#';
const RDF_PREFIX = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const VOID_PREFIX = 'http://rdfs.org/ns/void#';
const XSD_PREFIX = 'http://www.w3.org/2001/XMLSchema#';

export const IRI_MEM_BINARY_REPRESENTATION = new NamedNode(`${MEM_PREFIX}binaryRepresentation`);
export const IRI_MEM_HASH_SIZE = new NamedNode(`${MEM_PREFIX}hashSize`);
export const IRI_MEM_BIT_SIZE = new NamedNode(`${MEM_PREFIX}bitSize`);
export const IRI_MEM_SOURCE_COLLECTION = new NamedNode(`${MEM_PREFIX}sourceCollection`);
export const IRI_MEM_APPROXIMATE_MEMBERSHIP_FUNCTION = new NamedNode(`${MEM_PREFIX}ApproximateMembershipFunction`);
export const IRI_MEM_PROJECTED_PROPERTY = new NamedNode(`${MEM_PREFIX}projectedProperty`);
export const IRI_MEM_BLOOM_FILTER = new NamedNode(`${MEM_PREFIX}BloomFilter`);

export const IRI_A = new NamedNode(`${RDF_PREFIX}type`);

export const IRI_VOID_DATASET = new NamedNode(`${VOID_PREFIX}Dataset`);
export const IRI_VOID_URI_SPACE = new NamedNode(`${VOID_PREFIX}uriSpace`);
export const IRI_VOID_TRIPLES = new NamedNode(`${VOID_PREFIX}triples`);
export const IRI_VOID_CLASSES = new NamedNode(`${VOID_PREFIX}classes`);
export const IRI_VOID_PROPERTIES = new NamedNode(`${VOID_PREFIX}properties`);
export const IRI_VOID_PROPERTY = new NamedNode(`${VOID_PREFIX}property`);
export const IRI_VOID_PROPERTY_PARTITION = new NamedNode(`${VOID_PREFIX}propertyPartition`);
export const IRI_VOID_DISTINCT_SUBJECTS = new NamedNode(`${VOID_PREFIX}distinctSubjects`);
export const IRI_VOID_DISTINCT_OBJECTS = new NamedNode(`${VOID_PREFIX}distinctObjects`);
export const IRI_VOID_DOCUMENTS = new NamedNode(`${VOID_PREFIX}documents`);

export const IRI_XSD_INTEGER = new NamedNode(`${XSD_PREFIX}integer`);
