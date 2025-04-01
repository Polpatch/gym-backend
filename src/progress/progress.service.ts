import { Injectable } from '@nestjs/common';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { create, findAll, findOne, remove, update, createConfig } from 'src/common/service-utilities';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';

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
}
