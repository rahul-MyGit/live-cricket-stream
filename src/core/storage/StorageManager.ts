import fs from 'fs/promises';
import path from 'path';
import { logger } from '../../utils/logger';

export abstract class StorageManager {
  abstract saveFile(key: string, data: Buffer): Promise<void>;
  abstract getFile(key: string): Promise<Buffer>;
  abstract deleteFile(key: string): Promise<void>;
  abstract listFiles(prefix: string): Promise<string[]>;
  abstract exists(key: string): Promise<boolean>;
}

export class LocalStorage extends StorageManager {
  constructor(private rootDir: string) {
    super();
  }

  async saveFile(key: string, data: Buffer): Promise<void> {
    const filePath = path.join(this.rootDir, key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, data);
    logger.debug(`Saved file: ${key}`);
  }

  async getFile(key: string): Promise<Buffer> {
    const filePath = path.join(this.rootDir, key);
    return await fs.readFile(filePath);
  }

  async deleteFile(key: string): Promise<void> {
    const filePath = path.join(this.rootDir, key);
    await fs.unlink(filePath);
    logger.debug(`Deleted file: ${key}`);
  }

  async listFiles(prefix: string): Promise<string[]> {
    const dirPath = path.join(this.rootDir, prefix);
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      return entries
        .filter((entry) => entry.isFile())
        .map((entry) => path.join(prefix, entry.name));
    } catch (error) {
      return [];
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const filePath = path.join(this.rootDir, key);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async cleanup(olderThanHours: number): Promise<number> {
    const cutoffTime = Date.now() - olderThanHours * 60 * 60 * 1000;
    let deletedCount = 0;

    const cleanDirectory = async (dir: string): Promise<void> => {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            await cleanDirectory(fullPath);
            // Try to remove empty directory
            try {
              await fs.rmdir(fullPath);
            } catch {
              // Directory not empty, ignore
            }
          } else {
            const stats = await fs.stat(fullPath);
            if (stats.mtimeMs < cutoffTime) {
              await fs.unlink(fullPath);
              deletedCount++;
            }
          }
        }
      } catch (error) {
        logger.error(`Error cleaning directory ${dir}`, { error });
      }
    };

    await cleanDirectory(this.rootDir);
    logger.info(`Cleanup completed: ${deletedCount} files deleted`);
    return deletedCount;
  }
}