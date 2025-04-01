import { Module } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { ExerciseController } from './exercise.controller';
import { CryptoService } from 'src/crypto/crypto.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ExerciseController],
  providers: [ExerciseService, CryptoService],
})
export class ExerciseModule {}
