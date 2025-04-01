import { Module } from '@nestjs/common';
import { WorkoutExerciseService } from './workout-exercise.service';
import { WorkoutExerciseController } from './workout-exercise.controller';
import { CryptoService } from 'src/crypto/crypto.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [WorkoutExerciseController],
  providers: [WorkoutExerciseService, CryptoService],
})
export class WorkoutExerciseModule {}
