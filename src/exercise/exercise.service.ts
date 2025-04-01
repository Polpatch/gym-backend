import { Injectable } from '@nestjs/common';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ConfigService } from '@nestjs/config';
import { create, findAll, findOne, remove, update, createConfig } from 'src/common/service-utilities';
import { AuthService } from 'src/auth/auth.service';
const name_service = 'exercises'

@Injectable()
export class ExerciseService {
  constructor(private readonly configService: ConfigService, private readonly authService: AuthService){}

  async create(data: CreateExerciseDto, jwt: string) {
    return await create<CreateExerciseDto>(data, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, false, null));
  }  

  async findAll(jwt: string, getAll) {
    return await findAll(jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, getAll, null));
  }

  async findOne(id: number, jwt: string, getAll) {
    return await findOne(id, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, getAll, null));
  }

  async update(id: number, data: UpdateExerciseDto, jwt: string) {
    return await update<UpdateExerciseDto>(id, data, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, false, null));
  }

  async remove(id: number, jwt: string) {
    return await remove(id, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, false, null));
  }
}
