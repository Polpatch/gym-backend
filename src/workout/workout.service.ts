import { Injectable } from '@nestjs/common';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { ConfigService } from '@nestjs/config';
import { create, findAll, findOne, remove, update, createConfig } from 'src/common/service-utilities';
import { AuthService } from 'src/auth/auth.service';

const name_service = 'workouts'

@Injectable()
export class WorkoutService {
  constructor(private readonly configService: ConfigService, private readonly authService: AuthService){}

  async create(data: CreateWorkoutDto, jwt: string) {
    return await create<CreateWorkoutDto>(data, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, false, null));
  }

  async findAll(jwt: string, getAll: boolean) {
    const user = await this.authService.userInfo(jwt);
    return await findAll(jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, getAll, user.id));
  }

  async findOne(id: number, jwt: string, getAll: boolean) {
    const user = await this.authService.userInfo(jwt);
    return await findOne(id, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, getAll, user.id));
  }

  async update(id: number, data: UpdateWorkoutDto, jwt: string) {
    return await update<UpdateWorkoutDto>(id, data, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, false, null));
  }

  async remove(id: number, jwt: string) {
    return await remove(id, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, false, null));
  }
}
