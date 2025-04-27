import { IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkoutExerciseDto {
    @ApiProperty({ description: 'ID dell\'esercizio' })
    @IsNotEmpty()
    @IsString()
    readonly exercise: string;

    @ApiProperty({ description: 'Numero di serie' })
    @IsNotEmpty()
    @IsNumber()
    readonly serie: number;
    
    @ApiProperty({ description: 'Numero di ripetizioni' })
    @IsNumber()
    readonly reps: number;
    
    @ApiProperty({ description: 'ID del workout' })
    @IsNotEmpty()
    @IsString()
    readonly workout: string;

    @ApiProperty({ description: 'Indica se è un esercizio di massimo sforzo' })
    @IsBoolean()
    readonly max: boolean;

    @ApiProperty({ description: 'ID dell\'utente proprietario dell\'esercizio nel workout' })
    @IsNotEmpty()
    @IsNumber()
    readonly user: number;
}
