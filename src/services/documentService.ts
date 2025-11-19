import { ProcessedDocument } from "types/api";

const API_BASE_URL = "http://192.168.1.10:3000";

export async function processUrl(url: string): Promise<ProcessedDocument> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/process-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Si la API devuelve un error (400, 500), lo lanzamos
      throw new Error(data.error || "Error al procesar el documento");
    }

    return data as ProcessedDocument;
  } catch (error) {
    console.error("API Error:", error);
    throw error; // Re-lanzamos el error para que la UI lo maneje
  }
}
