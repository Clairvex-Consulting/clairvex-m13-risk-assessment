# CLAIRVEX M13 - Instructions Copilot

## Contexte
Module d'analyse de risque cyber EBIOS RM v1.5 avec LLM local Mistral 7B.

## Méthodologie EBIOS RM (5 Ateliers)
1. **Atelier 1**: Cadrage, valeurs métier (C-I-D-T), événements redoutés (ER), socle sécurité
2. **Atelier 2**: Sources de risque (Étatique, Organisé, Idéologique, Opportuniste), objectifs visés (OV), couples SR/OV
3. **Atelier 3**: Scénarios stratégiques, chemins d'attaque, vraisemblance × impact = risque brut
4. **Atelier 4**: Scénarios opérationnels, TTPs MITRE ATT&CK, mesures de sécurité, risque résiduel
5. **Atelier 5**: Plan de traitement, options (réduire/transférer/éviter/accepter), plan sécurité 3 ans

## Stack Technique
- NestJS 10+ avec TypeScript strict
- LangChain (@langchain/community) pour orchestration LLM
- Ollama local (Mistral 7B Instruct)
- class-validator pour DTOs
- Jest pour tests

## Contraintes Code
- Tous les prompts LLM en FRANÇAIS
- Réponses structurées JSON uniquement
- Pas de données sensibles hardcodées
- Services stateless, testables
- Documentation JSDoc obligatoire

## Structure Fichiers Attendue
