import { IsDate, IsNotEmpty, IsNumber, IsString, isNumber } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateProgressDto {
    @ApiProperty({ description: 'Peso utilizzato nell\'esercizio (in kg)' })
    @IsNumber()
    readonly weight: number;

    @ApiProperty({ description: 'Note aggiuntive sul progresso' })
    @IsString()
    readonly note: string;

    @ApiProperty({ description: 'ID dell\'esercizio' })
    @IsNotEmpty()
    @IsString()
    readonly exercise: string;

    @ApiProperty({ description: 'Numero di serie eseguite' })
    @IsNumber()
    readonly num_sets: number;
    
    @ApiProperty({ description: 'Numero di ripetizioni per serie' })
    @IsNumber()
    readonly num_reps: number;

    @ApiProperty({ description: 'Data del progresso' })
    @IsDate()
    readonly date: string;
}
