import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Req, Query, UploadedFile } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { JwtModificationInterceptor } from 'src/jwt-modification/jwt-modification.interceptor';
import { getJwt } from 'src/common/utils';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('esercizi')
@ApiBearerAuth()
@Controller('exercise')
@UseInterceptors(JwtModificationInterceptor)
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Post()
  @ApiOperation({ summary: 'Crea un nuovo esercizio' })
  @ApiResponse({ status: 201, description: 'Esercizio creato con successo' })
  @ApiResponse({ status: 400, description: 'Dati non validi' })
  async create(@Body() createExerciseDto: CreateExerciseDto, @Req() request: Request) {
    const jwt = getJwt(request);
    return await this.exerciseService.create(createExerciseDto, jwt);
  }

  @Post('upload-csv')
  @ApiOperation({ summary: 'Importa esercizi da file CSV' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Esercizi importati con successo' })
  @ApiResponse({ status: 400, description: 'File non valido o errore di importazione' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadCsv(@UploadedFile() file: any, @Req() request: Request) {
    const jwt = getJwt(request);
    return await this.exerciseService.importFromCsv(file, jwt);
  }

  @Get()
  @ApiOperation({ summary: 'Recupera tutti gli esercizi' })
  @ApiResponse({ status: 200, description: 'Lista degli esercizi recuperata con successo' })
  async findAll(@Req() request: Request, @Query('getAll') getAll: string) {
    const jwt = getJwt(request);
    return await this.exerciseService.findAll(jwt, getAll === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Recupera un esercizio specifico' })
  @ApiResponse({ status: 200, description: 'Esercizio recuperato con successo' })
  @ApiResponse({ status: 404, description: 'Esercizio non trovato' })
  async findOne(@Param('id') id: string, @Req() request: Request, @Query('getAll') getAll: string) {
    const jwt = getJwt(request);
    return await this.exerciseService.findOne(+id, jwt, getAll === 'true');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Aggiorna un esercizio esistente' })
  @ApiResponse({ status: 200, description: 'Esercizio aggiornato con successo' })
  @ApiResponse({ status: 404, description: 'Esercizio non trovato' })
  async update(@Param('id') id: string, @Body() updateExerciseDto: UpdateExerciseDto, @Req() request: Request) {
    const jwt = getJwt(request);
    return await this.exerciseService.update(+id, updateExerciseDto, jwt);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Elimina un esercizio' })
  @ApiResponse({ status: 200, description: 'Esercizio eliminato con successo' })
  @ApiResponse({ status: 404, description: 'Esercizio non trovato' })
  async remove(@Param('id') id: string, @Req() request: Request) {
    const jwt = getJwt(request);
    return await this.exerciseService.remove(+id, jwt);
  }
}
