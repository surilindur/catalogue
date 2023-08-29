# SolidBench Summaries

This is an experimental set of small scripts to generate dataset summaries primarily for SolidBench. The generation is not pipelined and not done in a streaming manner, so for very large datasets it will definitely not function.

The following dataset summaries have been implemented:

* [**VoID description**](src/DatasetSummaryVoID.ts) following the [Vocabulary of Interlinked Datasets (VoID)](https://www.w3.org/TR/void/). This summary provides, for example, the cardinalities of different predicates, as well as the total dataset size in triples, as well as the unique subject, predicate and object counts.
* [**Bloom filter**](src/DatasetSummaryBloom.ts) as an approximate membership function (AMF) for checking whether the dataset contains specific entries. The generation is done using the [Bloem](https://github.com/wiedi/node-bloem) package.

## Installing

The tool is not published anywhere, because it is not intended for actual use and is only intended for experiments. After cloning the repository, it should be sufficient to install the dependencies and build:

```bash
$ yarn install --immutable
$ yarn build
```

The configurations are in [config/](config/).

## Usage

The primary use case of this tool is to generate summaries for the data from [SolidBench](https://github.com/SolidBench/SolidBench.js) for benchmarking purposes. The default configuration generates summaries for each pod, and places them in a file called `.meta` at the pod root. Using the `FixedContentTypeMapper` implementation from the [Community Solid Server](https://github.com/CommunitySolidServer/CommunitySolidServer/), the summaries are then served at the pod root URI when serving the dataset using the serve command from SolidBench.

For example, the VoID descriptions can be generated with:

```bash
$ yarn solidbench-summaries --config ./config/void.json
```

The Bloom filters can be generated with:

```bash
$ yarn solidbench-summaries --config ./config/bloom.json
```

## Examples

Example VoID description for a pod, truncated due to length:

```
<http://localhost:3000/pods/00000000000000000065/> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://rdfs.org/ns/void#Dataset> .
<http://localhost:3000/pods/00000000000000000065/> <http://rdfs.org/ns/void#uriSpace> "http://localhost:3000/pods/00000000000000000065/" .
<http://localhost:3000/pods/00000000000000000065/> <http://rdfs.org/ns/void#triples> "2936"^^<http://www.w3.org/2001/XMLSchema#integer> .
<http://localhost:3000/pods/00000000000000000065/> <http://rdfs.org/ns/void#properties> "33"^^<http://www.w3.org/2001/XMLSchema#integer> .
<http://localhost:3000/pods/00000000000000000065/> <http://rdfs.org/ns/void#classes> "7"^^<http://www.w3.org/2001/XMLSchema#integer> .
<http://localhost:3000/pods/00000000000000000065/> <http://rdfs.org/ns/void#distinctObjects> "107"^^<http://www.w3.org/2001/XMLSchema#integer> .
<http://localhost:3000/pods/00000000000000000065/> <http://rdfs.org/ns/void#distinctSubjects> "329"^^<http://www.w3.org/2001/XMLSchema#integer> .

...

<http://localhost:3000/pods/00000000000000000065/> <http://rdfs.org/ns/void#propertyPartition> _:df_1654_9 .
_:df_1654_9 <http://rdfs.org/ns/void#property> <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/hasCreator> .
_:df_1654_9 <http://rdfs.org/ns/void#triples> "325"^^<http://www.w3.org/2001/XMLSchema#integer> .
<http://localhost:3000/pods/00000000000000000065/> <http://rdfs.org/ns/void#propertyPartition> _:df_1654_10 .
_:df_1654_10 <http://rdfs.org/ns/void#property> <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/noise> .
_:df_1654_10 <http://rdfs.org/ns/void#triples> "13"^^<http://www.w3.org/2001/XMLSchema#integer> .
<http://localhost:3000/pods/00000000000000000065/> <http://rdfs.org/ns/void#propertyPartition> _:df_1654_11 .
_:df_1654_11 <http://rdfs.org/ns/void#property> <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/imageFile> .
_:df_1654_11 <http://rdfs.org/ns/void#triples> "309"^^<http://www.w3.org/2001/XMLSchema#integer> .
<http://localhost:3000/pods/00000000000000000065/> <http://rdfs.org/ns/void#propertyPartition> _:df_1654_12 .
_:df_1654_12 <http://rdfs.org/ns/void#property> <http://www.w3.org/2000/01/rdf-schema#seeAlso> .
_:df_1654_12 <http://rdfs.org/ns/void#triples> "309"^^<http://www.w3.org/2001/XMLSchema#integer> .
<http://localhost:3000/pods/00000000000000000065/> <http://rdfs.org/ns/void#propertyPartition> _:df_1654_13 .
_:df_1654_13 <http://rdfs.org/ns/void#property> <http://www.w3.org/ns/pim/space#storage> .
_:df_1654_13 <http://rdfs.org/ns/void#triples> "1"^^<http://www.w3.org/2001/XMLSchema#integer> .

...
```

Example Bloom filter for all the subjects in a pod:

```
<http://localhost:3000/pods/00000000000000000065/#bloomfilter-s> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://semweb.mmlab.be/ns/membership#ApproximateMembershipFunction> .
<http://localhost:3000/pods/00000000000000000065/#bloomfilter-s> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://semweb.mmlab.be/ns/membership#BloomFilter> .
<http://localhost:3000/pods/00000000000000000065/#bloomfilter-s> <http://semweb.mmlab.be/ns/membership#sourceCollection> <http://localhost:3000/pods/00000000000000000065/> .
<http://localhost:3000/pods/00000000000000000065/#bloomfilter-s> <http://semweb.mmlab.be/ns/membership#projectedProperty> "s" .
<http://localhost:3000/pods/00000000000000000065/#bloomfilter-s> <http://semweb.mmlab.be/ns/membership#binaryRepresentation> "AEQAABGQAAMQABEAAFAAAIAAAwRQAEAECgADAAAAAAAAQCAQBCCEgABEAAMJgQQCASQVJQYAiQGACAAACAAQQBZAEAQNAAACAQBAABAAAAEEECABEAEAACBUFEAHRBBIBABAIAgAMAAJBAREBBUABABAFAGAIEAABRQIAAECgAAACAAABBEAAAAAACCAAJNAQEAjAUACQAWFEAhyQCACiAAEABQACAAAQBcAwAAEABAEFABAABAUQBBEEAQAAAAGwBABAEIBERAAAggEQBIAABBAAAUBAABBAAAAMEAABQZAgCCgAAGCABABgAAAIAAAACBBUggAEEgJkABQQSAEggBgiEkCKAAABQACAgDABAAgAAAIBgEEABAABEEAAAUEAAAAAAlARAAAUEAEBJAAAAAQBBICDBAAQAAAQQAAAAAFAEAABAAgCABBgUAARAAAIAEEBAABQAAUAgCAQgEsgEQQEIEhERBgggAAAEAZEAAAACABAAAgAABAEAUIFABBAABAAQEQAABAEgARABAUQkUBMAQEAASEBAASRBABAAAABEAAQAIQQAABAQACCFAgAQARAABIAIAAQAAQBIEAEaBQAAowCQxEMFAEhJBwkggAQAYUQEIAQoAAAhkIARBUQAIMQAAAAUBAAIAQAIAEQAQAAIRwEQAcUAABSGAAgAQ=" .
<http://localhost:3000/pods/00000000000000000065/#bloomfilter-s> <http://semweb.mmlab.be/ns/membership#bitSize> "4096"^^<http://www.w3.org/2001/XMLSchema#integer> .
<http://localhost:3000/pods/00000000000000000065/#bloomfilter-s> <http://semweb.mmlab.be/ns/membership#hashSize> "2"^^<http://www.w3.org/2001/XMLSchema#integer> .
```

## Issues

Any issues encountered can be reported via the GitHub issue tracker. However, before reporting issues, please note that this is not a production-ready application and is not intended for everyday use.
