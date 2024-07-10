import type { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import formidable from 'formidable';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

const ImageUploadHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const form = new formidable.IncomingForm({ uploadDir, keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(500).json({ error: 'Failed to upload file' });
        return;
      }

      const itemid = fields.itemid as string;
      const file = files.file as formidable.File;
      const oldPath = file.filepath;
      const newFilename = `${itemid}${path.extname(file.originalFilename || file.newFilename)}`;
      const newPath = path.join(uploadDir, newFilename);

      try {
        await fs.rename(oldPath, newPath);
        const imageUrl = `/uploads/${newFilename}`;

        res.status(200).json({ imageUrl });
      } catch (error) {
        res.status(500).json({ error: 'Failed to save file' });
      }
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

export default ImageUploadHandler;
