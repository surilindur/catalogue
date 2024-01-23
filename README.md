<p align="center">
    <!--<img alt="logo" src="https://raw.githubusercontent.com/surilindur/catalogue/main/images/logo.svg" width="200">-->
    <strong>Catalogue</strong>
</p>

<p align="center">
  <a href="https://github.com/surilindur/catalogue/actions/workflows/ci.yml"><img alt="CI" src=https://github.com/surilindur/catalogue/actions/workflows/ci.yml/badge.svg?branch=main"></a>
  <a href="https://www.typescriptlang.org/"><img alt="TypeScript" src="https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg"></a>
  <a href="https://opensource.org/licenses/MIT"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg"></a>
</p>

This is an experimental set of small scripts to generate dataset summaries for [SolidBench](https://github.com/SolidBench/SolidBench.js) for benchmarking purposes. These scripts generate summaries for each pod, and place them in a file called `.meta` at the pod root. Using the `FixedContentTypeMapper` implementation from the [Community Solid Server](https://github.com/CommunitySolidServer/CommunitySolidServer/), the summaries are then served at the pod root URI when serving the dataset using the serve command from SolidBench.

The following dataset summaries can be generated:

* **VoID description** following the [Vocabulary of Interlinked Datasets (VoID)](https://www.w3.org/TR/void/).
* **Bloom filter** following the [Membership function vocabulary](http://semweb.mmlab.be/ns/membership), using FNV hashes via the `Bloem` library. The scripts generate filters for subject, predicate and object, as well as a combined filter.

## Development Setup

The project can be cloned, after which the dependencies can be installed and the project built:

```bash
yarn install --immutable
```

There are no unit tests and nothing is guaranteed to function as one would expect it to.

## Example Output

For example, to generate both VoID dataset descriptions and Bloom filters for local SolidBench pods:

```bash
node bin/catalogue.js --pods ../SolidBench.js/out-fragments/http/localhost_3000/pods --voidDescription --bloomFilter
```

This will create something like the following in the `.meta` file at each pod root, overwriting whatever exists currently:

```css
<http://localhost:3000/pods/00000000000000000768/> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://rdfs.org/ns/void#Dataset> .
<http://localhost:3000/pods/00000000000000000768/> <http://rdfs.org/ns/void#uriSpace> "http://localhost:3000/pods/00000000000000000768/" .
<http://localhost:3000/pods/00000000000000000768/> <http://rdfs.org/ns/void#classes> "7"^^<http://www.w3.org/2001/XMLSchema#integer> .
<http://localhost:3000/pods/00000000000000000768/> <http://rdfs.org/ns/void#triples> "4605"^^<http://www.w3.org/2001/XMLSchema#integer> .
<http://localhost:3000/pods/00000000000000000768/> <http://rdfs.org/ns/void#properties> "39"^^<http://www.w3.org/2001/XMLSchema#integer> .
<http://localhost:3000/pods/00000000000000000768/> <http://rdfs.org/ns/void#distinctSubjects> "504"^^<http://www.w3.org/2001/XMLSchema#integer> .
<http://localhost:3000/pods/00000000000000000768/> <http://rdfs.org/ns/void#distinctObjects> "504"^^<http://www.w3.org/2001/XMLSchema#integer> .
<http://localhost:3000/pods/00000000000000000768/> <http://rdfs.org/ns/void#propertyPartition> <http://localhost:3000/pods/00000000000000000768/#c74e2b735dd8dc85ad0ee3510c33925f> .
<http://localhost:3000/pods/00000000000000000768/#c74e2b735dd8dc85ad0ee3510c33925f> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://rdfs.org/ns/void#Dataset> .
<http://localhost:3000/pods/00000000000000000768/#c74e2b735dd8dc85ad0ee3510c33925f> <http://rdfs.org/ns/void#property> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> .
<http://localhost:3000/pods/00000000000000000768/#c74e2b735dd8dc85ad0ee3510c33925f> <http://rdfs.org/ns/void#triples> "479"^^<http://www.w3.org/2001/XMLSchema#integer> .
<http://localhost:3000/pods/00000000000000000768/#c74e2b735dd8dc85ad0ee3510c33925f> <http://rdfs.org/ns/void#distinctSubjects> "461"^^<http://www.w3.org/2001/XMLSchema#integer> .
<http://localhost:3000/pods/00000000000000000768/#c74e2b735dd8dc85ad0ee3510c33925f> <http://rdfs.org/ns/void#distinctObjects> "1"^^<http://www.w3.org/2001/XMLSchema#integer> .
<http://localhost:3000/pods/00000000000000000768/> <http://rdfs.org/ns/void#propertyPartition> <http://localhost:3000/pods/00000000000000000768/#f0098bc290432af7d2fb79a520418a28> .
<http://localhost:3000/pods/00000000000000000768/#f0098bc290432af7d2fb79a520418a28> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://rdfs.org/ns/void#Dataset> .
<http://localhost:3000/pods/00000000000000000768/#f0098bc290432af7d2fb79a520418a28> <http://rdfs.org/ns/void#property> <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/id> .
<http://localhost:3000/pods/00000000000000000768/#f0098bc290432af7d2fb79a520418a28> <http://rdfs.org/ns/void#triples> "447"^^<http://www.w3.org/2001/XMLSchema#integer> .
<http://localhost:3000/pods/00000000000000000768/#f0098bc290432af7d2fb79a520418a28> <http://rdfs.org/ns/void#distinctSubjects> "447"^^<http://www.w3.org/2001/XMLSchema#integer> .
<http://localhost:3000/pods/00000000000000000768/#f0098bc290432af7d2fb79a520418a28> <http://rdfs.org/ns/void#distinctObjects> "1"^^<http://www.w3.org/2001/XMLSchema#integer> .
...
<http://localhost:3000/pods/00000000000000000768/> <http://rdfs.org/ns/void#classPartition> <http://localhost:3000/pods/00000000000000000768/#4e66afe6e9c46f8652f4ee6ec58e70e0> .
<http://localhost:3000/pods/00000000000000000768/#4e66afe6e9c46f8652f4ee6ec58e70e0> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://rdfs.org/ns/void#Dataset> .
<http://localhost:3000/pods/00000000000000000768/#4e66afe6e9c46f8652f4ee6ec58e70e0> <http://rdfs.org/ns/void#class> <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/Person> .
<http://localhost:3000/pods/00000000000000000768/#4e66afe6e9c46f8652f4ee6ec58e70e0> <http://rdfs.org/ns/void#entities> "1"^^<http://www.w3.org/2001/XMLSchema#integer> .
<http://localhost:3000/pods/00000000000000000768/> <http://rdfs.org/ns/void#classPartition> <http://localhost:3000/pods/00000000000000000768/#f56ccc0fc3624881874d73a23da6e2bd> .
<http://localhost:3000/pods/00000000000000000768/#f56ccc0fc3624881874d73a23da6e2bd> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://rdfs.org/ns/void#Dataset> .
<http://localhost:3000/pods/00000000000000000768/#f56ccc0fc3624881874d73a23da6e2bd> <http://rdfs.org/ns/void#class> <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/Noise> .
<http://localhost:3000/pods/00000000000000000768/#f56ccc0fc3624881874d73a23da6e2bd> <http://rdfs.org/ns/void#entities> "11"^^<http://www.w3.org/2001/XMLSchema#integer> .
<http://localhost:3000/pods/00000000000000000768/#filter> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://semweb.mmlab.be/ns/membership#BloomFilter> .
<http://localhost:3000/pods/00000000000000000768/#filter> <http://semweb.mmlab.be/ns/membership#sourceCollection> <http://localhost:3000/pods/00000000000000000768/> .
<http://localhost:3000/pods/00000000000000000768/#filter> <http://semweb.mmlab.be/ns/membership#bitSize> "1024"^^<http://www.w3.org/2001/XMLSchema#integer> .
<http://localhost:3000/pods/00000000000000000768/#filter> <http://semweb.mmlab.be/ns/membership#hashSize> "4"^^<http://www.w3.org/2001/XMLSchema#integer> .
<http://localhost:3000/pods/00000000000000000768/#filter> <http://semweb.mmlab.be/ns/membership#binaryRepresentation> "//////////////////////////9////////////////////////////////////////////////////////9//////////////////////////3///////////////////////////////////////////////////////////8="^^<http://www.w3.org/2001/XMLSchema#base64Binary> .
<http://localhost:3000/pods/00000000000000000768/#filter> <http://semweb.mmlab.be/ns/membership#projectedProperty> <http://www.w3.org/1999/02/22-rdf-syntax-ns#subject> .
<http://localhost:3000/pods/00000000000000000768/#filter> <http://semweb.mmlab.be/ns/membership#projectedProperty> <http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate> .
<http://localhost:3000/pods/00000000000000000768/#filter> <http://semweb.mmlab.be/ns/membership#projectedProperty> <http://www.w3.org/1999/02/22-rdf-syntax-ns#object> .
<http://localhost:3000/pods/00000000000000000768/#filtersubject> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://semweb.mmlab.be/ns/membership#BloomFilter> .
<http://localhost:3000/pods/00000000000000000768/#filtersubject> <http://semweb.mmlab.be/ns/membership#sourceCollection> <http://localhost:3000/pods/00000000000000000768/> .
<http://localhost:3000/pods/00000000000000000768/#filtersubject> <http://semweb.mmlab.be/ns/membership#bitSize> "1024"^^<http://www.w3.org/2001/XMLSchema#integer> .
<http://localhost:3000/pods/00000000000000000768/#filtersubject> <http://semweb.mmlab.be/ns/membership#hashSize> "4"^^<http://www.w3.org/2001/XMLSchema#integer> .
<http://localhost:3000/pods/00000000000000000768/#filtersubject> <http://semweb.mmlab.be/ns/membership#binaryRepresentation> "1be/+/uT0NO3f1/FXU/5X3Fnfd9d/fd/f1n1/XXRtz+3/1udd99RdtXNv31d/X238ev/+3XfX98V39/+d19dXdWF1ff7P95X1/e//7e9d90/Xf19fV5Z99uf8XF/978X/3vZfR9/V3/6/xv/dV3c0X5dWX9bX/d/9Zvz9f+HlvU="^^<http://www.w3.org/2001/XMLSchema#base64Binary> .
<http://localhost:3000/pods/00000000000000000768/#filtersubject> <http://semweb.mmlab.be/ns/membership#projectedProperty> <http://www.w3.org/1999/02/22-rdf-syntax-ns#subject> .
<http://localhost:3000/pods/00000000000000000768/#filterpredicate> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://semweb.mmlab.be/ns/membership#BloomFilter> .
<http://localhost:3000/pods/00000000000000000768/#filterpredicate> <http://semweb.mmlab.be/ns/membership#sourceCollection> <http://localhost:3000/pods/00000000000000000768/> .
<http://localhost:3000/pods/00000000000000000768/#filterpredicate> <http://semweb.mmlab.be/ns/membership#bitSize> "1024"^^<http://www.w3.org/2001/XMLSchema#integer> .
<http://localhost:3000/pods/00000000000000000768/#filterpredicate> <http://semweb.mmlab.be/ns/membership#hashSize> "4"^^<http://www.w3.org/2001/XMLSchema#integer> .
<http://localhost:3000/pods/00000000000000000768/#filterpredicate> <http://semweb.mmlab.be/ns/membership#binaryRepresentation> "BFAICQSBAAEAAQEFABSBEBEACJQBIAAhADAEiBABJEAlGAQBUAGEQgEAvEEAQAAQBQAQEzBgAAAUAAAQAQCAFgAAAQABAAMEURAgoAGAIAQAGAEEAQkAACABQACAEQIBAEQAAgAEEFMAAEEEBAARgRUCAUAABAHAQCABgAQAABA="^^<http://www.w3.org/2001/XMLSchema#base64Binary> .
<http://localhost:3000/pods/00000000000000000768/#filterpredicate> <http://semweb.mmlab.be/ns/membership#projectedProperty> <http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate> .
<http://localhost:3000/pods/00000000000000000768/#filterobject> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://semweb.mmlab.be/ns/membership#BloomFilter> .
<http://localhost:3000/pods/00000000000000000768/#filterobject> <http://semweb.mmlab.be/ns/membership#sourceCollection> <http://localhost:3000/pods/00000000000000000768/> .
<http://localhost:3000/pods/00000000000000000768/#filterobject> <http://semweb.mmlab.be/ns/membership#bitSize> "1024"^^<http://www.w3.org/2001/XMLSchema#integer> .
<http://localhost:3000/pods/00000000000000000768/#filterobject> <http://semweb.mmlab.be/ns/membership#hashSize> "4"^^<http://www.w3.org/2001/XMLSchema#integer> .
<http://localhost:3000/pods/00000000000000000768/#filterobject> <http://semweb.mmlab.be/ns/membership#binaryRepresentation> "/9////////////////////////9//////////////7//////////////////////////3///////f//////9///////////////9f/3///////3////////////////////////3//////3////////////////f//////////8="^^<http://www.w3.org/2001/XMLSchema#base64Binary> .
<http://localhost:3000/pods/00000000000000000768/#filterobject> <http://semweb.mmlab.be/ns/membership#projectedProperty> <http://www.w3.org/1999/02/22-rdf-syntax-ns#object> .
```

## Issues

Please feel free to report any issues on the GitHub issue tracker, but do note that this is just a small set of scripts and is not intended for actual use.

## License

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
