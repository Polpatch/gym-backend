import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseInterceptors, Query, UploadedFile } from '@nestjs/common';
import { WorkoutService } from './workout.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { getJwt } from 'src/common/utils';
import { JwtModificationInterceptor } from 'src/jwt-modification/jwt-modification.interceptor';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('workout')
@ApiBearerAuth()
@Controller('workout')
@UseInterceptors(JwtModificationInterceptor)
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  @Post()
  @ApiOperation({ summary: 'Crea un nuovo workout' })
  @ApiResponse({ status: 201, description: 'Workout creato con successo' })
  @ApiResponse({ status: 400, description: 'Dati non validi' })
  async create(@Body() createWorkoutDto: CreateWorkoutDto, @Req() request: Request) {
    const jwt = getJwt(request);
    return await this.workoutService.create(createWorkoutDto, jwt);
  }

  @Post('upload-csv')
  @ApiOperation({ summary: 'Importa workout da file CSV' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Workout importati con successo' })
  @ApiResponse({ status: 400, description: 'File non valido o errore di importazione' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadCsv(@UploadedFile() file: any, @Req() request: Request) {
    const jwt = getJwt(request);
    return await this.workoutService.importFromCsv(file, jwt);
  }

  @Get()
  @ApiOperation({ summary: 'Recupera tutti i workout' })
  @ApiResponse({ status: 200, description: 'Lista dei workout recuperata con successo' })
  async findAll(@Req() request: Request, @Query('getAll') getAll: string) {
    const jwt = getJwt(request);
    return await this.workoutService.findAll(jwt, getAll === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Recupera un workout specifico' })
  @ApiResponse({ status: 200, description: 'Workout recuperato con successo' })
  @ApiResponse({ status: 404, description: 'Workout non trovato' })
  async findOne(@Param('id') id: string, @Req() request: Request, @Query('getAll') getAll: string) {
    const jwt = getJwt(request);
    return await this.workoutService.findOne(+id, jwt, getAll === 'true');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Aggiorna un workout esistente' })
  @ApiResponse({ status: 200, description: 'Workout aggiornato con successo' })
  @ApiResponse({ status: 404, description: 'Workout non trovato' })
  async update(@Param('id') id: string, @Body() updateWorkoutDto: UpdateWorkoutDto, @Req() request: Request) {
    const jwt = getJwt(request);
    return await this.workoutService.update(+id, updateWorkoutDto, jwt);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Elimina un workout' })
  @ApiResponse({ status: 200, description: 'Workout eliminato con successo' })
  @ApiResponse({ status: 404, description: 'Workout non trovato' })
  async remove(@Param('id') id: string, @Req() request: Request) {
    const jwt = getJwt(request);
    return await this.workoutService.remove(+id, jwt);
  }
}
