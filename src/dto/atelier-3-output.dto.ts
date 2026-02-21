export interface AttackPath {
  step: number;
  description: string;
  targetedAsset: string;
}

export interface StrategicScenario {
  id: string;
  name: string;
  sourceRisque: string;
  objectifVise: string;
  attackPaths: AttackPath[];
  likelihood: number;
  impact: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  summary: string;
}

export class Atelier3OutputDto {
  strategicScenarios: StrategicScenario[];
  riskMatrix: { likelihood: number; impact: number; scenario: string }[];
  prioritizedScenarios: StrategicScenario[];
}
