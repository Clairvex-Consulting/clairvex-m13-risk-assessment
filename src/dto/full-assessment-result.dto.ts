import { Atelier1OutputDto } from './atelier-1-output.dto';
import { Atelier2OutputDto } from './atelier-2-output.dto';
import { Atelier3OutputDto } from './atelier-3-output.dto';
import { Atelier4OutputDto } from './atelier-4-output.dto';
import { Atelier5OutputDto } from './atelier-5-output.dto';
import { ContextInputDto } from './context-input.dto';

export class FullAssessmentResultDto {
  context: ContextInputDto;
  atelier1: Atelier1OutputDto;
  atelier2: Atelier2OutputDto;
  atelier3: Atelier3OutputDto;
  atelier4: Atelier4OutputDto;
  atelier5: Atelier5OutputDto;
  generatedAt: string;
  version: string;
}
