import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { customAlphabet } from 'nanoid';
import {
  BeforeInsert,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

const nano = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 10);

export abstract class DatabaseEntity {
  private idPrefix: string;

  constructor(idPrefix: string) {
    Object.defineProperty(this, 'idPrefix', {
      value: idPrefix,
      enumerable: false,
      writable: true,
      configurable: false,
    });
  }

  @ApiProperty({
    title: 'Unique ID',
    format: 'PREFIX-YYYYMMDD-0000000000',
    example: 'SETTING-20251126-W2DGWBIXRA',
  })
  @PrimaryColumn()
  id: string;

  @ApiProperty({
    title: 'Creation Date',
    type: Date,
    example: '2025-11-26T15:36:06.966Z',
  })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({
    title: 'Last Update Date',
    type: Date,
    example: '2025-11-26T15:36:06.966Z',
    default: 'Creation Date',
  })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Exclude()
  @ApiPropertyOptional({
    title: 'Delete Date',
    description: 'For softly deleted entries',
    type: Date,
    example: '2025-11-26T15:36:06.966Z',
    nullable: true,
  })
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  @BeforeInsert()
  private generateId() {
    const now = new Date();
    this.id =
      this.idPrefix +
      '-' +
      String(now.getFullYear()) +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') +
      '-' +
      nano();
  }
}
