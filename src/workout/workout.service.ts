import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { ConfigService } from '@nestjs/config';
import { create, findAll, findOne, remove, update, createConfig } from 'src/common/service-utilities';
import { AuthService } from 'src/auth/auth.service';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
import { isAdminRole } from 'src/common/constants';

const name_service = 'workouts'

@Injectable()
export class WorkoutService {
  constructor(private readonly configService: ConfigService, private readonly authService: AuthService){}

  async create(data: CreateWorkoutDto, jwt: string) {
    const user = await this.authService.userInfo(jwt);
    
    // Imposta automaticamente l'ID dell'utente
    const dataWithUser = {
      ...data,
      user: user.id
    };
    
    return await create<CreateWorkoutDto>(dataWithUser, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, false, null, user.role));
  }

  async findAll(jwt: string, getAll: boolean) {
    const user = await this.authService.userInfo(jwt);
    return await findAll(jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, getAll, user.id, user.role));
  }

  async findOne(id: number, jwt: string, getAll: boolean) {
    const user = await this.authService.userInfo(jwt);
    return await findOne(id, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, getAll, user.id, user.role));
  }

  async update(id: number, data: UpdateWorkoutDto, jwt: string) {
    const user = await this.authService.userInfo(jwt);
    
    // Se l'utente non è admin, verifica che il record appartenga all'utente
    if (!isAdminRole(user.role, this.configService)) {
      const record = await findOne(id, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, false, user.id, user.role));
      if (!record) {
        throw new ForbiddenException('Non hai i permessi per modificare questo record');
      }
    }
    
    return await update<UpdateWorkoutDto>(id, data, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, false, null, user.role));
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
      const workouts = await this.parseCsvFile(file.buffer);
      const results = [];
      const user = await this.authService.userInfo(jwt);

      for (const workout of workouts) {
        // Verifica che il CSV contenga i campi obbligatori
        if (!workout.name) {
          throw new BadRequestException('Il file CSV deve contenere una colonna "name"');
        }

        const workoutData: CreateWorkoutDto = {
          name: workout.name,
          start: workout.start || new Date().toISOString(),
          end: workout.end || new Date().toISOString(),
          workout_exercises: workout.workout_exercises ? workout.workout_exercises.split(',') : [],
          user: user.id
        };

        const result = await this.create(workoutData, jwt);
        results.push(result);
      }

      return {
        message: `Importati ${results.length} workout con successo`,
        workouts: results
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
