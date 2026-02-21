import { Test, TestingModule } from '@nestjs/testing';
import { RiskAssessmentController } from './risk-assessment.controller';
import { RiskAssessmentService } from './services/risk-assessment.service';
import {
  GenerateRiskAssessmentDto,
  SecteurActivite,
} from './dto/generate-risk-assessment.dto';
import { RiskAssessmentResult } from './interfaces/risk-assessment.interface';

describe('RiskAssessmentController', () => {
  let controller: RiskAssessmentController;
  let riskAssessmentService: jest.Mocked<RiskAssessmentService>;

  const mockResult: RiskAssessmentResult = {
    id: 'test-uuid',
    organisation: 'Hôpital Test',
    generatedAt: '2024-01-01T00:00:00.000Z',
    methodologie: 'EBIOS RM v1.5',
    ateliers: {
      atelier1: {
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
        socleSécurité: ['Pare-feu', 'Antivirus'],
      },
      atelier2: {
        sourcesRisque: [
          {
            id: 'SR-001',
            nom: 'Cybercriminel organisé',
            categorie: 'Organisé',
            motivation: 'Gain financier',
            niveauRessources: 3,
            niveauActivite: 3,
          },
        ],
        objectifsVises: [
          {
            id: 'OV-001',
            description: 'Exfiltration données patients',
            valeurMetierCiblee: 'Données patients',
          },
        ],
        couplesSROV: [
          {
            id: 'SROV-001',
            sourceRisque: {
              id: 'SR-001',
              nom: 'Cybercriminel organisé',
              categorie: 'Organisé',
              motivation: 'Gain financier',
              niveauRessources: 3,
              niveauActivite: 3,
            },
            objectifVise: {
              id: 'OV-001',
              description: 'Exfiltration données patients',
              valeurMetierCiblee: 'Données patients',
            },
            pertinence: 4,
          },
        ],
      },
      atelier3: {
        scenariosStrategiques: [
          {
            id: 'SS-001',
            intitule: 'Ransomware sur le SIH',
            coupleSROVId: 'SROV-001',
            evenementRedouteId: 'ER-001',
            cheminAttaque: [
              {
                etape: 1,
                description: 'Phishing ciblé',
                cibleIntermédiaire: 'Poste utilisateur',
              },
            ],
            vraisemblance: 3,
            impact: 4,
            risqueBrut: 12,
          },
        ],
        cartographieRisques: {
          matrice: [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 1],
          ],
          scenariosParNiveau: { critique: ['SS-001'] },
        },
      },
      atelier4: {
        scenariosOperationnels: [
          {
            id: 'SO-001',
            scenarioStrategiqueId: 'SS-001',
            intitule: 'Déploiement ransomware via phishing',
            techniquesATTACK: [
              {
                id: 'T1566',
                nom: 'Phishing',
                tactique: 'Initial Access',
                description: 'Phishing par e-mail',
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
            impactResiduel: 4,
            risqueResiduel: 8,
          },
        ],
        syntheseMesures: {
          totalMesures: 1,
          repartitionParType: { Préventive: 1 },
        },
      },
      atelier5: {
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
            objectifs: ['Maintenir niveau de sécurité'],
          },
        ],
        risquesAcceptes: [],
        risquesTransferes: ['Risque résiduel ransomware transféré assurance cyber'],
        synthese: 'Plan de traitement priorisé sur 3 ans.',
      },
    },
    niveauRisqueGlobal: 3,
    recommandationsPrioritaires: ['[Réduire] Déployer EDR - Délai: Court terme'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RiskAssessmentController],
      providers: [
        {
          provide: RiskAssessmentService,
          useValue: {
            genererAnalyse: jest.fn().mockResolvedValue(mockResult),
          },
        },
      ],
    }).compile();

    controller = module.get<RiskAssessmentController>(RiskAssessmentController);
    riskAssessmentService = module.get(RiskAssessmentService);
  });

  it('doit être défini', () => {
    expect(controller).toBeDefined();
  });

  describe('generate', () => {
    it('doit appeler genererAnalyse avec le DTO et retourner le résultat', async () => {
      const dto: GenerateRiskAssessmentDto = {
        organisation: 'Hôpital Test',
        descriptionSysteme: 'Système d\'information hospitalier',
        secteurActivite: SecteurActivite.SANTE,
        contexteMetier: 'HDS certifié',
        contraintesReglementaires: ['HDS', 'RGPD'],
        enjeuxMetier: ['Continuité des soins'],
      };

      const result = await controller.generate(dto);

      expect(riskAssessmentService.genererAnalyse).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResult);
    });

    it('doit fonctionner avec un DTO minimal (champs optionnels absents)', async () => {
      const dto: GenerateRiskAssessmentDto = {
        organisation: 'Entreprise XYZ',
        descriptionSysteme: 'Système ERP de gestion',
        secteurActivite: SecteurActivite.INDUSTRIE,
      };

      const result = await controller.generate(dto);

      expect(riskAssessmentService.genererAnalyse).toHaveBeenCalledWith(dto);
      expect(result.methodologie).toBe('EBIOS RM v1.5');
    });

    it('doit propager les erreurs du service', async () => {
      riskAssessmentService.genererAnalyse.mockRejectedValue(
        new Error('Erreur LLM'),
      );

      const dto: GenerateRiskAssessmentDto = {
        organisation: 'Test',
        descriptionSysteme: 'Test système',
        secteurActivite: SecteurActivite.AUTRE,
      };

      await expect(controller.generate(dto)).rejects.toThrow('Erreur LLM');
    });
  });
});
