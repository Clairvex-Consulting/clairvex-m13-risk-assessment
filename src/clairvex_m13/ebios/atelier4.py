"""Atelier 4 - Scénarios opérationnels."""

from __future__ import annotations

import logging

from ..llm.client import OllamaClient
from ..models import Atelier3Result, Atelier4Result

logger = logging.getLogger(__name__)

_SYSTEM = (
    "Tu es un expert en cybersécurité certifié EBIOS RM et MITRE ATT&CK. "
    "Tu analyses les risques selon la méthode EBIOS Risk Manager de l'ANSSI."
)

_PROMPT_TEMPLATE = """
Contexte organisationnel :
{context}

Scénarios stratégiques retenus (Atelier 3) :
{scenarios}

En tant qu'expert EBIOS RM, réalise l'Atelier 4 - Scénarios opérationnels.

Génère un objet JSON avec exactement la structure suivante :
{{
  "operational_scenarios": [
    {{
      "id": "SO-01",
      "strategic_scenario_id": "SS-01",
      "title": "Titre du scénario opérationnel",
      "attack_techniques": [
        "T1566.001 - Spearphishing Attachment",
        "T1078 - Valid Accounts"
      ],
      "attack_sequence": [
        "Étape 1: Reconnaissance de la cible",
        "Étape 2: Envoi d'un email de phishing",
        "Étape 3: Exécution du code malveillant"
      ],
      "severity": "1|2|3|4",
      "likelihood": "1|2|3|4"
    }}
  ],
  "risk_level": "faible|moyen|élevé|critique"
}}

Génère un scénario opérationnel détaillé pour chaque scénario stratégique retenu.
Utilise les techniques MITRE ATT&CK pertinentes.
"""


def generate_atelier4(
    context: str, atelier3: Atelier3Result, client: OllamaClient
) -> Atelier4Result:
    """Generate Atelier 4 results.

    Args:
        context: Contextual description of the organisation.
        atelier3: Results from Atelier 3.
        client: Configured :class:`OllamaClient` instance.

    Returns:
        :class:`Atelier4Result` parsed from the model response.
    """
    logger.info("Generating Atelier 4 - Scénarios opérationnels")
    scenarios_summary = "\n".join(
        f"- {s.id}: {s.title} | Source: {s.risk_source} | Cible: {s.target_asset} "
        f"| Gravité: {s.gravity} | Vraisemblance: {s.likelihood}"
        for s in atelier3.strategic_scenarios
        if s.id in atelier3.retained_scenarios
    ) or "\n".join(
        f"- {s.id}: {s.title}"
        for s in atelier3.strategic_scenarios
    )
    prompt = _PROMPT_TEMPLATE.format(context=context, scenarios=scenarios_summary)
    data = client.generate_json(prompt, system=_SYSTEM)
    return Atelier4Result(**data)
