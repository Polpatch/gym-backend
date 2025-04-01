import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SigninDto {
    @ApiProperty({ description: 'Email dell\'utente' })
    @IsNotEmpty()
    @IsEmail()
    readonly email: string;

    @ApiProperty({ description: 'Username dell\'utente' })
    @IsNotEmpty()
    @IsString()
    readonly username: string;

    @ApiProperty({ description: 'Password dell\'utente' })
    @IsNotEmpty()
    @IsString()
    readonly password: string;
}

