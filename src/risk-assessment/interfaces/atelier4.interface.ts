/**
 * Technique MITRE ATT&CK associée à un scénario opérationnel.
 */
export interface TechniqueATTACK {
  /** Identifiant MITRE ATT&CK (ex: T1566) */
  id: string;
  /** Nom de la technique */
  nom: string;
  /** Tactique associée */
  tactique: string;
  /** Description de la mise en œuvre */
  description: string;
}

/**
 * Mesure de sécurité pour contrer un scénario opérationnel.
 */
export interface MesureSecurite {
  /** Identifiant unique */
  id: string;
  /** Intitulé de la mesure */
  intitule: string;
  /** Type de mesure */
  type: 'Préventive' | 'Détective' | 'Corrective' | 'Dissuasive';
  /** Efficacité estimée (1-4) */
  efficacite: 1 | 2 | 3 | 4;
  /** Coût de mise en œuvre */
  cout: 'Faible' | 'Moyen' | 'Élevé';
  /** Délai de mise en œuvre */
  delai: 'Court terme' | 'Moyen terme' | 'Long terme';
}

/**
 * Scénario opérationnel EBIOS RM.
 */
export interface ScenarioOperationnel {
  /** Identifiant unique */
  id: string;
  /** Scénario stratégique de référence */
  scenarioStrategiqueId: string;
  /** Intitulé du scénario opérationnel */
  intitule: string;
  /** Techniques ATT&CK utilisées */
  techniquesATTACK: TechniqueATTACK[];
  /** Mesures de sécurité recommandées */
  mesuresSecurite: MesureSecurite[];
  /** Vraisemblance résiduelle (1-4) */
  vraisemblanceResiduelle: 1 | 2 | 3 | 4;
  /** Impact résiduel (1-4) */
  impactResiduel: 1 | 2 | 3 | 4;
  /** Risque résiduel calculé */
  risqueResiduel: number;
}

/**
 * Résultat de l'Atelier 4 - Scénarios Opérationnels.
 */
export interface ResultatAtelier4 {
  /** Scénarios opérationnels détaillés */
  scenariosOperationnels: ScenarioOperationnel[];
  /** Synthèse des mesures de sécurité */
  syntheseMesures: {
    /** Total des mesures identifiées */
    totalMesures: number;
    /** Répartition par type */
    repartitionParType: Record<string, number>;
  };
}
