import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "No file was uploaded.",
        },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Uploaded file is empty.",
        },
        { status: 400 }
      );
    }

    // Maximum file size: 10 MB
    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: "File size must be less than 10 MB.",
        },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Only PDF, JPG, JPEG and PNG files are allowed.",
        },
        { status: 400 }
      );
    }

    const extension = path.extname(file.name).toLowerCase();

    const safeFileName =
      `${Date.now()}-${crypto.randomUUID()}${extension}`;

    const uploadDirectory = path.join(
      process.cwd(),
      "public",
      "uploads",
      "registrations"
    );

    await mkdir(uploadDirectory, {
      recursive: true,
    });

    const filePath = path.join(
      uploadDirectory,
      safeFileName
    );

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(filePath, buffer);

    const fileUrl =
      `/uploads/registrations/${safeFileName}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: file.name,
      documentType: file.type,
    });
  } catch (error) {
    console.error("File upload error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to upload file.",
      },
      { status: 500 }
    );
  }
}