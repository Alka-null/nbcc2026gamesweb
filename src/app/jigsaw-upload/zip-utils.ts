import JSZip from "jszip";

export async function createZipFromImages(images: string[]): Promise<Blob> {
  const zip = new JSZip();
  images.forEach((img, idx) => {
    const base64 = img.replace(/^data:image\/png;base64,/, "");
    zip.file(`jigsaw_piece_${idx + 1}.png`, base64, { base64: true });
  });
  return await zip.generateAsync({ type: "blob" });
}
