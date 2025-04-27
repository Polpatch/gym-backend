import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { create, findAll, findOne, remove, update, createConfig } from 'src/common/service-utilities';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';
import * as csv from 'csv-parser';
import { Readable } from 'stream';

const name_service = 'progresses'

@Injectable()
export class ProgressService {
  constructor(private readonly configService: ConfigService, private readonly authService: AuthService){}
  
  async create(data: CreateProgressDto, jwt) {
    return await create<CreateProgressDto>(data, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, false, null));
  }

  async findAll(jwt: string, getAll: boolean) {
    const user = await this.authService.userInfo(jwt);
    return await findAll(jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, getAll, user.id));
  }

  async findOne(id: number, jwt: string, getAll: boolean) {
    const user = await this.authService.userInfo(jwt);
    return await findOne(id, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, getAll, user.id));
  }

  async update(id: number, data: UpdateProgressDto, jwt) {
    return await update<UpdateProgressDto>(id, data, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, false, null));
  }

  async remove(id: number, jwt) {
    return await remove(id, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, false, null));
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
          date: progress.date || new Date().toISOString()
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
