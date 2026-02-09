import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;
    if (!file) {
      return NextResponse.json({ error: 'No image uploaded' }, { status: 400 });
    }
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Resize to square (use min dimension)
    const meta = await sharp(inputBuffer).metadata();
    const size = Math.min(meta.width || 0, meta.height || 0);
    const squareBuffer = await sharp(inputBuffer)
      .resize(size, size)
      .toBuffer();

    // Split into 4x4 grid
    const grid = 4;
    const pieceSize = Math.floor(size / grid);
    const pieces: string[] = [];
    for (let row = 0; row < grid; row++) {
      for (let col = 0; col < grid; col++) {
        const piece = await sharp(squareBuffer)
          .extract({ left: col * pieceSize, top: row * pieceSize, width: pieceSize, height: pieceSize })
          .png()
          .toBuffer();
        pieces.push(`data:image/png;base64,${piece.toString('base64')}`);
      }
    }
    return NextResponse.json({ pieces });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
