# CLAIRVEX M13 - Risk Assessment Engine

Module M13 — Moteur d'analyse de risque cyber avec LLM local (Mistral 7B) générant automatiquement les 5 ateliers EBIOS RM à partir d'une description contextuelle.

## 🎯 Objectif

Automatiser la production des 5 ateliers de la méthode **EBIOS Risk Manager** (ANSSI) à l'aide d'un modèle de langage local (Mistral 7B via [Ollama](https://ollama.com)), sans faire appel à un service cloud.

## 🏗️ Architecture

```
src/clairvex_m13/
├── __init__.py          # Public API
├── engine.py            # Orchestrateur principal (RiskAssessmentEngine)
├── models.py            # Modèles Pydantic (EBIOSReport, Atelier*Result, …)
├── main.py              # CLI entry point
├── llm/
│   └── client.py        # Client HTTP Ollama (OllamaClient)
└── ebios/
    ├── atelier1.py      # Cadrage et socle de sécurité
    ├── atelier2.py      # Sources de risque
    ├── atelier3.py      # Scénarios stratégiques
    ├── atelier4.py      # Scénarios opérationnels
    └── atelier5.py      # Traitement du risque
```

## 📋 Les 5 Ateliers EBIOS RM

| # | Atelier | Description |
|---|---------|-------------|
| 1 | **Cadrage et socle de sécurité** | Périmètre, biens essentiels, mesures existantes, lacunes |
| 2 | **Sources de risque** | Acteurs menaçants, motivations, capacités, pertinence |
| 3 | **Scénarios stratégiques** | Chemins d'attaque de haut niveau, gravité, vraisemblance |
| 4 | **Scénarios opérationnels** | Techniques MITRE ATT&CK, séquences d'attaque détaillées |
| 5 | **Traitement du risque** | Mesures de traitement, risques résiduels, plan de sécurité |

## 🚀 Prérequis

### 1. Installer Ollama

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 2. Télécharger le modèle Mistral 7B

```bash
ollama pull mistral
```

### 3. Installer le module

```bash
pip install -e ".[dev]"
```

## 💻 Utilisation

### Via la CLI

```bash
# Passer le contexte en argument
clairvex-m13 "Hôpital public gérant des dossiers patients sensibles, connecté à internet via un accès VPN, utilisant un système d'information hospitalier (SIH) hébergé en interne."

# Lire le contexte depuis stdin
cat context.txt | clairvex-m13

# Sauvegarder le rapport JSON
clairvex-m13 "..." --output rapport_ebios.json

# Afficher les logs de progression
clairvex-m13 "..." --verbose

# Utiliser un autre modèle ou une instance Ollama distante
clairvex-m13 "..." --model mistral:7b-instruct --ollama-url http://192.168.1.10:11434
```

### Via l'API Python

```python
from clairvex_m13 import RiskAssessmentEngine

context = """
Entreprise de e-commerce opérant en France avec 500 000 clients.
Hébergement cloud AWS. Données bancaires gérées via Stripe.
Équipe de 5 développeurs, pas de RSSI dédié.
"""

with RiskAssessmentEngine() as engine:
    report = engine.run(context)

# Accès aux résultats
print(f"Biens essentiels : {len(report.atelier1.critical_assets)}")
print(f"Sources de risque : {len(report.atelier2.risk_sources)}")
print(f"Scénarios stratégiques : {len(report.atelier3.strategic_scenarios)}")
print(f"Niveau de risque global : {report.atelier4.risk_level}")
print(f"Mesures de traitement : {len(report.atelier5.treatment_measures)}")

# Export JSON
with open("rapport.json", "w") as f:
    f.write(report.model_dump_json(indent=2))
```

## 🧪 Tests

```bash
# Lancer tous les tests
pytest

# Avec couverture de code
pytest --cov=clairvex_m13 --cov-report=term-missing
```

Les tests utilisent des mocks pour l'appel au LLM — aucune instance Ollama n'est nécessaire pour les faire tourner.

## 📊 Format du rapport

Le rapport généré est un objet JSON `EBIOSReport` contenant les 5 ateliers. Exemple de structure :

```json
{
  "context_description": "...",
  "atelier1": {
    "scope_description": "...",
    "mission": "...",
    "critical_assets": [{ "name": "...", "description": "...", "criticality": "critique" }],
    "existing_measures": [{ "name": "...", "description": "...", "category": "technique" }],
    "security_gaps": ["..."]
  },
  "atelier2": {
    "risk_sources": [{ "name": "...", "category": "cybercriminel", "motivation": "...", "capability": "élevé", "pertinence": "élevé" }],
    "retained_sources": ["..."],
    "threat_objectives": ["..."]
  },
  "atelier3": {
    "strategic_scenarios": [{ "id": "SS-01", "title": "...", "gravity": "4", "likelihood": "3", ... }],
    "ecosystem_risks": ["..."],
    "retained_scenarios": ["SS-01"]
  },
  "atelier4": {
    "operational_scenarios": [{ "id": "SO-01", "attack_techniques": ["T1566.001 - ..."], ... }],
    "risk_level": "critique"
  },
  "atelier5": {
    "treatment_measures": [{ "id": "M-01", "priority": "P1", "residual_risk": "moyen", ... }],
    "residual_risks": ["..."],
    "security_plan_summary": "...",
    "overall_residual_risk": "moyen"
  }
}
```

