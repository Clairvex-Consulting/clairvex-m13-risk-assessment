/**
 * Chemin d'attaque dans un scénario stratégique.
 */
export interface CheminAttaque {
  /** Étape du chemin */
  etape: number;
  /** Description de l'étape */
  description: string;
  /** Actif ou composant ciblé */
  cibleIntermédiaire: string;
}

/**
 * Scénario stratégique EBIOS RM.
 */
export interface ScenarioStrategique {
  /** Identifiant unique */
  id: string;
  /** Intitulé du scénario */
  intitule: string;
  /** Couple SR/OV associé */
  coupleSROVId: string;
  /** Événement redouté ciblé */
  evenementRedouteId: string;
  /** Chemin d'attaque */
  cheminAttaque: CheminAttaque[];
  /** Niveau de vraisemblance (1-4) */
  vraisemblance: 1 | 2 | 3 | 4;
  /** Niveau d'impact (1-4) */
  impact: 1 | 2 | 3 | 4;
  /** Niveau de risque brut (vraisemblance × impact) */
  risqueBrut: number;
}

/**
 * Résultat de l'Atelier 3 - Scénarios Stratégiques.
 */
export interface ResultatAtelier3 {
  /** Scénarios stratégiques identifiés */
  scenariosStrategiques: ScenarioStrategique[];
  /** Cartographie des risques bruts */
  cartographieRisques: {
    /** Matrice risque [vraisemblance][impact] */
    matrice: number[][];
    /** Scénarios par niveau de risque */
    scenariosParNiveau: Record<string, string[]>;
  };
}
