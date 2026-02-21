"""Atelier 3 - Scénarios stratégiques."""

from __future__ import annotations

import logging

from ..llm.client import OllamaClient
from ..models import Atelier1Result, Atelier2Result, Atelier3Result

logger = logging.getLogger(__name__)

_SYSTEM = (
    "Tu es un expert en cybersécurité certifié EBIOS RM. "
    "Tu analyses les risques selon la méthode EBIOS Risk Manager de l'ANSSI."
)

_PROMPT_TEMPLATE = """
Contexte organisationnel :
{context}

Sources de risque retenues (Atelier 2) :
{sources}

Biens essentiels (Atelier 1) :
{assets}

En tant qu'expert EBIOS RM, réalise l'Atelier 3 - Scénarios stratégiques.

Génère un objet JSON avec exactement la structure suivante :
{{
  "strategic_scenarios": [
    {{
      "id": "SS-01",
      "title": "Titre du scénario",
      "risk_source": "Source de risque",
      "target_asset": "Bien essentiel ciblé",
      "attack_path": "Chemin d'attaque de haut niveau",
      "gravity": "1|2|3|4",
      "likelihood": "1|2|3|4"
    }}
  ],
  "ecosystem_risks": [
    "Risque écosystème 1",
    "Risque écosystème 2"
  ],
  "retained_scenarios": ["SS-01", "SS-02"]
}}

Gravité et vraisemblance : 1=faible, 2=significatif, 3=grave/élevé, 4=critique/très élevé.
Génère au minimum 3 scénarios stratégiques distincts.
"""


def generate_atelier3(
    context: str,
    atelier1: Atelier1Result,
    atelier2: Atelier2Result,
    client: OllamaClient,
) -> Atelier3Result:
    """Generate Atelier 3 results.

    Args:
        context: Contextual description of the organisation.
        atelier1: Results from Atelier 1.
        atelier2: Results from Atelier 2.
        client: Configured :class:`OllamaClient` instance.

    Returns:
        :class:`Atelier3Result` parsed from the model response.
    """
    logger.info("Generating Atelier 3 - Scénarios stratégiques")
    sources_summary = "\n".join(
        f"- {s.name} ({s.category}): motivation={s.motivation}, capacité={s.capability}"
        for s in atelier2.risk_sources
        if s.name in atelier2.retained_sources
    ) or "\n".join(
        f"- {s.name} ({s.category})"
        for s in atelier2.risk_sources
    )
    assets_summary = "\n".join(
        f"- {a.name} ({a.criticality})"
        for a in atelier1.critical_assets
    )
    prompt = _PROMPT_TEMPLATE.format(
        context=context, sources=sources_summary, assets=assets_summary
    )
    data = client.generate_json(prompt, system=_SYSTEM)
    return Atelier3Result(**data)
