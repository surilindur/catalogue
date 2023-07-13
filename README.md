<p align="center">
    <img alt="logo" src="./images/logo.svg" width="220">
</p>

Catalogue is an experimental tool to generate dataset summaries, consisting of a data loader, dataset summary and a data serializer, wired together using [Components.js](https://github.com/LinkedSoftwareDependencies/Components.js/). The tool works by using a data loader to load and group the data by key, feeding it to a dataset summary, and serializing the dataset summary as RDF using a serializer module.

The following data loaders have currently been implemented:

* [**Filesystem data loader**](packages/data-loader-filesystem/) for loading from local files on disk.

The following data serializers have been implemented:

* [**Filesystem data serializer**](packages/data-serializer-filesystem/) for serializing to local files on disk.

The following dataset summaries have been implemented:

* [**VoID description**](packages/dataset-summary-void/) following the [Vocabulary of Interlinked Datasets (VoID)](https://www.w3.org/TR/void/). This summary provides, for example, the cardinalities of different predicates, as well as the total dataset size in triples, as well as the unique subject, predicate and object counts.
* [**Bloom filter**](packages/dataset-summary-bloom/) as an approximate membership function (AMF) for checking whether the dataset contains specific entries. The generation is done using the [Bloem](https://github.com/wiedi/node-bloem) package.

The following additional [Community Solid Server](https://github.com/CommunitySolidServer/CommunitySolidServer) components have been implemented:

* [**FixedContentTypeMapperMeta**](packages/fixed-content-type-mapper-meta/) that is identical to the original `FixedContentTypeMapper` except it allows serving `.meta` files without the configured extension, by not processing requests for those paths.
* [**MetricsHandler**](packages/metrics-handler/) that collects metrics about requests and exposes them at a configurable path on the server.

## Installing

The tool is not published anywhere, because it is not intended for actual use and is only intended for experiments. After cloning the repository, it should be sufficient to install the dependencies:

    $ yarn install --frozen-lockfile --ignore-engines

The packages should be built automatically. The configurations are in [engines/catalogue-config/config](engines/catalogue-config/config).

## Usage

The primary use case of this tool is to generate summaries for the data from [SolidBench](https://github.com/SolidBench/SolidBench.js) for benchmarking purposes. The default configuration generates summaries for each pod, and places them in a file called `.meta` at the pod root. Using [the provided custom `FixedContentTypeMapper`](packages/fixed-content-type-mapper-meta/) implementation for the [Community Solid Server](https://github.com/CommunitySolidServer/CommunitySolidServer/), the summaries are then served at the pod root URI when serving the dataset using the serve command from SolidBench.

To generate SolidBench data:

    $ yarn solidbench-generate

The VoID descriptions can be generated with:

    $ yarn catalogue --config ./engines/catalogue-config/config/generator/void.json

The Bloom filters can be generated with:

    $ yarn catalogue --config ./engines/catalogue-config/config/generator/bloom.json

The generated dataset can be served with the custom `FixedContentTypeMapper` and `MetricsHandler` with:

    $ yarn serve

The summaries can then be found amongst the metadata at pod roots, for example:

    $ curl http://localhost:3000/pods/00000000000000000065/

## Docker

There is a Dockerfile provided that packs up the application and the generated data from `out-fragments/` into an image than can be used to serve it. This is experimental and is only intended for local use when needing the generated data elsewhere in a neat package. The Docker image can be built with:

    $ docker build --network host --tag solidlab/catalogue:dev .

And then ran elsewhere on the local system, `--init` seems necessary to make the image accept ctrl+c:

    $ docker run --init --network host solidlab/catalogue:dev

The image at `solidlab/catalogue` should not exist on Docker Hub, which is why it might be useful to use. Other tags should work, as well.

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
