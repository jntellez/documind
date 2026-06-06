import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const iconPath = fileURLToPath(new URL("../../../../mobile/assets/icon.png", import.meta.url));

export async function GET() {
  const icon = await readFile(iconPath);

  return new Response(icon, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
