import { IsString, IsInt, IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExerciseDto {
    @ApiProperty({ description: 'Nome dell\'esercizio' })
    @IsNotEmpty()
    @IsString()
    readonly name: string;

    @ApiProperty({ description: 'Descrizione dell\'esercizio', required: false })
    @IsString()
    readonly description: string;

    @ApiProperty({ description: 'URL del video o immagine dell\'esercizio', required: false })
    @IsString()
    readonly url: string;
}
