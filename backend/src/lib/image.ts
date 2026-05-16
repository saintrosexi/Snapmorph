import sharp from 'sharp';
import axios from 'axios';

export async function addWatermark(imageUrl: string, watermarkText: string): Promise<Buffer> {
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  const inputBuffer = Buffer.from(response.data);

  const image = sharp(inputBuffer);
  const metadata = await image.metadata();

  const svgWatermark = `
    <svg width="${metadata.width}" height="${metadata.height}">
      <style>
        .text { fill: rgba(255, 255, 255, 0.5); font-size: ${Math.floor((metadata.width || 1000) / 20)}px; font-family: sans-serif; font-weight: bold; }
      </style>
      <text x="50%" y="95%" text-anchor="middle" class="text">${watermarkText}</text>
    </svg>
  `;

  return image
    .composite([{
      input: Buffer.from(svgWatermark),
      top: 0,
      left: 0,
    }])
    .toBuffer();
}
