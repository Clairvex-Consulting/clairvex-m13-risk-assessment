import { Injectable } from '@nestjs/common';

/**
 * Service principal de l'application CLAIRVEX M13.
 */
@Injectable()
export class AppService {
  /**
   * Retourne un message de bienvenue.
   * @returns Message de bienvenue CLAIRVEX M13
   */
  getHello(): string {
    return 'CLAIRVEX M13 - Risk Assessment Engine EBIOS RM v1.5';
  }
}
