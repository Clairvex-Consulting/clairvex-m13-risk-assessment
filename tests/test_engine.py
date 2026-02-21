"""Unit tests for the RiskAssessmentEngine."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest

from clairvex_m13.engine import RiskAssessmentEngine
from clairvex_m13.models import (
    Atelier1Result,
    Atelier2Result,
    Atelier3Result,
    Atelier4Result,
    Atelier5Result,
    EBIOSReport,
)

CONTEXT = "Banque de détail opérant en France avec des services en ligne."

# Minimal valid payloads reused from test_ebios_ateliers
_A1 = Atelier1Result(
    scope_description="SI bancaire",
    mission="Services bancaires",
    critical_assets=[
        {"name": "Core Banking", "description": "Système central", "criticality": "critique"}
    ],
    existing_measures=[
        {"name": "Firewall", "description": "Pare-feu", "category": "technique"}
    ],
    security_gaps=["Pas de WAF"],
)

_A2 = Atelier2Result(
    risk_sources=[
        {
            "name": "Fraud gang",
            "category": "cybercriminel",
            "motivation": "Financier",
            "capability": "élevé",
            "pertinence": "élevé",
        }
    ],
    retained_sources=["Fraud gang"],
    threat_objectives=["Fraude"],
)

_A3 = Atelier3Result(
    strategic_scenarios=[
        {
            "id": "SS-01",
            "title": "Fraude via API",
            "risk_source": "Fraud gang",
            "target_asset": "Core Banking",
            "attack_path": "API exploitation",
            "gravity": "4",
            "likelihood": "3",
        }
    ],
    ecosystem_risks=["Partenaire PSP"],
    retained_scenarios=["SS-01"],
)

_A4 = Atelier4Result(
    operational_scenarios=[
        {
            "id": "SO-01",
            "strategic_scenario_id": "SS-01",
            "title": "Exploitation API sans authentification",
            "attack_techniques": ["T1190 - Exploit Public-Facing Application"],
            "attack_sequence": ["Scan API", "Exploitation vulnérabilité"],
            "severity": "4",
            "likelihood": "3",
        }
    ],
    risk_level="critique",
)

_A5 = Atelier5Result(
    treatment_measures=[
        {
            "id": "M-01",
            "scenario_ids": ["SO-01"],
            "title": "WAF",
            "description": "Déploiement WAF",
            "category": "technique",
            "priority": "P1",
            "estimated_cost": "moyen",
            "residual_risk": "moyen",
        }
    ],
    residual_risks=["Risque résiduel acceptable"],
    security_plan_summary="Plan WAF 3 mois",
    overall_residual_risk="moyen",
)


class TestRiskAssessmentEngine:
    def _make_engine_with_mocked_client(self) -> RiskAssessmentEngine:
        mock_client = MagicMock()
        return RiskAssessmentEngine(_client=mock_client)

    def test_run_returns_ebios_report(self):
        engine = self._make_engine_with_mocked_client()
        with (
            patch("clairvex_m13.engine.generate_atelier1", return_value=_A1),
            patch("clairvex_m13.engine.generate_atelier2", return_value=_A2),
            patch("clairvex_m13.engine.generate_atelier3", return_value=_A3),
            patch("clairvex_m13.engine.generate_atelier4", return_value=_A4),
            patch("clairvex_m13.engine.generate_atelier5", return_value=_A5),
        ):
            report = engine.run(CONTEXT)

        assert isinstance(report, EBIOSReport)
        assert report.context_description == CONTEXT

    def test_run_calls_ateliers_in_order(self):
        engine = self._make_engine_with_mocked_client()
        call_order: list[str] = []

        def _a1(*a, **kw):
            call_order.append("a1")
            return _A1

        def _a2(*a, **kw):
            call_order.append("a2")
            return _A2

        def _a3(*a, **kw):
            call_order.append("a3")
            return _A3

        def _a4(*a, **kw):
            call_order.append("a4")
            return _A4

        def _a5(*a, **kw):
            call_order.append("a5")
            return _A5

        with (
            patch("clairvex_m13.engine.generate_atelier1", side_effect=_a1),
            patch("clairvex_m13.engine.generate_atelier2", side_effect=_a2),
            patch("clairvex_m13.engine.generate_atelier3", side_effect=_a3),
            patch("clairvex_m13.engine.generate_atelier4", side_effect=_a4),
            patch("clairvex_m13.engine.generate_atelier5", side_effect=_a5),
        ):
            engine.run(CONTEXT)

        assert call_order == ["a1", "a2", "a3", "a4", "a5"]

    def test_all_five_ateliers_in_report(self):
        engine = self._make_engine_with_mocked_client()
        with (
            patch("clairvex_m13.engine.generate_atelier1", return_value=_A1),
            patch("clairvex_m13.engine.generate_atelier2", return_value=_A2),
            patch("clairvex_m13.engine.generate_atelier3", return_value=_A3),
            patch("clairvex_m13.engine.generate_atelier4", return_value=_A4),
            patch("clairvex_m13.engine.generate_atelier5", return_value=_A5),
        ):
            report = engine.run(CONTEXT)

        assert report.atelier1 is _A1
        assert report.atelier2 is _A2
        assert report.atelier3 is _A3
        assert report.atelier4 is _A4
        assert report.atelier5 is _A5

    def test_context_manager_closes_client(self):
        mock_client = MagicMock()
        engine = RiskAssessmentEngine(_client=mock_client)
        with engine:
            pass
        mock_client.close.assert_called_once()
