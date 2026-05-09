import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ImageService } from './image.service';
import {
  CreateImageDto,
  ImageListResponseDto,
  ImageResponseDto,
} from './dto/image.dto';

@ApiTags('Images')
@ApiBearerAuth()
@Controller('images')
export class ImageController {
  constructor(private readonly service: ImageService) {}

  @Get()
  @AllowAnonymous()
  @ApiOperation({
    summary: 'List stored images',
    description: 'Returns paginated image metadata stored by the backend.',
  })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ type: ImageListResponseDto })
  findAll(
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.service.findAll(offset, limit);
  }

  @Post()
  @ApiOperation({
    summary: 'Store image metadata',
    description:
      'Persists Cloudinary upload metadata for later use by clients.',
  })
  @ApiCreatedResponse({ type: ImageResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  create(@Body() dto: CreateImageDto) {
    return this.service.create(dto);
  }
}
