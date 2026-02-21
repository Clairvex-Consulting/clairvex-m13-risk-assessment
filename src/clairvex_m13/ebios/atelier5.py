"""Atelier 5 - Traitement du risque."""

from __future__ import annotations

import logging

from ..llm.client import OllamaClient
from ..models import Atelier4Result, Atelier5Result

logger = logging.getLogger(__name__)

_SYSTEM = (
    "Tu es un expert en cybersécurité certifié EBIOS RM et ISO 27001. "
    "Tu analyses les risques selon la méthode EBIOS Risk Manager de l'ANSSI."
)

_PROMPT_TEMPLATE = """
Contexte organisationnel :
{context}

Scénarios opérationnels identifiés (Atelier 4) :
{scenarios}

Niveau de risque global : {risk_level}

En tant qu'expert EBIOS RM, réalise l'Atelier 5 - Traitement du risque.

Génère un objet JSON avec exactement la structure suivante :
{{
  "treatment_measures": [
    {{
      "id": "M-01",
      "scenario_ids": ["SO-01", "SO-02"],
      "title": "Titre de la mesure",
      "description": "Description détaillée de la mesure",
      "category": "technique|organisationnel|physique|juridique",
      "priority": "P1|P2|P3|P4",
      "estimated_cost": "faible|moyen|élevé",
      "residual_risk": "faible|moyen|élevé|critique"
    }}
  ],
  "residual_risks": [
    "Description du risque résiduel accepté 1"
  ],
  "security_plan_summary": "Résumé du plan de sécurité et de la feuille de route",
  "overall_residual_risk": "faible|moyen|élevé|critique"
}}

Priorités : P1=immédiat (<3 mois), P2=court terme (3-6 mois), P3=moyen terme (6-12 mois), P4=long terme (>12 mois).
Génère au minimum une mesure de traitement par scénario opérationnel.
"""


def generate_atelier5(
    context: str, atelier4: Atelier4Result, client: OllamaClient
) -> Atelier5Result:
    """Generate Atelier 5 results.

    Args:
        context: Contextual description of the organisation.
        atelier4: Results from Atelier 4.
        client: Configured :class:`OllamaClient` instance.

    Returns:
        :class:`Atelier5Result` parsed from the model response.
    """
    logger.info("Generating Atelier 5 - Traitement du risque")
    scenarios_summary = "\n".join(
        f"- {s.id} ({s.strategic_scenario_id}): {s.title} "
        f"| Sévérité: {s.severity} | Vraisemblance: {s.likelihood}\n"
        f"  Techniques: {', '.join(s.attack_techniques[:3])}"
        for s in atelier4.operational_scenarios
    )
    prompt = _PROMPT_TEMPLATE.format(
        context=context,
        scenarios=scenarios_summary,
        risk_level=atelier4.risk_level,
    )
    data = client.generate_json(prompt, system=_SYSTEM)
    return Atelier5Result(**data)
