export interface MitreTtp {
  tacticId: string;
  tacticName: string;
  techniqueId: string;
  techniqueName: string;
  description: string;
}

export interface OperationalScenario {
  id: string;
  strategicScenarioId: string;
  name: string;
  description: string;
  mitreTtps: MitreTtp[];
  attackChain: string[];
  detectionDifficulty: 'high' | 'medium' | 'low';
  operationalImpact: string;
  likelihood: number;
  severity: number;
}

export class Atelier4OutputDto {
  operationalScenarios: OperationalScenario[];
  ttpsMapping: MitreTtp[];
  attackChainSummary: string;
}
