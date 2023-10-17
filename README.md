# Catalogue

This is an experimental set of small scripts to generate dataset summaries primarily for SolidBench. The generation is **not** pipelined and **not** done in a streaming manner, so for very large datasets it will definitely **not function**. The scripts make use of [RDFLib](https://github.com/RDFLib/rdflib). The use case of this set of scripts is to generate dataset summaries for the data from [SolidBench](https://github.com/SolidBench/SolidBench.js) for benchmarking purposes. The tool generates summaries for each pod, and places them in a file called `.meta` at the pod root. Using the `FixedContentTypeMapper` implementation from the [Community Solid Server](https://github.com/CommunitySolidServer/CommunitySolidServer/), the summaries are then served at the pod root URI when serving the dataset using the serve command from SolidBench.

The following dataset summaries can be generated:

* **VoID description** following the [Vocabulary of Interlinked Datasets (VoID)](https://www.w3.org/TR/void/). This is done by simply using the [generateVoID]() function from RDFLib.

## Usage

The tool is not published anywhere, because it is not intended for actual use and is only intended for experiments. After cloning the repository, it should be sufficient to install the dependencies and build:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

The tool can then be used. For example, VoID descriptions can be generated with:

```bash
python catalogue/runner.py --path .../out-fragments/http/localhost_3000/pods/ --root http://localhost:3000/pods/ --void-descriptions
```

## Docker

There is a Dockerfile provided for building the repository into a Docker image:

```bash
docker build --network host --tag solidlab/catalogue:dev .
```

The image can then be used to run the tool directly:

```bash
docker run solidlab/catalogue:dev --help
```

The image is not published anywhere and should not be published anywhere, either.

## Issues

Any issues encountered can be reported via the GitHub issue tracker. However, before reporting issues, please note that this is not a production-ready application and is not intended for everyday use.
