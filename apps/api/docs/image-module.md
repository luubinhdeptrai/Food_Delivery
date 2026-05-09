## 1) Decide the upload strategy

Use **signed uploads** for production. Cloudinary documents unsigned uploads as useful for low-security use cases, prototyping, and testing, while signed client-side uploads require a secure signature from your server-side Node.js code. That fits your setup well because the browser can upload directly without exposing your API secret. ([Cloudinary][1])

## 2) Create the Cloudinary credentials in environment variables

Store `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in your NestJS environment. Cloudinary’s Node.js SDK says you can configure these values with `CLOUDINARY_URL` or with `config()` in code, and it explicitly says not to expose the API secret publicly. NestJS’s configuration docs support reading values from `.env` files or process environment variables. ([Cloudinary][2])

Example `.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 3) Install and configure the Cloudinary SDK in NestJS

Cloudinary’s Node.js integration is an NPM package, and the docs recommend using the `v2` namespace in your code. ([Cloudinary][2])

```bash
pnpm install cloudinary
```

```ts
// cloudinary.provider.ts
import { v2 as cloudinary } from 'cloudinary';

export const cloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    return cloudinary;
  },
};
```

## 4) Create a NestJS endpoint that returns an upload signature

Cloudinary says signed client-side uploads need a secure signature generated on the server, and the signature is built from the parameters you want to sign plus a timestamp. Their signature tutorial says signatures are valid for one hour. ([Cloudinary][1])

```ts
// cloudinary.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Controller('cloudinary')
export class CloudinaryController {
  @Get('signature')
  getSignature(@Query('folder') folder = 'app-images') {
    const timestamp = Math.round(Date.now() / 1000);

    const paramsToSign = {
      timestamp,
      folder,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!,
    );

    return {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      timestamp,
      signature,
      folder,
    };
  }
}
```

The browser will call this endpoint before uploading. Keep the response minimal: only what the frontend needs to upload.

## 5) Make the frontend upload directly to Cloudinary

Cloudinary’s upload docs say browser uploads can be done directly to Cloudinary, and signed browser uploads must use the server-generated signature. The upload endpoint returns data such as `public_id` and `secure_url`, which you can store in your database. ([Cloudinary][1])

The Vite app should:

1. call `GET /cloudinary/signature`
2. build `FormData`
3. POST to `https://api.cloudinary.com/v1_1/<cloud_name>/image/upload`
4. send the returned image metadata to NestJS

Example payload fields to send back to NestJS:

```json
{
  "publicId": "app-images/sample",
  "secureUrl": "https://res.cloudinary.com/...",
  "width": 1200,
  "height": 800
}
```

## 6) Store the image metadata in your database

Cloudinary’s Upload API documentation says `public_id` is the identifier used for accessing and delivering the uploaded asset, and the upload response can include `secure_url`. For your app, save at least `public_id` and `secure_url`, and also save dimensions if you want the Expo app to render layout more accurately. ([Cloudinary][3])

A simple image record might look like this:

```ts
{
  id: string;
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  createdAt: Date;
}
```

## 7) Expose a read endpoint for Expo

Your NestJS backend should expose a `GET /images` endpoint that returns the saved records. The Expo app should never need the Cloudinary secret; it only needs the URLs your backend returns. Since Cloudinary returns `secure_url` in the upload response and that URL is meant for delivery, this keeps the mobile app simple. ([Cloudinary][4])

Example response:

```json
[
  {
    "id": "1",
    "secureUrl": "https://res.cloudinary.com/...",
    "width": 1200,
    "height": 800
  }
]
```

## 8) Optional: add unsigned uploads only for prototypes

If the team wants a fast prototype, Cloudinary supports unsigned uploads with an upload preset. Cloudinary says upload presets let you centrally define upload options, and unsigned presets are used with unsigned upload calls; the docs also say unsigned uploads are useful for low-security use cases, prototyping, and testing. ([Cloudinary][5])

If you go that route, create the preset in the Cloudinary console and have the frontend send `upload_preset` instead of a signature. For production, the signed flow above is the safer choice. ([Cloudinary][5])

## 9) Backend checklist

By the end, the backend team should have these pieces working:

- Cloudinary credentials stored only in server-side env vars. ([Cloudinary][2])
- A `GET /cloudinary/signature` endpoint. ([Cloudinary][1])
- A database table for image metadata. ([Cloudinary][3])
- A `GET /images` endpoint for Expo. ([Cloudinary][4])
- A clear rule that the frontend uploads directly to Cloudinary and the backend only signs and stores results. ([Cloudinary][1])

[1]: https://cloudinary.com/documentation/node_image_and_video_upload 'Node.js image and video upload | Documentation'
[2]: https://cloudinary.com/documentation/node_integration 'Node.js SDK – Node.js Upload + Image, Video Transformations | Documentation'
[3]: https://cloudinary.com/documentation/image_upload_api_reference 'Upload API Reference | Documentation'
[4]: https://cloudinary.com/documentation/node_quickstart 'Cloudinary Node.js SDK Quick Start | Documentation'
[5]: https://cloudinary.com/documentation/upload_presets 'Upload Presets | Documentation'
