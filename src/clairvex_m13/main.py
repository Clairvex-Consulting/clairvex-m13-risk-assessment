"""CLI entry point for CLAIRVEX M13 Risk Assessment Engine."""

from __future__ import annotations

import argparse
import json
import logging
import sys

from .engine import RiskAssessmentEngine


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="clairvex-m13",
        description="CLAIRVEX M13 - Générateur automatique des 5 ateliers EBIOS RM (Mistral 7B)",
    )
    parser.add_argument(
        "context",
        nargs="?",
        help=(
            "Description contextuelle de l'organisation. "
            "Si absent, la description est lue depuis stdin."
        ),
    )
    parser.add_argument(
        "--ollama-url",
        default="http://localhost:11434",
        help="URL de l'instance Ollama (défaut: http://localhost:11434)",
    )
    parser.add_argument(
        "--model",
        default="mistral",
        help="Modèle Ollama à utiliser (défaut: mistral)",
    )
    parser.add_argument(
        "--output",
        default="-",
        help="Fichier de sortie JSON (défaut: stdout)",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Afficher les logs de progression",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    """CLI entry point.

    Returns:
        Exit code (0 on success, 1 on error).
    """
    parser = _build_parser()
    args = parser.parse_args(argv)

    logging.basicConfig(
        level=logging.INFO if args.verbose else logging.WARNING,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        stream=sys.stderr,
    )

    if args.context:
        context = args.context
    else:
        if sys.stdin.isatty():
            print(
                "Entrez la description contextuelle (terminez avec Ctrl+D) :",
                file=sys.stderr,
            )
        context = sys.stdin.read().strip()

    if not context:
        print("Erreur : la description contextuelle est vide.", file=sys.stderr)
        return 1

    try:
        with RiskAssessmentEngine(
            ollama_url=args.ollama_url, model=args.model
        ) as engine:
            report = engine.run(context)
    except Exception as exc:  # noqa: BLE001
        print(f"Erreur lors de l'analyse : {exc}", file=sys.stderr)
        return 1

    report_json = report.model_dump_json(indent=2)

    if args.output == "-":
        print(report_json)
    else:
        with open(args.output, "w", encoding="utf-8") as fh:
            fh.write(report_json)
        print(f"Rapport sauvegardé dans : {args.output}", file=sys.stderr)

    return 0


if __name__ == "__main__":
    sys.exit(main())
