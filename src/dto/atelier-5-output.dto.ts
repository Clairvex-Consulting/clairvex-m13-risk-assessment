export interface SecurityMeasure5 {
  id: string;
  category: string;
  measure: string;
  priority: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
  effort: 'high' | 'medium' | 'low';
  cost: 'high' | 'medium' | 'low';
  effectiveness: number;
  addressesScenarios: string[];
}

export interface ResidualRisk {
  scenarioId: string;
  residualLikelihood: number;
  residualImpact: number;
  residualLevel: 'critical' | 'high' | 'medium' | 'low' | 'acceptable';
  justification: string;
}

export interface RoadmapYear {
  year: number;
  actions: string[];
  expectedRiskReduction: string;
  estimatedBudget: string;
}

export class Atelier5OutputDto {
  treatmentPlan: SecurityMeasure5[];
  residualRisks: ResidualRisk[];
  securityRoadmap: RoadmapYear[];
  kpis: string[];
  executiveSummary: string;
}
