import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { getJwt } from 'src/common/utils';
import { JwtModificationInterceptor } from 'src/jwt-modification/jwt-modification.interceptor';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import * as multer from 'multer';

@ApiTags('categorie')
@ApiBearerAuth()
@Controller('category')
@UseInterceptors(JwtModificationInterceptor)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Crea una nuova categoria' })
  @ApiResponse({ status: 201, description: 'Categoria creata con successo' })
  @ApiResponse({ status: 400, description: 'Dati non validi' })
  async create(@Body() createCategoryDto: CreateCategoryDto, @Req() request: Request) {
    const jwt = getJwt(request);
    return await this.categoryService.create(createCategoryDto, jwt);
  }

  @Post('upload-csv')
  @ApiOperation({ summary: 'Importa categorie da file CSV' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Categorie importate con successo' })
  @ApiResponse({ status: 400, description: 'File non valido o errore di importazione' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadCsv(@UploadedFile() file: any, @Req() request: Request) {
    const jwt = getJwt(request);
    return await this.categoryService.importFromCsv(file, jwt);
  }

  @Get()
  @ApiOperation({ summary: 'Recupera tutte le categorie' })
  @ApiResponse({ status: 200, description: 'Lista delle categorie recuperata con successo' })
  async findAll(@Req() request: Request, @Query('getAll') getAll: string) {
    const jwt = getJwt(request);
    return await this.categoryService.findAll(jwt, getAll === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Recupera una categoria specifica' })
  @ApiResponse({ status: 200, description: 'Categoria recuperata con successo' })
  @ApiResponse({ status: 404, description: 'Categoria non trovata' })
  async findOne(@Param('id') id: string, @Req() request: Request, @Query('getAll') getAll: string) {
    const jwt = getJwt(request);
    return await this.categoryService.findOne(+id, jwt, getAll === 'true');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Aggiorna una categoria esistente' })
  @ApiResponse({ status: 200, description: 'Categoria aggiornata con successo' })
  @ApiResponse({ status: 404, description: 'Categoria non trovata' })
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto, @Req() request: Request) {
    const jwt = getJwt(request);
    return await this.categoryService.update(+id, updateCategoryDto, jwt);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Elimina una categoria' })
  @ApiResponse({ status: 200, description: 'Categoria eliminata con successo' })
  @ApiResponse({ status: 404, description: 'Categoria non trovata' })
  async remove(@Param('id') id: string, @Req() request: Request) {
    const jwt = getJwt(request);
    return await this.categoryService.remove(+id, jwt);
  }
} 