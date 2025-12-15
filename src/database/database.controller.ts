import { Controller, Delete } from '@nestjs/common';
import { ApiInternalServerErrorResponse, ApiOkResponse } from '@nestjs/swagger';
import { GlobalErrorDto } from 'common/errors/global-error.dto';
import { DatabaseService } from './database.service';

@Controller('database')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @ApiOkResponse({ description: 'Database reset and seeded successfully' })
  @ApiInternalServerErrorResponse({ type: GlobalErrorDto })
  @Delete('reset')
  async reset() {
    return this.databaseService.reset();
  }
}
