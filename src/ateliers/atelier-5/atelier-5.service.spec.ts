import { Test, TestingModule } from '@nestjs/testing';
import { Atelier5Service } from './atelier-5.service';
import { OllamaService } from '../../llm-core/ollama.service';
import { ContextInputDto, OrganizationSize } from '../../dto/context-input.dto';
import { Atelier3OutputDto } from '../../dto/atelier-3-output.dto';
import { Atelier4OutputDto } from '../../dto/atelier-4-output.dto';

describe('Atelier5Service', () => {
  let service: Atelier5Service;
  let ollamaService: jest.Mocked<OllamaService>;

  const mockContext: ContextInputDto = {
    organization: 'Test Corp',
    sector: 'Finance',
    size: OrganizationSize.MEDIUM,
    description: 'A financial services company',
  };

  const mockAtelier3: Atelier3OutputDto = {
    strategicScenarios: [],
    riskMatrix: [],
    prioritizedScenarios: [],
  };

  const mockAtelier4: Atelier4OutputDto = {
    operationalScenarios: [],
    ttpsMapping: [],
    attackChainSummary: '',
  };

  const mockAtelier5Output = {
    treatmentPlan: [
      {
        id: 'M1',
        category: 'Technical',
        measure: 'MFA deployment',
        priority: 'immediate' as const,
        effort: 'medium' as const,
        cost: 'low' as const,
        effectiveness: 4,
        addressesScenarios: ['SS1'],
      },
    ],
    residualRisks: [
      { scenarioId: 'SS1', residualLikelihood: 2, residualImpact: 3, residualLevel: 'medium' as const, justification: '...' },
    ],
    securityRoadmap: [
      { year: 1, actions: ['Deploy MFA'], expectedRiskReduction: '30%', estimatedBudget: '50k€' },
      { year: 2, actions: ['SOC implementation'], expectedRiskReduction: '20%', estimatedBudget: '100k€' },
      { year: 3, actions: ['Zero trust'], expectedRiskReduction: '15%', estimatedBudget: '80k€' },
    ],
    kpis: ['Incidents per quarter'],
    executiveSummary: 'Comprehensive security plan',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Atelier5Service,
        {
          provide: OllamaService,
          useValue: { generateJson: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<Atelier5Service>(Atelier5Service);
    ollamaService = module.get(OllamaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return treatment plan with 3-year roadmap', async () => {
    ollamaService.generateJson.mockResolvedValue(mockAtelier5Output);
    const result = await service.analyze(mockContext, mockAtelier3, mockAtelier4);
    expect(result.treatmentPlan).toBeDefined();
    expect(result.securityRoadmap).toHaveLength(3);
    expect(result.residualRisks).toBeDefined();
  });

  it('should include KPIs in output', async () => {
    ollamaService.generateJson.mockResolvedValue(mockAtelier5Output);
    const result = await service.analyze(mockContext, mockAtelier3, mockAtelier4);
    expect(result.kpis).toBeDefined();
    expect(result.executiveSummary).toBeDefined();
  });
});
