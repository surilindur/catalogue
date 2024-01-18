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

These still need to be tested.

## Development Setup

The project can be cloned, after which the dependencies can be installed and the project built:

```bash
yarn install --immutable
```

There are no unit tests and nothing is guaranteed to function as one would expect it to.

## Issues

Please feel free to report any issues on the GitHub issue tracker, but do note that this is just a small set of scripts and is not intended for actual use.

## License

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
