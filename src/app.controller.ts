import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AppService } from './app.service';
import { CreateCatDto } from './dto/CreateCatDto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/get')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      //transformOptions: { enableImplicitConversion: true },
    }),
  )
  async createGet(@Query() createCatDto: CreateCatDto) {
    console.log(createCatDto);
  }

  @Post('/post')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      //transformOptions: { enableImplicitConversion: true },
    }),
  )
  async createPost(@Body() createCatDto: CreateCatDto) {
    console.log(createCatDto);
  }
}
