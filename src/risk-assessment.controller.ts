import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { RiskAssessmentService } from './risk-assessment.service';
import { ContextInputDto } from './dto/context-input.dto';
import { FullAssessmentResultDto } from './dto/full-assessment-result.dto';

@Controller()
export class RiskAssessmentController {
  private readonly logger = new Logger(RiskAssessmentController.name);

  constructor(private readonly riskAssessmentService: RiskAssessmentService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generate(@Body() contextInput: ContextInputDto): Promise<FullAssessmentResultDto> {
    this.logger.log(`POST /generate received for ${contextInput.organization}`);
    return this.riskAssessmentService.generateFullAssessment(contextInput);
  }
}
