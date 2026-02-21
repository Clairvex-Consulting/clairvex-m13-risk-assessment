"""Pydantic data models for EBIOS RM workshops."""

from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, Field


class Asset(BaseModel):
    """A critical asset identified in the scope."""

    name: str
    description: str
    criticality: str = Field(description="Niveau de criticité: faible, moyen, élevé, critique")


class SecurityMeasure(BaseModel):
    """An existing or planned security measure."""

    name: str
    description: str
    category: str = Field(description="Catégorie: technique, organisationnel, physique")


class Atelier1Result(BaseModel):
    """Results of Atelier 1 - Cadrage et socle de sécurité."""

    scope_description: str = Field(description="Description du périmètre d'étude")
    mission: str = Field(description="Mission et activités principales de l'organisation")
    critical_assets: list[Asset] = Field(description="Biens essentiels identifiés")
    existing_measures: list[SecurityMeasure] = Field(description="Mesures de sécurité existantes")
    security_gaps: list[str] = Field(description="Lacunes de sécurité identifiées")


class RiskSource(BaseModel):
    """A risk source (threat actor) identified."""

    name: str
    category: str = Field(description="Catégorie: cybercriminel, état, concurrent, interne, etc.")
    motivation: str
    capability: str = Field(description="Niveau de capacité: faible, moyen, élevé, très élevé")
    pertinence: str = Field(description="Pertinence: faible, moyen, élevé")


class Atelier2Result(BaseModel):
    """Results of Atelier 2 - Sources de risque."""

    risk_sources: list[RiskSource] = Field(description="Sources de risque identifiées")
    retained_sources: list[str] = Field(description="Sources de risque retenues pour la suite")
    threat_objectives: list[str] = Field(description="Objectifs visés par les sources de risque")


class StrategicScenario(BaseModel):
    """A strategic attack scenario."""

    id: str
    title: str
    risk_source: str
    target_asset: str
    attack_path: str = Field(description="Chemin d'attaque de haut niveau")
    gravity: str = Field(description="Gravité: 1-faible, 2-significatif, 3-grave, 4-critique")
    likelihood: str = Field(description="Vraisemblance: 1-faible, 2-significatif, 3-élevé, 4-très élevé")


class Atelier3Result(BaseModel):
    """Results of Atelier 3 - Scénarios stratégiques."""

    strategic_scenarios: list[StrategicScenario] = Field(description="Scénarios stratégiques")
    ecosystem_risks: list[str] = Field(description="Risques liés à l'écosystème")
    retained_scenarios: list[str] = Field(description="Scénarios retenus (IDs)")


class OperationalScenario(BaseModel):
    """An operational attack scenario with technical details."""

    id: str
    strategic_scenario_id: str
    title: str
    attack_techniques: list[str] = Field(description="Techniques d'attaque (ex: MITRE ATT&CK)")
    attack_sequence: list[str] = Field(description="Séquence d'attaque étape par étape")
    severity: str = Field(description="Sévérité: 1-faible, 2-significatif, 3-grave, 4-critique")
    likelihood: str = Field(description="Vraisemblance: 1-faible, 2-significatif, 3-élevé, 4-très élevé")


class Atelier4Result(BaseModel):
    """Results of Atelier 4 - Scénarios opérationnels."""

    operational_scenarios: list[OperationalScenario] = Field(description="Scénarios opérationnels")
    risk_level: str = Field(description="Niveau de risque global: faible, moyen, élevé, critique")


class RiskTreatmentMeasure(BaseModel):
    """A risk treatment measure."""

    id: str
    scenario_ids: list[str] = Field(description="IDs des scénarios adressés")
    title: str
    description: str
    category: str = Field(description="Catégorie: technique, organisationnel, physique, juridique")
    priority: str = Field(description="Priorité: P1-immédiat, P2-court terme, P3-moyen terme, P4-long terme")
    estimated_cost: Optional[str] = Field(default=None, description="Estimation du coût: faible, moyen, élevé")
    residual_risk: str = Field(description="Risque résiduel après mesure: faible, moyen, élevé, critique")


class Atelier5Result(BaseModel):
    """Results of Atelier 5 - Traitement du risque."""

    treatment_measures: list[RiskTreatmentMeasure] = Field(description="Mesures de traitement")
    residual_risks: list[str] = Field(description="Risques résiduels acceptés")
    security_plan_summary: str = Field(description="Résumé du plan de sécurité")
    overall_residual_risk: str = Field(description="Niveau de risque résiduel global")


class EBIOSReport(BaseModel):
    """Complete EBIOS RM risk assessment report."""

    context_description: str = Field(description="Description contextuelle d'entrée")
    atelier1: Atelier1Result
    atelier2: Atelier2Result
    atelier3: Atelier3Result
    atelier4: Atelier4Result
    atelier5: Atelier5Result
