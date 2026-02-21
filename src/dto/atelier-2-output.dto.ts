export interface RiskSource {
  id: string;
  name: string;
  type: 'APT' | 'cybercriminal' | 'insider' | 'opportunistic' | 'state';
  motivation: string;
  capability: 'high' | 'medium' | 'low';
  pertinence: number;
}

export interface ObjectiveVise {
  id: string;
  description: string;
  targetedAssets: string[];
  riskSourceId: string;
}

export interface SrOvCouple {
  sourceRisque: string;
  objectifVise: string;
  likelihood: number;
  relevance: 'high' | 'medium' | 'low';
}

export class Atelier2OutputDto {
  sourcesDeRisque: RiskSource[];
  objectifsVises: ObjectiveVise[];
  couplesSOV: SrOvCouple[];
  retainedCouples: SrOvCouple[];
}
