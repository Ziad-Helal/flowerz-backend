import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { runSeeders } from 'typeorm-extension';

@Injectable()
export class DatabaseService {
  constructor(private readonly dataSource: DataSource) {}

  async reset() {
    try {
      await this.dataSource.dropDatabase();
      await this.dataSource.synchronize();
      if (this.dataSource.migrations.length > 0)
        await this.dataSource.runMigrations();
      await runSeeders(this.dataSource);
      return 'Database reset and seeded successfully';
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
