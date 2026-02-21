"""Main Risk Assessment Engine orchestrating all 5 EBIOS RM workshops."""

from __future__ import annotations

import logging

from .ebios import (
    generate_atelier1,
    generate_atelier2,
    generate_atelier3,
    generate_atelier4,
    generate_atelier5,
)
from .llm.client import OllamaClient
from .models import EBIOSReport

logger = logging.getLogger(__name__)


class RiskAssessmentEngine:
    """Orchestrates the full EBIOS RM risk assessment pipeline.

    The engine calls each of the 5 workshops in sequence, feeding outputs
    from earlier workshops as inputs to later ones.

    Args:
        ollama_url: Base URL of the running Ollama instance.
        model: Ollama model identifier (default: ``mistral``).
        timeout: HTTP request timeout in seconds.
    """

    def __init__(
        self,
        ollama_url: str = "http://localhost:11434",
        model: str = "mistral",
        timeout: float = 300.0,
        *,
        _client: OllamaClient | None = None,
    ) -> None:
        self._client = _client or OllamaClient(base_url=ollama_url, model=model, timeout=timeout)

    def run(self, context: str) -> EBIOSReport:
        """Execute the complete EBIOS RM analysis.

        Args:
            context: Free-text contextual description of the organisation,
                its assets, and its operational environment.

        Returns:
            A fully populated :class:`EBIOSReport` containing results from
            all five workshops.
        """
        logger.info("Starting EBIOS RM risk assessment")

        logger.info("== Atelier 1: Cadrage et socle de sécurité ==")
        atelier1 = generate_atelier1(context, self._client)

        logger.info("== Atelier 2: Sources de risque ==")
        atelier2 = generate_atelier2(context, atelier1, self._client)

        logger.info("== Atelier 3: Scénarios stratégiques ==")
        atelier3 = generate_atelier3(context, atelier1, atelier2, self._client)

        logger.info("== Atelier 4: Scénarios opérationnels ==")
        atelier4 = generate_atelier4(context, atelier3, self._client)

        logger.info("== Atelier 5: Traitement du risque ==")
        atelier5 = generate_atelier5(context, atelier4, self._client)

        logger.info("EBIOS RM risk assessment complete")
        return EBIOSReport(
            context_description=context,
            atelier1=atelier1,
            atelier2=atelier2,
            atelier3=atelier3,
            atelier4=atelier4,
            atelier5=atelier5,
        )

    def close(self) -> None:
        """Release the underlying HTTP client."""
        self._client.close()

    def __enter__(self) -> "RiskAssessmentEngine":
        return self

    def __exit__(self, *args: object) -> None:
        self.close()
