import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LeadModule } from './modules/lead.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.ENV'],
    }),
    LeadModule,
  ],
})
export class AppModule {}
