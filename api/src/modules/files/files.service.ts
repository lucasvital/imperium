import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FilesService {
  private readonly uploadsDir = path.join(process.cwd(), 'uploads');

  create(file: Express.Multer.File) {
    return file;
  }

  async remove(filename: string) {
    const filePath = path.join(this.uploadsDir, filename);
    
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      // Ignora erros ao deletar arquivo (pode não existir)
    }

    return null;
  }
}
