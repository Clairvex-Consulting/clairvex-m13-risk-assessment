"""Unit tests for EBIOS RM workshop generators."""

from __future__ import annotations

import json
from unittest.mock import MagicMock

import pytest

from clairvex_m13.ebios import (
    generate_atelier1,
    generate_atelier2,
    generate_atelier3,
    generate_atelier4,
    generate_atelier5,
)
from clairvex_m13.models import (
    Atelier1Result,
    Atelier2Result,
    Atelier3Result,
    Atelier4Result,
    Atelier5Result,
)

# ---------------------------------------------------------------------------
# Fixture helpers
# ---------------------------------------------------------------------------

CONTEXT = "Hôpital public gérant des dossiers patients sensibles et connecté à internet."


def _make_client(return_value: dict) -> MagicMock:
    """Return a mock OllamaClient whose generate_json returns return_value."""
    client = MagicMock()
    client.generate_json.return_value = return_value
    return client


ATELIER1_PAYLOAD = {
    "scope_description": "Système d'information hospitalier",
    "mission": "Soins aux patients et gestion administrative",
    "critical_assets": [
        {"name": "Dossiers patients", "description": "DMP électroniques", "criticality": "critique"},
        {"name": "PACS", "description": "Imagerie médicale", "criticality": "élevé"},
        {"name": "SI RH", "description": "Données du personnel", "criticality": "moyen"},
    ],
    "existing_measures": [
        {"name": "Firewall", "description": "Pare-feu périmétrique", "category": "technique"},
        {"name": "Charte SI", "description": "Charte utilisateurs", "category": "organisationnel"},
    ],
    "security_gaps": [
        "Absence de MFA",
        "Sauvegardes non testées",
        "Pas de SIEM",
    ],
}

ATELIER2_PAYLOAD = {
    "risk_sources": [
        {
            "name": "Cybercriminels ransomware",
            "category": "cybercriminel",
            "motivation": "Gain financier",
            "capability": "élevé",
            "pertinence": "élevé",
        },
        {
            "name": "Employé malveillant",
            "category": "interne",
            "motivation": "Vengeance",
            "capability": "moyen",
            "pertinence": "moyen",
        },
    ],
    "retained_sources": ["Cybercriminels ransomware"],
    "threat_objectives": ["Chiffrer les données", "Exfiltrer les DMP"],
}

ATELIER3_PAYLOAD = {
    "strategic_scenarios": [
        {
            "id": "SS-01",
            "title": "Ransomware via phishing",
            "risk_source": "Cybercriminels ransomware",
            "target_asset": "Dossiers patients",
            "attack_path": "Phishing → compromission poste → propagation",
            "gravity": "4",
            "likelihood": "3",
        }
    ],
    "ecosystem_risks": ["Sous-traitant non sécurisé"],
    "retained_scenarios": ["SS-01"],
}

ATELIER4_PAYLOAD = {
    "operational_scenarios": [
        {
            "id": "SO-01",
            "strategic_scenario_id": "SS-01",
            "title": "Attaque ransomware via spearphishing",
            "attack_techniques": [
                "T1566.001 - Spearphishing Attachment",
                "T1486 - Data Encrypted for Impact",
            ],
            "attack_sequence": [
                "Reconnaissance OSINT",
                "Envoi email phishing",
                "Exécution payload",
                "Chiffrement fichiers",
            ],
            "severity": "4",
            "likelihood": "3",
        }
    ],
    "risk_level": "critique",
}

ATELIER5_PAYLOAD = {
    "treatment_measures": [
        {
            "id": "M-01",
            "scenario_ids": ["SO-01"],
            "title": "Déploiement MFA",
            "description": "Authentification multi-facteurs sur tous les comptes",
            "category": "technique",
            "priority": "P1",
            "estimated_cost": "moyen",
            "residual_risk": "moyen",
        }
    ],
    "residual_risks": ["Risque résiduel faible après MFA"],
    "security_plan_summary": "Plan de sécurité sur 12 mois",
    "overall_residual_risk": "moyen",
}


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


class TestAtelier1:
    def test_returns_atelier1_result(self):
        client = _make_client(ATELIER1_PAYLOAD)
        result = generate_atelier1(CONTEXT, client)
        assert isinstance(result, Atelier1Result)

    def test_critical_assets_populated(self):
        client = _make_client(ATELIER1_PAYLOAD)
        result = generate_atelier1(CONTEXT, client)
        assert len(result.critical_assets) == 3
        assert result.critical_assets[0].name == "Dossiers patients"

    def test_security_gaps_populated(self):
        client = _make_client(ATELIER1_PAYLOAD)
        result = generate_atelier1(CONTEXT, client)
        assert len(result.security_gaps) == 3

    def test_calls_generate_json_with_context(self):
        client = _make_client(ATELIER1_PAYLOAD)
        generate_atelier1(CONTEXT, client)
        call_args = client.generate_json.call_args
        assert CONTEXT in call_args[0][0]


class TestAtelier2:
    @pytest.fixture()
    def atelier1(self):
        return Atelier1Result(**ATELIER1_PAYLOAD)

    def test_returns_atelier2_result(self, atelier1):
        client = _make_client(ATELIER2_PAYLOAD)
        result = generate_atelier2(CONTEXT, atelier1, client)
        assert isinstance(result, Atelier2Result)

    def test_risk_sources_populated(self, atelier1):
        client = _make_client(ATELIER2_PAYLOAD)
        result = generate_atelier2(CONTEXT, atelier1, client)
        assert len(result.risk_sources) == 2

    def test_prompt_includes_asset_names(self, atelier1):
        client = _make_client(ATELIER2_PAYLOAD)
        generate_atelier2(CONTEXT, atelier1, client)
        prompt = client.generate_json.call_args[0][0]
        assert "Dossiers patients" in prompt


class TestAtelier3:
    @pytest.fixture()
    def atelier1(self):
        return Atelier1Result(**ATELIER1_PAYLOAD)

    @pytest.fixture()
    def atelier2(self):
        return Atelier2Result(**ATELIER2_PAYLOAD)

    def test_returns_atelier3_result(self, atelier1, atelier2):
        client = _make_client(ATELIER3_PAYLOAD)
        result = generate_atelier3(CONTEXT, atelier1, atelier2, client)
        assert isinstance(result, Atelier3Result)

    def test_strategic_scenarios_populated(self, atelier1, atelier2):
        client = _make_client(ATELIER3_PAYLOAD)
        result = generate_atelier3(CONTEXT, atelier1, atelier2, client)
        assert len(result.strategic_scenarios) == 1
        assert result.strategic_scenarios[0].id == "SS-01"


class TestAtelier4:
    @pytest.fixture()
    def atelier3(self):
        return Atelier3Result(**ATELIER3_PAYLOAD)

    def test_returns_atelier4_result(self, atelier3):
        client = _make_client(ATELIER4_PAYLOAD)
        result = generate_atelier4(CONTEXT, atelier3, client)
        assert isinstance(result, Atelier4Result)

    def test_operational_scenarios_populated(self, atelier3):
        client = _make_client(ATELIER4_PAYLOAD)
        result = generate_atelier4(CONTEXT, atelier3, client)
        assert len(result.operational_scenarios) == 1
        assert result.operational_scenarios[0].id == "SO-01"

    def test_risk_level_set(self, atelier3):
        client = _make_client(ATELIER4_PAYLOAD)
        result = generate_atelier4(CONTEXT, atelier3, client)
        assert result.risk_level == "critique"


class TestAtelier5:
    @pytest.fixture()
    def atelier4(self):
        return Atelier4Result(**ATELIER4_PAYLOAD)

    def test_returns_atelier5_result(self, atelier4):
        client = _make_client(ATELIER5_PAYLOAD)
        result = generate_atelier5(CONTEXT, atelier4, client)
        assert isinstance(result, Atelier5Result)

    def test_treatment_measures_populated(self, atelier4):
        client = _make_client(ATELIER5_PAYLOAD)
        result = generate_atelier5(CONTEXT, atelier4, client)
        assert len(result.treatment_measures) == 1
        assert result.treatment_measures[0].id == "M-01"

    def test_prompt_includes_risk_level(self, atelier4):
        client = _make_client(ATELIER5_PAYLOAD)
        generate_atelier5(CONTEXT, atelier4, client)
        prompt = client.generate_json.call_args[0][0]
        assert "critique" in prompt
