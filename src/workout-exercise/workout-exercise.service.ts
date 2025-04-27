import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateWorkoutExerciseDto } from './dto/create-workout-exercise.dto';
import { UpdateWorkoutExerciseDto } from './dto/update-workout-exercise.dto';
import { ConfigService } from '@nestjs/config';
import { create, findAll, findOne, remove, update, createConfig } from 'src/common/service-utilities';
import { AuthService } from 'src/auth/auth.service';
import * as csv from 'csv-parser';
import { Readable } from 'stream';

const name_service = 'workout-exercises'

@Injectable()
export class WorkoutExerciseService {
  constructor(private readonly configService: ConfigService, private readonly authService: AuthService){}
  
  async create(data: CreateWorkoutExerciseDto, jwt: string) {
    const user = await this.authService.userInfo(jwt);
    
    // Imposta automaticamente l'ID dell'utente
    const dataWithUser = {
      ...data,
      user: user.id
    };
    
    return await create<CreateWorkoutExerciseDto>(dataWithUser, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, false, null, user.role));
  }

  async findAll(jwt: string, getAll: boolean) {
    const user = await this.authService.userInfo(jwt);
    return await findAll(jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, getAll, user.id, user.role));
  }

  async findOne(id: number, jwt: string, getAll: boolean) {
    const user = await this.authService.userInfo(jwt);
    return await findOne(id, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, getAll, user.id, user.role));
  }

  async update(id: number, data: UpdateWorkoutExerciseDto, jwt: string) {
    const user = await this.authService.userInfo(jwt);
    
    // Se l'utente non è admin, verifica che il record appartenga all'utente
    if (user.role !== 'Admin') {
      const record = await findOne(id, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, false, user.id, user.role));
      if (!record) {
        throw new ForbiddenException('Non hai i permessi per modificare questo record');
      }
    }
    
    return await update<UpdateWorkoutExerciseDto>(id, data, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, false, null, user.role));
  }

  async remove(id: number, jwt: string) {
    const user = await this.authService.userInfo(jwt);
    
    // Se l'utente non è admin, verifica che il record appartenga all'utente
    if (user.role !== 'Admin') {
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
      const workoutExercises = await this.parseCsvFile(file.buffer);
      const results = [];
      const user = await this.authService.userInfo(jwt);

      for (const workoutExercise of workoutExercises) {
        // Verifica che il CSV contenga i campi obbligatori
        if (!workoutExercise.exercise || !workoutExercise.workout) {
          throw new BadRequestException('Il file CSV deve contenere le colonne "exercise" e "workout"');
        }

        const workoutExerciseData: CreateWorkoutExerciseDto = {
          exercise: workoutExercise.exercise,
          workout: workoutExercise.workout,
          serie: parseInt(workoutExercise.serie) || 0,
          reps: parseInt(workoutExercise.reps) || 0,
          max: workoutExercise.max === 'true' || workoutExercise.max === '1',
          user: user.id
        };

        const result = await this.create(workoutExerciseData, jwt);
        results.push(result);
      }

      return {
        message: `Importati ${results.length} esercizi per workout con successo`,
        workoutExercises: results
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
