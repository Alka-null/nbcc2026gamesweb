import JigsawUploader from "./JigsawUploader";

export default function JigsawUploadPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Jigsaw Puzzle Upload</h1>
      <p className="mb-4">Upload an image to split it into jigsaw pieces for the puzzle game.</p>
      <JigsawUploader />
    </div>
  );
}
