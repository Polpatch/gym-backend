import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { create, findAll, findOne, remove, update, createConfig } from 'src/common/service-utilities';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
import { isAdminRole } from 'src/common/constants';

const name_service = 'progresses'

@Injectable()
export class ProgressService {
  constructor(private readonly configService: ConfigService, private readonly authService: AuthService){}
  
  async create(data: CreateProgressDto, jwt: string) {
    const user = await this.authService.userInfo(jwt);
    
    // Imposta automaticamente l'ID dell'utente
    const dataWithUser = {
      ...data,
      user: user.id
    };
    
    return await create<CreateProgressDto>(dataWithUser, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, false, null, user.role));
  }

  async findAll(jwt: string, getAll: boolean) {
    const user = await this.authService.userInfo(jwt);
    return await findAll(jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, getAll, user.id, user.role));
  }

  async findOne(id: number, jwt: string, getAll: boolean) {
    const user = await this.authService.userInfo(jwt);
    return await findOne(id, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, getAll, user.id, user.role));
  }

  async update(id: number, data: UpdateProgressDto, jwt: string) {
    const user = await this.authService.userInfo(jwt);
    
    // Se l'utente non è admin, verifica che il record appartenga all'utente
    if (!isAdminRole(user.role, this.configService)) {
      const record = await findOne(id, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, false, user.id, user.role));
      if (!record) {
        throw new ForbiddenException('Non hai i permessi per modificare questo record');
      }
    }
    
    return await update<UpdateProgressDto>(id, data, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, false, null, user.role));
  }

  async remove(id: number, jwt: string) {
    const user = await this.authService.userInfo(jwt);
    
    // Se l'utente non è admin, verifica che il record appartenga all'utente
    if (!isAdminRole(user.role, this.configService)) {
      const record = await findOne(id, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, false, user.id, user.role));
      if (!record) {
        throw new ForbiddenException('Non hai i permessi per eliminare questo record');
      }
    }
    
    return await remove(id, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, false, null, user.role));
  }

  async importFromCsv(file: any, jwt: string) {
    if (!file) {
      throw new BadRequestException('Nessun file caricato');
    }

    if (file.mimetype !== 'text/csv') {
      throw new BadRequestException('Il file deve essere in formato CSV');
    }

    try {
      const progresses = await this.parseCsvFile(file.buffer);
      const results = [];
      const user = await this.authService.userInfo(jwt);

      for (const progress of progresses) {
        // Verifica che il CSV contenga i campi obbligatori
        if (!progress.exercise) {
          throw new BadRequestException('Il file CSV deve contenere una colonna "exercise"');
        }

        const progressData: CreateProgressDto = {
          weight: parseFloat(progress.weight) || 0,
          note: progress.note || '',
          exercise: progress.exercise,
          num_sets: parseInt(progress.num_sets) || 0,
          num_reps: parseInt(progress.num_reps) || 0,
          date: progress.date || new Date().toISOString(),
          user: user.id
        };

        const result = await this.create(progressData, jwt);
        results.push(result);
      }

      return {
        message: `Importati ${results.length} progressi con successo`,
        progresses: results
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Errore durante l'importazione: ${error.message}`);
    }
  }

  private parseCsvFile(buffer: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results = [];
      const readableStream = new Readable();
      readableStream.push(buffer);
      readableStream.push(null);

      readableStream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }
}
