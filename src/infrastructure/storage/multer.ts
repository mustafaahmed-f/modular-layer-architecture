import { StatusCodes } from 'http-status-codes';
import multer from 'multer';
import { AppError } from '../../shared/errors/AppError.js';

export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export interface UploaderOptions {
    allowedMimeTypes?: string[];
    maxFileSize?: number;
}

/**
 * Creates a multer instance that keeps files in memory (ready to stream to
 * Cloudinary or any other storage). Use it in routes:
 *
 *   router.post('/avatar', createUploader().single('avatar'), controller);
 */
export function createUploader({
    allowedMimeTypes = IMAGE_MIME_TYPES,
    maxFileSize = DEFAULT_MAX_FILE_SIZE,
}: UploaderOptions = {}): multer.Multer {
    return multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: maxFileSize },
        fileFilter: (_req, file, callback) => {
            if (allowedMimeTypes.includes(file.mimetype)) {
                return callback(null, true);
            }
            callback(
                new AppError(
                    `Unsupported file type: ${file.mimetype}`,
                    StatusCodes.UNSUPPORTED_MEDIA_TYPE
                )
            );
        },
    });
}
