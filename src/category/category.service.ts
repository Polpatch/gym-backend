import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ConfigService } from '@nestjs/config';
import { create, findAll, findOne, remove, update, createConfig } from 'src/common/service-utilities';
import { AuthService } from 'src/auth/auth.service';
import * as csv from 'csv-parser';
import { Readable } from 'stream';

const name_service = 'categories'

@Injectable()
export class CategoryService {
  constructor(private readonly configService: ConfigService, private readonly authService: AuthService){}

  async create(data: CreateCategoryDto, jwt: string) {
    return await create<CreateCategoryDto>(data, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, false, null));
  }

  async findAll(jwt: string, getAll: boolean) {
    const user = await this.authService.userInfo(jwt);
    return await findAll(jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, getAll, user.id));
  }

  async findOne(id: number, jwt: string, getAll: boolean) {
    const user = await this.authService.userInfo(jwt);
    return await findOne(id, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, getAll, user.id));
  }

  async update(id: number, data: UpdateCategoryDto, jwt: string) {
    return await update<UpdateCategoryDto>(id, data, jwt, this.configService.get('STRAPI_ENDPOINT'), name_service, createConfig(jwt, false, null));
  }

  async remove(id: number, jwt: string) {
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
      const categories = await this.parseCsvFile(file.buffer);
      const results = [];

      for (const category of categories) {
        // Verifica che il CSV contenga almeno il campo 'name' obbligatorio
        if (!category.name) {
          throw new BadRequestException('Il file CSV deve contenere una colonna "name"');
        }

        const categoryData: CreateCategoryDto = {
          name: category.name,
          description: category.description || ''
        };

        const result = await this.create(categoryData, jwt);
        results.push(result);
      }

      return {
        message: `Importate ${results.length} categorie con successo`,
        categories: results
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