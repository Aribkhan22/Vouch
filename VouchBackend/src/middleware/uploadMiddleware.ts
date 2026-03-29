import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { cloudinary } from '../config/cloudinary';
import { Readable } from 'stream';

const memoryUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      // React Native file pickers often return octet-stream when MIME
      // detection is unavailable; validate by extension instead.
      'application/octet-stream',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, and PNG files are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
}).array('docs', 3);

const uploadBufferToCloudinary = (
  buffer: Buffer,
  originalname: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'vouch/verification',
        resource_type: 'auto',
        public_id: `${Date.now()}_${originalname.replace(/\s+/g, '_')}`,
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Upload failed'));
        resolve(result.secure_url);
      },
    );
    Readable.from(buffer).pipe(uploadStream);
  });
};

export const uploadDocs = (req: Request, res: Response, next: NextFunction): void => {
  memoryUpload(req, res, async (err) => {
    if (err) { next(err); return; }
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) { next(); return; }
      const urls = await Promise.all(
        files.map((f) => uploadBufferToCloudinary(f.buffer, f.originalname)),
      );
      (req as Request & { uploadedUrls: string[] }).uploadedUrls = urls;
      next();
    } catch (uploadErr) {
      next(uploadErr);
    }
  });
};
