import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

export interface UploadedDocument {
  original_name: string;
  size: number;
  path: string;
  mime_type: string;
  public_id: string;
  bytes?: number;
  asset_id?: string;
  format?: string;
  resource_type?: string;
}

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,

    });
  }

  async uploadFile(file: Express.Multer.File): Promise<UploadedDocument> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'claims',
          access_mode: 'public',
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error) {
            reject(
              new Error(
                error instanceof Error ? error.message : JSON.stringify(error),
              ),
            );
          } else if (result) {
            resolve({
              original_name: result?.original_filename ?? "Uploaded_file",
              size: result.bytes,
              path: result.secure_url,
              mime_type: result.format,
              public_id: result.public_id,
              format: result.format,
              resource_type: result.resource_type,
              bytes: result.bytes,
            });
          } else {
            reject(new Error('Cloudinary upload returned undefined result.'));
          }
        },
      );

      // Convert buffer to stream
      const readableStream = new Readable();
      readableStream.push(file.buffer);
      readableStream.push(null);

      readableStream.pipe(uploadStream);
    });
  }

  async uploadFiles(files: Express.Multer.File[]): Promise<UploadedDocument[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file));
    return Promise.all(uploadPromises);
  }

  async deleteFile(publicId: string): Promise<{ result: string }> {
    return cloudinary.uploader.destroy(publicId) as Promise<{ result: string }>;
  }
}
