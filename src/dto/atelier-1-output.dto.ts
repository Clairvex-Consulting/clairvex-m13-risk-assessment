export interface BusinessValue {
  name: string;
  description: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
}

export interface FearedEvent {
  id: string;
  businessValue: string;
  threat: string;
  impact: string;
  gravity: number;
}

export interface SecurityMeasure {
  category: string;
  measure: string;
  status: 'implemented' | 'partial' | 'missing';
}

export class Atelier1OutputDto {
  organizationContext: string;
  missionsCritiques: string[];
  businessValues: BusinessValue[];
  fearedEvents: FearedEvent[];
  securityBaseline: SecurityMeasure[];
  socleDeSecurite: string;
}
