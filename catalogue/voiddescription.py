from rdflib.graph import Graph
from rdflib.term import URIRef
from rdflib.void import generateVoID
from pathlib import Path
from logging import info, debug, error
from typing import Set


def load_data(path: Path) -> Graph:
    debug(f"Loading from {path}")
    paths: Set[Path] = set((path,))
    graph: Graph = Graph()
    while paths:
        entry = paths.pop()
        if entry.is_dir():
            for subentry in entry.iterdir():
                paths.add(subentry)
        elif entry.is_file():
            try:
                debug(f"Parse {entry}")
                graph.parse(location=entry)
            except Exception as ex:
                error(ex)
    return graph


def generate_void(root: str, path: Path) -> Graph:
    data: Graph = load_data(path)
    dataset: URIRef = URIRef(path.name + "/", root)
    void, uri = generateVoID(
        g=data,
        dataset=dataset,
        distinctForPartitions=True,
    )
    info(f"Generated for {uri}")
    return void
