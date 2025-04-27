import { ConfigService } from '@nestjs/config';

// Funzione per ottenere il ruolo admin dalla configurazione
export const getAdminRole = (configService: ConfigService): string => {
  return configService.get('ADMIN_ROLE') || 'admin';
};

// Funzione per verificare se un ruolo è admin
export const isAdminRole = (role: string, configService: ConfigService): boolean => {
  const adminRole = getAdminRole(configService);
  return role?.toLowerCase() === adminRole.toLowerCase();
}; 