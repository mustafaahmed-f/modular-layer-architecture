import {
    v2 as cloudinary,
    type UploadApiOptions,
    type UploadApiResponse,
} from 'cloudinary';
import { env } from '../../config/env.js';

/**
 * Optional Cloudinary integration. Enabled only when CLOUDINARY_CLOUD_NAME,
 * CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET are all set.
 */
let configured = false;

export function isCloudinaryEnabled(): boolean {
    return Boolean(
        env.CLOUDINARY_CLOUD_NAME &&
        env.CLOUDINARY_API_KEY &&
        env.CLOUDINARY_API_SECRET
    );
}

function getCloudinary(): typeof cloudinary {
    if (!isCloudinaryEnabled()) {
        throw new Error(
            'Cloudinary is not configured. Set the CLOUDINARY_* environment variables.'
        );
    }

    if (!configured) {
        cloudinary.config({
            cloud_name: env.CLOUDINARY_CLOUD_NAME,
            api_key: env.CLOUDINARY_API_KEY,
            api_secret: env.CLOUDINARY_API_SECRET,
            secure: true,
        });
        configured = true;
    }

    return cloudinary;
}

/** Uploads an in-memory file (e.g. `req.file.buffer` from multer). */
export function uploadBuffer(
    buffer: Buffer,
    options: UploadApiOptions = {}
): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
        getCloudinary()
            .uploader.upload_stream(options, (error, result) => {
                if (error || !result) {
                    return reject(
                        error ?? new Error('Cloudinary upload failed')
                    );
                }
                resolve(result);
            })
            .end(buffer);
    });
}

export async function deleteFile(publicId: string): Promise<void> {
    await getCloudinary().uploader.destroy(publicId);
}
