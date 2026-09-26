import {
  Controller,
  Get,
  Param,
  Res,
  Req,
  NotFoundException,
} from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';
import { existsSync, createReadStream, statSync } from 'fs';

@Controller('media/stream')
export class MediaStreamController {
  @Get(':type/:filename')
  streamMedia(
    @Param('type') type: 'videos' | 'pdfs',
    @Param('filename') filename: string,
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    const filePath = join(process.cwd(), 'public', 'uploads', type, filename);
    
    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    const stat = statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    const contentType = type === 'videos' ? 'video/mp4' : 'application/pdf';

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize) {
        res.status(416).send('Requested range not satisfiable\n' + start + ' >= ' + fileSize);
        return;
      }

      const chunksize = (end - start) + 1;
      const file = createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': contentType,
      };
      res.writeHead(200, head);
      createReadStream(filePath).pipe(res);
    }
  }
}
