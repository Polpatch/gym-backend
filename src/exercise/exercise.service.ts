import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ConfigService } from '@nestjs/config';
import { create, findAll, findOne, remove, update, createConfig } from 'src/common/service-utilities';
import { AuthService } from 'src/auth/auth.service';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
const name_service = 'exercises'

@Injectable()
export class ExerciseService {
  constructor(private readonly configService: ConfigService, private readonly authService: AuthService){}

  async create(data: CreateExerciseDto, jwt: string) {
    return await create<CreateExerciseDto>(data, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, false, null, null));
  }  

  async findAll(jwt: string, getAll) {
    return await findAll(jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, getAll, null, null));
  }

  async findOne(id: number, jwt: string, getAll) {
    return await findOne(id, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, getAll, null, null));
  }

  async update(id: number, data: UpdateExerciseDto, jwt: string) {
    return await update<UpdateExerciseDto>(id, data, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, false, null, null));
  }

  async remove(id: number, jwt: string) {
    return await remove(id, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, false, null, null));
  }

  async importFromCsv(file: any, jwt: string) {
    if (!file) {
      throw new BadRequestException('Nessun file caricato');
    }

    if (file.mimetype !== 'text/csv') {
      throw new BadRequestException('Il file deve essere in formato CSV');
    }

    try {
      const exercises = await this.parseCsvFile(file.buffer);
      const results = [];

      for (const exercise of exercises) {
        // Verifica che il CSV contenga almeno il campo 'name' obbligatorio
        if (!exercise.name) {
          throw new BadRequestException('Il file CSV deve contenere una colonna "name"');
        }

        const exerciseData: CreateExerciseDto = {
          name: exercise.name,
          description: exercise.description || '',
          url: exercise.url || ''
        };

        const result = await this.create(exerciseData, jwt);
        results.push(result);
      }

      return {
        message: `Importati ${results.length} esercizi con successo`,
        exercises: results
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
