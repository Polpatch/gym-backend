import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExerciseModule } from './exercise/exercise.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CryptoService } from './crypto/crypto.service';
import { WorkoutModule } from './workout/workout.module';
import { WorkoutExerciseModule } from './workout-exercise/workout-exercise.module';
import { ProgressModule } from './progress/progress.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [ExerciseModule, AuthModule, ConfigModule.forRoot({
      envFilePath: `.env`,
      isGlobal: true,
    }), WorkoutModule, WorkoutExerciseModule, ProgressModule, CategoryModule],
  controllers: [AppController],
  providers: [AppService, CryptoService],
})
export class AppModule {}
