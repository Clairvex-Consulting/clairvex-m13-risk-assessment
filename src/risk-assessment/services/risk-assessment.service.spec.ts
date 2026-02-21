import { Test, TestingModule } from '@nestjs/testing';
import { RiskAssessmentService } from './risk-assessment.service';
import { Atelier1Service } from './atelier1.service';
import { Atelier2Service } from './atelier2.service';
import { Atelier3Service } from './atelier3.service';
import { Atelier4Service } from './atelier4.service';
import { Atelier5Service } from './atelier5.service';
import {
  GenerateRiskAssessmentDto,
  SecteurActivite,
} from '../dto/generate-risk-assessment.dto';
import { ResultatAtelier1 } from '../interfaces/atelier1.interface';
import { ResultatAtelier2 } from '../interfaces/atelier2.interface';
import { ResultatAtelier3 } from '../interfaces/atelier3.interface';
import { ResultatAtelier4 } from '../interfaces/atelier4.interface';
import { ResultatAtelier5 } from '../interfaces/atelier5.interface';

describe('RiskAssessmentService', () => {
  let service: RiskAssessmentService;
  let atelier1Service: jest.Mocked<Atelier1Service>;
  let atelier2Service: jest.Mocked<Atelier2Service>;
  let atelier3Service: jest.Mocked<Atelier3Service>;
  let atelier4Service: jest.Mocked<Atelier4Service>;
  let atelier5Service: jest.Mocked<Atelier5Service>;

  const mockAtelier1: ResultatAtelier1 = {
    perimetre: 'Périmètre test',
    valeursMetier: [
      {
        nom: 'Données patients',
        description: 'DPI',
        confidentialite: 4,
        integrite: 4,
        disponibilite: 4,
        tracabilite: 3,
      },
    ],
    evenementsRedoutes: [
      {
        id: 'ER-001',
        description: 'Divulgation des données patients',
        valeurMetierImpactee: 'Données patients',
        critereAffecte: 'Confidentialité',
        niveauImpact: 4,
      },
    ],
    socleSécurité: ['Pare-feu'],
  };

  const mockAtelier2: ResultatAtelier2 = {
    sourcesRisque: [
      {
        id: 'SR-001',
        nom: 'Cybercriminel',
        categorie: 'Organisé',
        motivation: 'Gain financier',
        niveauRessources: 3,
        niveauActivite: 3,
      },
    ],
    objectifsVises: [
      {
        id: 'OV-001',
        description: 'Exfiltration données',
        valeurMetierCiblee: 'Données patients',
      },
    ],
    couplesSROV: [
      {
        id: 'SROV-001',
        sourceRisque: {
          id: 'SR-001',
          nom: 'Cybercriminel',
          categorie: 'Organisé',
          motivation: 'Gain financier',
          niveauRessources: 3,
          niveauActivite: 3,
        },
        objectifVise: {
          id: 'OV-001',
          description: 'Exfiltration données',
          valeurMetierCiblee: 'Données patients',
        },
        pertinence: 4,
      },
    ],
  };

  const mockAtelier3: ResultatAtelier3 = {
    scenariosStrategiques: [
      {
        id: 'SS-001',
        intitule: 'Ransomware',
        coupleSROVId: 'SROV-001',
        evenementRedouteId: 'ER-001',
        cheminAttaque: [
          {
            etape: 1,
            description: 'Phishing',
            cibleIntermédiaire: 'Poste utilisateur',
          },
        ],
        vraisemblance: 3,
        impact: 4,
        risqueBrut: 12,
      },
    ],
    cartographieRisques: {
      matrice: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 1]],
      scenariosParNiveau: { critique: ['SS-001'] },
    },
  };

  const mockAtelier4: ResultatAtelier4 = {
    scenariosOperationnels: [
      {
        id: 'SO-001',
        scenarioStrategiqueId: 'SS-001',
        intitule: 'Déploiement ransomware',
        techniquesATTACK: [
          {
            id: 'T1566',
            nom: 'Phishing',
            tactique: 'Initial Access',
            description: 'Phishing e-mail',
          },
        ],
        mesuresSecurite: [
          {
            id: 'MS-001',
            intitule: 'Formation anti-phishing',
            type: 'Préventive',
            efficacite: 3,
            cout: 'Faible',
            delai: 'Court terme',
          },
        ],
        vraisemblanceResiduelle: 2,
        impactResiduel: 3,
        risqueResiduel: 6,
      },
    ],
    syntheseMesures: {
      totalMesures: 1,
      repartitionParType: { Préventive: 1 },
    },
  };

  const mockAtelier5: ResultatAtelier5 = {
    actionsTraitement: [
      {
        id: 'AT-001',
        intitule: 'Déployer EDR',
        option: 'Réduire',
        scenarioOperationnelId: 'SO-001',
        mesuresIds: ['MS-001'],
        responsable: 'RSSI',
        priorite: 1,
        delai: 'Court terme',
        coutEstime: '50 000 €',
        indicateur: 'Taux de détection',
      },
      {
        id: 'AT-002',
        intitule: 'Souscrire assurance cyber',
        option: 'Transférer',
        scenarioOperationnelId: 'SO-001',
        mesuresIds: [],
        responsable: 'Direction',
        priorite: 2,
        delai: 'Moyen terme',
        coutEstime: '20 000 €/an',
        indicateur: 'Couverture assurance',
      },
    ],
    planSecurite3Ans: [
      {
        annee: 1,
        actions: [],
        budgetEstime: '150 000 €',
        objectifs: ['Réduire risque ransomware'],
      },
      {
        annee: 2,
        actions: [],
        budgetEstime: '100 000 €',
        objectifs: ['Améliorer détection'],
      },
      {
        annee: 3,
        actions: [],
        budgetEstime: '75 000 €',
        objectifs: ['Maintenir niveau'],
      },
    ],
    risquesAcceptes: [],
    risquesTransferes: ['Ransomware - assurance cyber'],
    synthese: 'Plan de traitement sur 3 ans.',
  };

  const mockDto: GenerateRiskAssessmentDto = {
    organisation: 'Hôpital Test',
    descriptionSysteme: 'Système d\'information hospitalier',
    secteurActivite: SecteurActivite.SANTE,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RiskAssessmentService,
        {
          provide: Atelier1Service,
          useValue: { generer: jest.fn().mockResolvedValue(mockAtelier1) },
        },
        {
          provide: Atelier2Service,
          useValue: { generer: jest.fn().mockResolvedValue(mockAtelier2) },
        },
        {
          provide: Atelier3Service,
          useValue: { generer: jest.fn().mockResolvedValue(mockAtelier3) },
        },
        {
          provide: Atelier4Service,
          useValue: { generer: jest.fn().mockResolvedValue(mockAtelier4) },
        },
        {
          provide: Atelier5Service,
          useValue: { generer: jest.fn().mockResolvedValue(mockAtelier5) },
        },
      ],
    }).compile();

    service = module.get<RiskAssessmentService>(RiskAssessmentService);
    atelier1Service = module.get(Atelier1Service);
    atelier2Service = module.get(Atelier2Service);
    atelier3Service = module.get(Atelier3Service);
    atelier4Service = module.get(Atelier4Service);
    atelier5Service = module.get(Atelier5Service);
  });

  it('doit être défini', () => {
    expect(service).toBeDefined();
  });

  describe('genererAnalyse', () => {
    it('doit exécuter les 5 ateliers séquentiellement', async () => {
      const result = await service.genererAnalyse(mockDto);

      expect(atelier1Service.generer).toHaveBeenCalledWith(mockDto);
      expect(atelier2Service.generer).toHaveBeenCalledWith(mockDto, mockAtelier1);
      expect(atelier3Service.generer).toHaveBeenCalledWith(mockDto, mockAtelier2);
      expect(atelier4Service.generer).toHaveBeenCalledWith(mockDto, mockAtelier3);
      expect(atelier5Service.generer).toHaveBeenCalledWith(
        mockDto,
        mockAtelier3,
        mockAtelier4,
      );

      expect(result).toBeDefined();
    });

    it('doit retourner un résultat avec la méthodologie EBIOS RM v1.5', async () => {
      const result = await service.genererAnalyse(mockDto);

      expect(result.methodologie).toBe('EBIOS RM v1.5');
      expect(result.organisation).toBe(mockDto.organisation);
      expect(result.id).toBeDefined();
      expect(result.generatedAt).toBeDefined();
    });

    it('doit inclure les résultats des 5 ateliers', async () => {
      const result = await service.genererAnalyse(mockDto);

      expect(result.ateliers.atelier1).toEqual(mockAtelier1);
      expect(result.ateliers.atelier2).toEqual(mockAtelier2);
      expect(result.ateliers.atelier3).toEqual(mockAtelier3);
      expect(result.ateliers.atelier4).toEqual(mockAtelier4);
      expect(result.ateliers.atelier5).toEqual(mockAtelier5);
    });

    it('doit calculer le niveau de risque global à partir des risques résiduels', async () => {
      // risqueResiduel = 6 => niveau 2
      const result = await service.genererAnalyse(mockDto);

      expect(result.niveauRisqueGlobal).toBe(2);
    });

    it('doit calculer le niveau de risque 4 pour risque résiduel >= 12', async () => {
      const atelier4HighRisk: ResultatAtelier4 = {
        ...mockAtelier4,
        scenariosOperationnels: [
          { ...mockAtelier4.scenariosOperationnels[0], risqueResiduel: 16 },
        ],
      };
      atelier4Service.generer.mockResolvedValue(atelier4HighRisk);

      const result = await service.genererAnalyse(mockDto);

      expect(result.niveauRisqueGlobal).toBe(4);
    });

    it('doit calculer le niveau de risque 3 pour risque résiduel >= 8 et < 12', async () => {
      const atelier4MedRisk: ResultatAtelier4 = {
        ...mockAtelier4,
        scenariosOperationnels: [
          { ...mockAtelier4.scenariosOperationnels[0], risqueResiduel: 9 },
        ],
      };
      atelier4Service.generer.mockResolvedValue(atelier4MedRisk);

      const result = await service.genererAnalyse(mockDto);

      expect(result.niveauRisqueGlobal).toBe(3);
    });

    it('doit extraire les recommandations prioritaires (priorité 1 et 2)', async () => {
      const result = await service.genererAnalyse(mockDto);

      expect(result.recommandationsPrioritaires).toHaveLength(2);
      expect(result.recommandationsPrioritaires[0]).toContain('[Réduire]');
      expect(result.recommandationsPrioritaires[1]).toContain('[Transférer]');
    });

    it('doit limiter les recommandations à 5 maximum', async () => {
      const atelier5ManyActions: ResultatAtelier5 = {
        ...mockAtelier5,
        actionsTraitement: Array.from({ length: 10 }, (_, i) => ({
          id: `AT-00${i + 1}`,
          intitule: `Action ${i + 1}`,
          option: 'Réduire' as const,
          scenarioOperationnelId: 'SO-001',
          mesuresIds: [],
          responsable: 'RSSI',
          priorite: 1 as const,
          delai: 'Court terme' as const,
          coutEstime: '10 000 €',
          indicateur: `Indicateur ${i + 1}`,
        })),
      };
      atelier5Service.generer.mockResolvedValue(atelier5ManyActions);

      const result = await service.genererAnalyse(mockDto);

      expect(result.recommandationsPrioritaires.length).toBeLessThanOrEqual(5);
    });
  });
});
