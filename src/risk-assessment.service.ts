import { Injectable, Logger } from '@nestjs/common';
import { ContextInputDto } from './dto/context-input.dto';
import { FullAssessmentResultDto } from './dto/full-assessment-result.dto';
import { Atelier1Service } from './ateliers/atelier-1/atelier-1.service';
import { Atelier2Service } from './ateliers/atelier-2/atelier-2.service';
import { Atelier3Service } from './ateliers/atelier-3/atelier-3.service';
import { Atelier4Service } from './ateliers/atelier-4/atelier-4.service';
import { Atelier5Service } from './ateliers/atelier-5/atelier-5.service';

@Injectable()
export class RiskAssessmentService {
  private readonly logger = new Logger(RiskAssessmentService.name);

  constructor(
    private readonly atelier1Service: Atelier1Service,
    private readonly atelier2Service: Atelier2Service,
    private readonly atelier3Service: Atelier3Service,
    private readonly atelier4Service: Atelier4Service,
    private readonly atelier5Service: Atelier5Service,
  ) {}

  async generateFullAssessment(context: ContextInputDto): Promise<FullAssessmentResultDto> {
    this.logger.log(`Starting full EBIOS RM assessment for ${context.organization}`);

    const atelier1 = await this.atelier1Service.analyze(context);
    this.logger.log('Atelier 1 complete');

    const atelier2 = await this.atelier2Service.analyze(context, atelier1);
    this.logger.log('Atelier 2 complete');

    const atelier3 = await this.atelier3Service.analyze(context, atelier2);
    this.logger.log('Atelier 3 complete');

    const atelier4 = await this.atelier4Service.analyze(context, atelier3);
    this.logger.log('Atelier 4 complete');

    const atelier5 = await this.atelier5Service.analyze(context, atelier3, atelier4);
    this.logger.log('Atelier 5 complete');

    return {
      context,
      atelier1,
      atelier2,
      atelier3,
      atelier4,
      atelier5,
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
    };
  }
}
