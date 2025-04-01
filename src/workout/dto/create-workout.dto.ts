import { IsArray, IsDate, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkoutDto {
    @ApiProperty({ description: 'Nome del workout' })
    @IsNotEmpty()
    @IsString()
    readonly name: string;

    @ApiProperty({ description: 'Data e ora di inizio del workout' })
    @IsDate()
    readonly start: string;

    @ApiProperty({ description: 'Data e ora di fine del workout' })
    @IsDate()
    readonly end: string;

    @ApiProperty({ description: 'Lista degli ID degli esercizi nel workout' })
    @IsArray()
    @IsString({ each: true })
    workout_exercises: string[];
}
