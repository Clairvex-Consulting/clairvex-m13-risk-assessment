/**
 * Catégories de sources de risque EBIOS RM.
 */
export type CategorieSR =
  | 'Étatique'
  | 'Organisé'
  | 'Idéologique'
  | 'Opportuniste';

/**
 * Source de risque identifiée.
 */
export interface SourceRisque {
  /** Identifiant unique */
  id: string;
  /** Nom ou type de la source */
  nom: string;
  /** Catégorie de la source */
  categorie: CategorieSR;
  /** Motivation principale */
  motivation: string;
  /** Niveau de ressources (1-4) */
  niveauRessources: 1 | 2 | 3 | 4;
  /** Niveau d'activité (1-4) */
  niveauActivite: 1 | 2 | 3 | 4;
}

/**
 * Objectif visé par une source de risque.
 */
export interface ObjectifVise {
  /** Identifiant unique */
  id: string;
  /** Description de l'objectif */
  description: string;
  /** Valeur métier ciblée */
  valeurMetierCiblee: string;
}

/**
 * Couple Source de Risque / Objectif Visé.
 */
export interface CoupleSROV {
  /** Identifiant unique */
  id: string;
  /** Source de risque */
  sourceRisque: SourceRisque;
  /** Objectif visé */
  objectifVise: ObjectifVise;
  /** Niveau de pertinence (1-4) */
  pertinence: 1 | 2 | 3 | 4;
}

/**
 * Résultat de l'Atelier 2 - Sources de Risque.
 */
export interface ResultatAtelier2 {
  /** Sources de risque identifiées */
  sourcesRisque: SourceRisque[];
  /** Objectifs visés */
  objectifsVises: ObjectifVise[];
  /** Couples SR/OV retenus */
  couplesSROV: CoupleSROV[];
}
