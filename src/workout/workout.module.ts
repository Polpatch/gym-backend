import { Module } from '@nestjs/common';
import { WorkoutService } from './workout.service';
import { WorkoutController } from './workout.controller';
import { CryptoService } from 'src/crypto/crypto.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [WorkoutController],
  providers: [WorkoutService, CryptoService],
})
export class WorkoutModule {}
