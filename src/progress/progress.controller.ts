import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, UseInterceptors } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { getJwt } from 'src/common/utils';
import { JwtModificationInterceptor } from 'src/jwt-modification/jwt-modification.interceptor';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('progressi')
@ApiBearerAuth()
@Controller('progress')
@UseInterceptors(JwtModificationInterceptor)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post()
  @ApiOperation({ summary: 'Crea un nuovo progresso' })
  @ApiResponse({ status: 201, description: 'Progresso creato con successo' })
  @ApiResponse({ status: 400, description: 'Dati non validi' })
  async create(@Body() createProgressDto: CreateProgressDto, @Req() request: Request) {
    const jwt = getJwt(request);
    return await this.progressService.create(createProgressDto, jwt);
  }

  @Get()
  @ApiOperation({ summary: 'Recupera tutti i progressi' })
  @ApiResponse({ status: 200, description: 'Lista dei progressi recuperata con successo' })
  async findAll(@Req() request: Request, @Query('getAll') getAll: string) {
    const jwt = getJwt(request);
    return await this.progressService.findAll(jwt, getAll === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Recupera un progresso specifico' })
  @ApiResponse({ status: 200, description: 'Progresso recuperato con successo' })
  @ApiResponse({ status: 404, description: 'Progresso non trovato' })
  async findOne(@Param('id') id: string, @Req() request: Request, @Query('getAll') getAll: string) {
    const jwt = getJwt(request);
    return await this.progressService.findOne(+id, jwt, getAll === 'true');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Aggiorna un progresso esistente' })
  @ApiResponse({ status: 200, description: 'Progresso aggiornato con successo' })
  @ApiResponse({ status: 404, description: 'Progresso non trovato' })
  async update(@Param('id') id: string, @Body() updateProgressDto: UpdateProgressDto, @Req() request: Request) {
    const jwt = getJwt(request);
    return await this.progressService.update(+id, updateProgressDto, jwt);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Elimina un progresso' })
  @ApiResponse({ status: 200, description: 'Progresso eliminato con successo' })
  @ApiResponse({ status: 404, description: 'Progresso non trovato' })
  async remove(@Param('id') id: string, @Req() request: Request) {
    const jwt = getJwt(request);
    return await this.progressService.remove(+id, jwt);
  }
}
