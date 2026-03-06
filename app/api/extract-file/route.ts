import { NextRequest } from "next/server";
import { handleApiError, AppError } from "@/src/core/errors/AppError";
import { requireAuth } from "@/src/infrastructure/auth/middleware";

// ─── Route Handler ───────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      throw new AppError("MISSING_FILE", "No file provided", 400);
    }

    const fileName = file.name.toLowerCase();
    const mimeType = file.type.toLowerCase();

    const isPdf =
      mimeType === "application/pdf" || fileName.endsWith(".pdf");
    const isDocx =
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.endsWith(".docx");
    const isTxt =
      mimeType === "text/plain" || fileName.endsWith(".txt");

    if (!isPdf && !isDocx && !isTxt) {
      throw new AppError(
        "UNSUPPORTED_FILE_TYPE",
        "Unsupported file type. Please upload a PDF, DOCX, or TXT file.",
        400
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let text = "";

    if (isTxt) {
      text = buffer.toString("utf-8");
    } else if (isPdf) {
      // Dynamically import to avoid issues with Next.js bundler
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfParseMod = (await import("pdf-parse")) as any;
      const pdfParse = pdfParseMod.default ?? pdfParseMod;
      const result = await pdfParse(buffer);
      text = result.text;
    } else if (isDocx) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    }

    // Clean up excessive whitespace
    text = text.replace(/\s+/g, " ").trim();

    if (text.length < 40) {
      throw new AppError(
        "CONTENT_TOO_SHORT",
        "Could not extract meaningful text from the file.",
        422
      );
    }

    return Response.json({ text }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
