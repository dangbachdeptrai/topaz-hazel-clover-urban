/** Resize/compress camera photos so Thiên Nhãn OCR đọc nhanh và không vượt hạn mức. */
export async function compressForOcr(file: File): Promise<{ mime: string; dataB64: string; name: string }> {
  if (!file.type.startsWith("image/")) {
    const dataB64 = await readAsDataUrl(file);
    return { mime: file.type || "application/octet-stream", dataB64, name: file.name };
  }
  const bitmap = await createImageBitmap(file);
  const max = 1600;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    const dataB64 = await readAsDataUrl(file);
    return { mime: file.type, dataB64, name: file.name };
  }
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Không nén được ảnh"))), "image/jpeg", 0.84);
  });
  const dataB64 = await readAsDataUrl(new File([blob], "ocr.jpg", { type: "image/jpeg" }));
  return { mime: "image/jpeg", dataB64, name: file.name.replace(/\.[^.]+$/, "") + ".jpg" };
}

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Không đọc được file"));
    r.readAsDataURL(file);
  });
}
