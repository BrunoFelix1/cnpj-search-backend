import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './modules/database.module';
import { LeadModule } from './modules/lead.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.ENV'],
    }),
    DatabaseModule,
    LeadModule,
  ],
})
export class AppModule {}
