import { Body, Controller, Get, Post, Req, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoggingInterceptorInterceptor } from 'src/logging-interceptor/logging-interceptor.interceptor';
import { JwtModificationInterceptor } from 'src/jwt-modification/jwt-modification.interceptor';
import { getJwt } from 'src/common/utils';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { SigninDto } from './dto/signin.dto';

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}

    @Get('user')
    @ApiOperation({ summary: 'Recupera le informazioni dell\'utente' })
    @ApiBearerAuth()
    @UseInterceptors(JwtModificationInterceptor)
    async userInfo(@Req() request: Request){
        const jwt = getJwt(request)

        return this.authService.userInfo(jwt);
    }

    @Post('login')
    @ApiOperation({ summary: 'Effettua il login' })
    @UseInterceptors(LoggingInterceptorInterceptor)
    async login(@Body() body: LoginDto){
        return this.authService.login(body.username, body.password);
    }

    @Post('signin')
    @ApiOperation({ summary: 'Crea un nuovo utente' })
    @UseInterceptors(LoggingInterceptorInterceptor)
    async signin(@Body() body: SigninDto){
        return this.authService.signin(body.username, body.email, body.password);
    }
}
