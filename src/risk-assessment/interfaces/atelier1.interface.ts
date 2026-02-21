/**
 * Niveaux d'impact EBIOS RM (1-4).
 */
export type NiveauImpact = 1 | 2 | 3 | 4;

/**
 * Niveaux de vraisemblance EBIOS RM (1-4).
 */
export type NiveauVraisemblance = 1 | 2 | 3 | 4;

/**
 * Valeur métier avec ses critères de sécurité (C-I-D-T).
 */
export interface ValeurMetier {
  /** Nom de la valeur métier */
  nom: string;
  /** Description de la valeur métier */
  description: string;
  /** Besoin en Confidentialité (1-4) */
  confidentialite: NiveauImpact;
  /** Besoin en Intégrité (1-4) */
  integrite: NiveauImpact;
  /** Besoin en Disponibilité (1-4) */
  disponibilite: NiveauImpact;
  /** Besoin en Traçabilité (1-4) */
  tracabilite: NiveauImpact;
}

/**
 * Événement redouté associé à une valeur métier.
 */
export interface EvenementRedoute {
  /** Identifiant unique */
  id: string;
  /** Description de l'événement redouté */
  description: string;
  /** Valeur métier impactée */
  valeurMetierImpactee: string;
  /** Critère de sécurité affecté */
  critereAffecte: 'Confidentialité' | 'Intégrité' | 'Disponibilité' | 'Traçabilité';
  /** Niveau d'impact (1-4) */
  niveauImpact: NiveauImpact;
}

/**
 * Résultat de l'Atelier 1 - Cadrage et Socle de Sécurité.
 */
export interface ResultatAtelier1 {
  /** Périmètre de l'analyse */
  perimetre: string;
  /** Valeurs métier identifiées */
  valeursMetier: ValeurMetier[];
  /** Événements redoutés */
  evenementsRedoutes: EvenementRedoute[];
  /** Socle de sécurité existant */
  socleSécurité: string[];
}
