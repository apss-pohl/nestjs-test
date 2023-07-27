import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateCatDto {
  @ApiPropertyOptional({
    type: Boolean,
    example: false,
    default: false,
  })
  //@Type(() => Boolean)
  @Transform(({ value }) => {
    console.log('TRANSFORM');

    return value === 'true';
  })
  test: boolean;

  @ApiPropertyOptional({
    type: Boolean,
    example: false,
    default: false,
  })
  // @Type(() => Boolean)
  @Transform(({ value }) => {
    console.log('TRANSFORM');

    return false;
  })
  test2: boolean;
}
