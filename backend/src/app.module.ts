import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseOptions } from './config/database';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [
    TypeOrmModule.forRoot({ ...databaseOptions(), retryAttempts: 0 }),
    AuthModule,
  ],
})
export class AppModule {}
