import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_CLIENT } from './cloudinary.constants';

export const cloudinaryProvider = {
  provide: CLOUDINARY_CLIENT,
  useFactory: (configService: ConfigService) => {
    const cloudName = configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = configService.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(
        'Cloudinary credentials are missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    return cloudinary;
  },
  inject: [ConfigService],
};
