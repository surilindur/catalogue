# SolidBench Summaries

This repository contains a collection of Python scripts to generate summaries for the RDF data from [SolidBench](https://github.com/SolidBench/SolidBench.js). Currently, the following types of summaries are possible to generate:

* [Vocabulary of Interlinked Datasets (VoID)](https://www.w3.org/TR/void/) for predicate counts, unique subjects, predicates and objects, total triples, etc.

## Running

The easiest way to run the scripts is to create a virtual environment, install the packages and then run `app.py`:

    python -m venv .venv
    source .venv/bin/activate
    python -m pip install -r requirements.txt
    python app.py

## Issues

Any issues encountered can be reported via the GitHub issue tracker. However, before reporting issues, please note that this is not a production-ready application and is not intended for everyday use.
