import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const ogImagePath = fileURLToPath(new URL("../../../../../assets/marketing/og/documind-og-image.png", import.meta.url));

export async function GET() {
  const image = await readFile(ogImagePath);

  return new Response(image, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
