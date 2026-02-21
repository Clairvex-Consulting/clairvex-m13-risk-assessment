import { IsString, IsEnum, IsOptional, IsArray, IsBoolean } from 'class-validator';

export enum OrganizationSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  ENTERPRISE = 'enterprise',
}

export class ContextInputDto {
  @IsString()
  organization: string;

  @IsString()
  sector: string;

  @IsEnum(OrganizationSize)
  size: OrganizationSize;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sites?: string[];

  @IsBoolean()
  @IsOptional()
  cloud?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sensitiveData?: string[];
}
