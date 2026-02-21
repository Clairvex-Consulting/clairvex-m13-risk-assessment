"""Atelier 1 - Cadrage et socle de sécurité."""

from __future__ import annotations

import logging

from ..llm.client import OllamaClient
from ..models import Atelier1Result

logger = logging.getLogger(__name__)

_SYSTEM = (
    "Tu es un expert en cybersécurité certifié EBIOS RM. "
    "Tu analyses les risques selon la méthode EBIOS Risk Manager de l'ANSSI."
)

_PROMPT_TEMPLATE = """
Contexte organisationnel :
{context}

En tant qu'expert EBIOS RM, réalise l'Atelier 1 - Cadrage et socle de sécurité.

Génère un objet JSON avec exactement la structure suivante :
{{
  "scope_description": "Description précise du périmètre d'étude",
  "mission": "Mission et activités principales de l'organisation",
  "critical_assets": [
    {{
      "name": "Nom du bien",
      "description": "Description",
      "criticality": "faible|moyen|élevé|critique"
    }}
  ],
  "existing_measures": [
    {{
      "name": "Nom de la mesure",
      "description": "Description",
      "category": "technique|organisationnel|physique"
    }}
  ],
  "security_gaps": [
    "Lacune 1",
    "Lacune 2"
  ]
}}

Identifie au minimum 3 biens essentiels et 3 lacunes de sécurité pertinents.
"""


def generate_atelier1(context: str, client: OllamaClient) -> Atelier1Result:
    """Generate Atelier 1 results from the given context.

    Args:
        context: Contextual description of the organisation.
        client: Configured :class:`OllamaClient` instance.

    Returns:
        :class:`Atelier1Result` parsed from the model response.
    """
    logger.info("Generating Atelier 1 - Cadrage et socle de sécurité")
    prompt = _PROMPT_TEMPLATE.format(context=context)
    data = client.generate_json(prompt, system=_SYSTEM)
    return Atelier1Result(**data)
