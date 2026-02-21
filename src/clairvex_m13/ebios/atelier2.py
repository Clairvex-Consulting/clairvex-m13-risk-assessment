"""Atelier 2 - Sources de risque."""

from __future__ import annotations

import logging

from ..llm.client import OllamaClient
from ..models import Atelier1Result, Atelier2Result

logger = logging.getLogger(__name__)

_SYSTEM = (
    "Tu es un expert en cybersécurité certifié EBIOS RM. "
    "Tu analyses les risques selon la méthode EBIOS Risk Manager de l'ANSSI."
)

_PROMPT_TEMPLATE = """
Contexte organisationnel :
{context}

Biens essentiels identifiés (Atelier 1) :
{assets}

En tant qu'expert EBIOS RM, réalise l'Atelier 2 - Sources de risque.

Génère un objet JSON avec exactement la structure suivante :
{{
  "risk_sources": [
    {{
      "name": "Nom de la source",
      "category": "cybercriminel|état|concurrent|interne|hacktiviste|script-kiddie",
      "motivation": "Motivation principale",
      "capability": "faible|moyen|élevé|très élevé",
      "pertinence": "faible|moyen|élevé"
    }}
  ],
  "retained_sources": [
    "Source retenue 1",
    "Source retenue 2"
  ],
  "threat_objectives": [
    "Objectif visé 1",
    "Objectif visé 2"
  ]
}}

Identifie au minimum 4 sources de risque diversifiées et sélectionne les plus pertinentes.
"""


def generate_atelier2(
    context: str, atelier1: Atelier1Result, client: OllamaClient
) -> Atelier2Result:
    """Generate Atelier 2 results.

    Args:
        context: Contextual description of the organisation.
        atelier1: Results from Atelier 1.
        client: Configured :class:`OllamaClient` instance.

    Returns:
        :class:`Atelier2Result` parsed from the model response.
    """
    logger.info("Generating Atelier 2 - Sources de risque")
    assets_summary = "\n".join(
        f"- {a.name} ({a.criticality}): {a.description}"
        for a in atelier1.critical_assets
    )
    prompt = _PROMPT_TEMPLATE.format(context=context, assets=assets_summary)
    data = client.generate_json(prompt, system=_SYSTEM)
    return Atelier2Result(**data)
