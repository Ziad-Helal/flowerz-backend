import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GlobalErrorDto {
  // API Documentation
  @ApiProperty({ title: 'Error Message', example: 'This is an error' })
  message: string;

  // API Documentation
  @ApiProperty({ title: 'Error Code', example: 'NOT_FOUND' })
  code: string;

  // API Documentation
  @ApiProperty({ title: 'Response Status Code', example: 404 })
  status: number;

  // API Documentation
  @ApiPropertyOptional({
    title: 'Error Details',
    examples: ["This doesn't exist", { email: 'Already exists' }],
  })
  details: Record<string, string | string[]> | null;

  // API Documentation
  @ApiProperty({
    title: 'Error Timestamp',
    type: Date,
    example: '2025-11-26T15:36:06.966Z',
  })
  timestamp: string;

  // API Documentation
  @ApiProperty({ title: 'Request Endpoint', example: '/api/v1/auth/signIn' })
  path: string;

  // API Documentation
  @ApiProperty({ title: 'Request Method', example: 'POST' })
  method: string;
}
