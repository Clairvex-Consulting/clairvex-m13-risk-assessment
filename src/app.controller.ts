import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Contrôleur principal de l'application CLAIRVEX M13.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Vérifie que l'application est en ligne.
   * @returns Message de bienvenue
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
