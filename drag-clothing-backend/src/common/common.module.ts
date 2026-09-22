import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtGuard } from 'src/Modules/Auth/guards/jwt.guard';
import { ApiResponseService } from './api-response.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN') || '1d' },
      }),
    }),
  ],
  providers: [ApiResponseService, JwtGuard],
  exports: [ApiResponseService, JwtModule, JwtGuard],
})
export class CommonModule {}
