/**
 * Option de traitement du risque EBIOS RM.
 */
export type OptionTraitement =
  | 'Réduire'
  | 'Transférer'
  | 'Éviter'
  | 'Accepter';

/**
 * Action du plan de traitement.
 */
export interface ActionTraitement {
  /** Identifiant unique */
  id: string;
  /** Intitulé de l'action */
  intitule: string;
  /** Option de traitement choisie */
  option: OptionTraitement;
  /** Scénario opérationnel ciblé */
  scenarioOperationnelId: string;
  /** Mesures de sécurité à implémenter */
  mesuresIds: string[];
  /** Responsable de l'action */
  responsable: string;
  /** Priorité (1=haute, 4=basse) */
  priorite: 1 | 2 | 3 | 4;
  /** Délai cible */
  delai: 'Court terme' | 'Moyen terme' | 'Long terme';
  /** Coût estimé */
  coutEstime: string;
  /** Indicateur de suivi */
  indicateur: string;
}

/**
 * Étape du plan sécurité 3 ans.
 */
export interface EtapePlanSecurite {
  /** Année (1, 2 ou 3) */
  annee: 1 | 2 | 3;
  /** Actions planifiées cette année */
  actions: ActionTraitement[];
  /** Budget estimé pour l'année */
  budgetEstime: string;
  /** Objectifs de sécurité */
  objectifs: string[];
}

/**
 * Résultat de l'Atelier 5 - Plan de Traitement du Risque.
 */
export interface ResultatAtelier5 {
  /** Actions du plan de traitement */
  actionsTraitement: ActionTraitement[];
  /** Plan sécurité sur 3 ans */
  planSecurite3Ans: EtapePlanSecurite[];
  /** Risques résiduels acceptés */
  risquesAcceptes: string[];
  /** Risques résiduels transférés */
  risquesTransferes: string[];
  /** Synthèse du plan */
  synthese: string;
}
