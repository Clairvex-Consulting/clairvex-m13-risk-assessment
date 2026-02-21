import { ResultatAtelier1 } from './atelier1.interface';
import { ResultatAtelier2 } from './atelier2.interface';
import { ResultatAtelier3 } from './atelier3.interface';
import { ResultatAtelier4 } from './atelier4.interface';
import { ResultatAtelier5 } from './atelier5.interface';

/**
 * Résultat complet de l'analyse de risque EBIOS RM M13.
 */
export interface RiskAssessmentResult {
  /** Identifiant unique de l'analyse */
  id: string;
  /** Nom de l'organisation ou du système analysé */
  organisation: string;
  /** Horodatage de génération */
  generatedAt: string;
  /** Version de la méthodologie */
  methodologie: 'EBIOS RM v1.5';
  /** Résultats des 5 ateliers */
  ateliers: {
    atelier1: ResultatAtelier1;
    atelier2: ResultatAtelier2;
    atelier3: ResultatAtelier3;
    atelier4: ResultatAtelier4;
    atelier5: ResultatAtelier5;
  };
  /** Niveau de risque global (1-4) */
  niveauRisqueGlobal: 1 | 2 | 3 | 4;
  /** Recommandations prioritaires */
  recommandationsPrioritaires: string[];
}

export { ResultatAtelier1 } from './atelier1.interface';
export { ResultatAtelier2 } from './atelier2.interface';
export { ResultatAtelier3 } from './atelier3.interface';
export { ResultatAtelier4 } from './atelier4.interface';
export { ResultatAtelier5 } from './atelier5.interface';
