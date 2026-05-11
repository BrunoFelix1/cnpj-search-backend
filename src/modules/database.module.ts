import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const dataDir = join(process.cwd(), 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: join(dataDir, 'app.sqlite'),
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
})
export class DatabaseModule {}
