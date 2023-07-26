import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreateCatDto {
  @ApiPropertyOptional({
    type: Boolean,
    example: false,
    default: false,
  })
  @Type(() => Boolean)
  @Transform(({ value }) => false)
  test: boolean;
}
