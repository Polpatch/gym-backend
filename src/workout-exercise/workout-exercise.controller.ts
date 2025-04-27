import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Req, Query, UploadedFile } from '@nestjs/common';
import { WorkoutExerciseService } from './workout-exercise.service';
import { CreateWorkoutExerciseDto } from './dto/create-workout-exercise.dto';
import { UpdateWorkoutExerciseDto } from './dto/update-workout-exercise.dto';
import { JwtModificationInterceptor } from 'src/jwt-modification/jwt-modification.interceptor';
import { getJwt } from 'src/common/utils';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('workout-exercises')
@ApiBearerAuth()
@Controller('workout-exercise')
@UseInterceptors(JwtModificationInterceptor)
export class WorkoutExerciseController {
  constructor(private readonly workoutExerciseService: WorkoutExerciseService) {}

  @Post()
  @ApiOperation({ summary: 'Crea un nuovo esercizio per workout' })
  @ApiResponse({ status: 201, description: 'Esercizio per workout creato con successo' })
  @ApiResponse({ status: 400, description: 'Dati non validi' })
  async create(@Body() createWorkoutExerciseDto: CreateWorkoutExerciseDto, @Req() request: Request) {
    const jwt = getJwt(request);
    return await this.workoutExerciseService.create(createWorkoutExerciseDto, jwt);
  }

  @Post('upload-csv')
  @ApiOperation({ summary: 'Importa esercizi per workout da file CSV' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Esercizi per workout importati con successo' })
  @ApiResponse({ status: 400, description: 'File non valido o errore di importazione' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadCsv(@UploadedFile() file: any, @Req() request: Request) {
    const jwt = getJwt(request);
    return await this.workoutExerciseService.importFromCsv(file, jwt);
  }

  @Get()
  @ApiOperation({ summary: 'Recupera tutti gli esercizi per workout' })
  @ApiResponse({ status: 200, description: 'Lista degli esercizi per workout recuperata con successo' })
  async findAll(@Req() request: Request, @Query('getAll') getAll: string) {
    const jwt = getJwt(request);
    return await this.workoutExerciseService.findAll(jwt, getAll === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Recupera un esercizio per workout specifico' })
  @ApiResponse({ status: 200, description: 'Esercizio per workout recuperato con successo' })
  @ApiResponse({ status: 404, description: 'Esercizio per workout non trovato' })
  async findOne(@Param('id') id: string, @Req() request: Request, @Query('getAll') getAll: string) {
    const jwt = getJwt(request);
    return await this.workoutExerciseService.findOne(+id, jwt, getAll === 'true');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Aggiorna un esercizio per workout esistente' })
  @ApiResponse({ status: 200, description: 'Esercizio per workout aggiornato con successo' })
  @ApiResponse({ status: 404, description: 'Esercizio per workout non trovato' })
  async update(@Param('id') id: string, @Body() updateWorkoutExerciseDto: UpdateWorkoutExerciseDto, @Req() request: Request) {
    const jwt = getJwt(request);
    return await this.workoutExerciseService.update(+id, updateWorkoutExerciseDto, jwt);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Elimina un esercizio per workout' })
  @ApiResponse({ status: 200, description: 'Esercizio per workout eliminato con successo' })
  @ApiResponse({ status: 404, description: 'Esercizio per workout non trovato' })
  async remove(@Param('id') id: string, @Req() request: Request) {
    const jwt = getJwt(request);
    return await this.workoutExerciseService.remove(+id, jwt);
  }
}
