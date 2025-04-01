import { Injectable } from '@nestjs/common';
import { CreateWorkoutExerciseDto } from './dto/create-workout-exercise.dto';
import { UpdateWorkoutExerciseDto } from './dto/update-workout-exercise.dto';
import { ConfigService } from '@nestjs/config';
import { create, findAll, findOne, remove, update, createConfig } from 'src/common/service-utilities';
import { AuthService } from 'src/auth/auth.service';

const name_service = 'workout-exercises'

@Injectable()
export class WorkoutExerciseService {
  constructor(private readonly configService: ConfigService, private readonly authService: AuthService){}
  
  async create(data: CreateWorkoutExerciseDto, jwt: string) {
    return await create<CreateWorkoutExerciseDto>(data, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, false, null));
  }

  async findAll(jwt: string, getAll: boolean) {
    const user = await this.authService.userInfo(jwt);
    return await findAll(jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, getAll, user.id));
  }

  async findOne(id: number, jwt: string, getAll: boolean) {
    const user = await this.authService.userInfo(jwt);
    return await findOne(id, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, getAll, user.id));
  }

  async update(id: number, data: UpdateWorkoutExerciseDto, jwt: string) {
    return await update<UpdateWorkoutExerciseDto>(id, data, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, false, null));
  }

  async remove(id: number, jwt: string) {
    return await remove(id, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, false, null));
  }
}
