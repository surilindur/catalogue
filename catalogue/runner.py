from argparse import ArgumentParser, Namespace, BooleanOptionalAction
from pathlib import Path
from typing import Dict
from rdflib.graph import Graph
from logging import basicConfig, info, debug, INFO, DEBUG, ERROR
from string import digits

from voiddescription import generate_void

log_levels: Dict[str, int] = {
    "error": ERROR,
    "info": INFO,
    "debug": DEBUG,
}


class CatalogueNamespace(Namespace):
    log_level: str
    path: Path
    void_description: bool
    bloom_filter: bool
    root: str


def parse_args() -> CatalogueNamespace:
    parser: ArgumentParser = ArgumentParser()
    parser.add_argument(
        "--log-level",
        type=str,
        choices=log_levels.keys(),
        default="info",
        help="The log level to use",
    )
    parser.add_argument(
        "--path",
        type=Path,
        required=True,
        help="The path to SolidBench pods folder on disk",
    )
    parser.add_argument(
        "--root",
        type=str,
        required=True,
        help="The root IRI from which the pods are being served",
    )
    parser.add_argument(
        "--void-description",
        action=BooleanOptionalAction,
        help="Generate VoID dataset description for each pod",
    )
    parser.add_argument(
        "--bloom-filter",
        action=BooleanOptionalAction,
        help="Generate Bloom filters for each pod",
    )

    args: CatalogueNamespace = parser.parse_args(namespace=CatalogueNamespace)

    basicConfig(
        format="{asctime} | {levelname: <8s} | {message}",
        datefmt="%Y-%m-%d %H:%M:%S",
        style="{",
        level=log_levels[args.log_level],
        encoding="utf-8",
    )

    return parser.parse_args()


def generate_for_pod(path: Path, root: str, void: bool, bloom: bool) -> None:
    debug(f"Generating for {path}")
    output: Graph = Graph()
    if void:
        output += generate_void(root, path)
    if bloom:
        pass
    output_path: Path = path.joinpath(".meta")
    info(f"Serialize {output_path}")
    output.serialize(
        destination=output_path,
        format="nt",
        encoding="utf-8",
    )


def main() -> None:
    args: CatalogueNamespace = parse_args()
    info(f"Running in {args.path}")
    for pod in args.path.iterdir():
        if set(pod.name).issubset(digits):
            generate_for_pod(
                path=pod,
                root=args.root,
                void=args.void_description,
                bloom=args.bloom_filter,
            )
    info("Finished")


if __name__ == "__main__":
    main()
