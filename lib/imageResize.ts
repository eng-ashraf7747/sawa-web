// C:\sawa-web\lib\imageResize.ts

import { MAX_UPLOAD_IMAGE_SIZE_BYTES } from "@/lib/profileValidation";

const DEFAULT_MAX_DIMENSION_PX = 400;
const MIN_QUALITY = 0.5;
const QUALITY_STEP = 0.1;
const MAX_ITERATIONS = 15;
const OUTPUT_MIME_TYPE = "image/jpeg";

export interface ResizeImageOptions {
  maxDimensionPx?: number;
  targetSizeBytes?: number;
  initialQuality?: number;
  outputMimeType?: string;
}

// ─── تحميل الملف كصورة فعلية، مع احترام دوران EXIF تلقائيًا (بدون أي مكتبة خارجية) ───
// أثر جانبي مقصود ومفيد: أي ملف غير صورة حقيقية هيفشل هنا تلقائيًا برسالة واضحة
const loadImageBitmap = (file: File): Promise<ImageBitmap> => {
  return createImageBitmap(file, { imageOrientation: "from-image" }).catch(() => {
    throw new Error("الملف المختار ليس صورة صالحة");
  });
};

const drawResizedImage = (source: ImageBitmap, maxDimensionPx: number): HTMLCanvasElement => {
  const scale = Math.min(1, maxDimensionPx / Math.max(source.width, source.height));
  const width = Math.round(source.width * scale);
  const height = Math.round(source.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) {
    throw new Error("تعذر معالجة الصورة في هذا المتصفح");
  }

  ctx.drawImage(source, 0, 0, width, height);
  source.close(); // تحرير ذاكرة الـ Bitmap فورًا بعد الرسم عليه

  return canvas;
};

const canvasToBlob = (canvas: HTMLCanvasElement, quality: number, mimeType: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("تعذر إنشاء الصورة المصغّرة"))),
      mimeType,
      quality
    );
  });
};

// ─── تصغير الصورة لحجم وأبعاد مناسبين قبل الرفع، مع احترام اتجاهها الأصلي ───────
export const resizeImage = async (
  file: File,
  options: ResizeImageOptions = {}
): Promise<Blob> => {
  try {
    const maxDimensionPx = options.maxDimensionPx ?? DEFAULT_MAX_DIMENSION_PX;
    const targetSizeBytes = options.targetSizeBytes ?? MAX_UPLOAD_IMAGE_SIZE_BYTES;
    const mimeType = options.outputMimeType ?? OUTPUT_MIME_TYPE;
    let quality = options.initialQuality ?? 0.85;
    let iterations = 0;

    const bitmap = await loadImageBitmap(file);
    const canvas = drawResizedImage(bitmap, maxDimensionPx);

    let blob = await canvasToBlob(canvas, quality, mimeType);

    while (blob.size > targetSizeBytes && quality > MIN_QUALITY && iterations < MAX_ITERATIONS) {
      iterations++;
      quality = Math.max(MIN_QUALITY, quality - QUALITY_STEP);
      blob = await canvasToBlob(canvas, quality, mimeType);
    }

    canvas.width = 0;
    canvas.height = 0;

    return blob;
  } catch (error) {
    console.error("Image resize failed:", error);
    throw error instanceof Error ? error : new Error("فشلت معالجة الصورة");
  }
};