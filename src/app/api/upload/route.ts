import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files");
    const targetFormat = formData.get("targetFormat") as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const convertedFiles = await Promise.all(
      files.map(async (file: any) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const image = sharp(buffer);

        let convertedBuffer;
        switch (targetFormat) {
          case "webp":
            convertedBuffer = await image.webp().toBuffer();
            break;
          case "avif":
            convertedBuffer = await image.avif().toBuffer();
            break;
          case "jpg":
          case "jpeg":
            convertedBuffer = await image.jpeg().toBuffer();
            break;
          case "png":
            convertedBuffer = await image.png().toBuffer();
            break;
          default:
            throw new Error("Unsupported format");
        }

        return {
          name: `${file.name.split(".")[0]}.${targetFormat}`,
          buffer: convertedBuffer,
        };
      })
    );

    return NextResponse.json({
      message: "Files converted successfully",
      files: convertedFiles,
    });
  } catch (error) {
    console.error("Error processing files:", error);
    return NextResponse.json(
      { error: "Error processing files" },
      { status: 500 }
    );
  }
}
