import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  MinLength,
  MaxLength,
  IsEnum,
} from 'class-validator';

/**
 * Secteur d'activité de l'organisation.
 */
export enum SecteurActivite {
  SANTE = 'Santé',
  FINANCE = 'Finance',
  ENERGIE = 'Énergie',
  TRANSPORT = 'Transport',
  DEFENSE = 'Défense',
  INDUSTRIE = 'Industrie',
  NUMERIQUE = 'Numérique',
  COLLECTIVITE = 'Collectivité',
  AUTRE = 'Autre',
}

/**
 * DTO pour la génération d'une analyse de risque EBIOS RM complète.
 */
export class GenerateRiskAssessmentDto {
  /**
   * Nom de l'organisation ou du système à analyser.
   * @example "Hôpital Universitaire de Paris"
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  organisation: string;

  /**
   * Description du système d'information ou du périmètre analysé.
   * @example "Système d'information hospitalier incluant le DPI et la téléradiologie"
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  descriptionSysteme: string;

  /**
   * Secteur d'activité de l'organisation.
   * @example "Santé"
   */
  @IsEnum(SecteurActivite)
  secteurActivite: SecteurActivite;

  /**
   * Contexte métier supplémentaire (optionnel).
   * @example "Organisation soumise à la certification HDS et au RGPD"
   */
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  contexteMetier?: string;

  /**
   * Contraintes réglementaires applicables (optionnel).
   * @example ["HDS", "RGPD", "NIS2"]
   */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contraintesReglementaires?: string[];

  /**
   * Enjeux métier prioritaires (optionnel).
   * @example ["Continuité des soins", "Protection des données patients"]
   */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  enjeuxMetier?: string[];
}
