import { FilePickerResult, ProcessedDocument } from "types/api";
import * as DocumentPicker from "expo-document-picker";
import Toast from "react-native-toast-message";

const API_BASE_URL = "http://192.168.1.12:3000";

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

export async function pickDocument(): Promise<FilePickerResult | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
        "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
      ],
      copyToCacheDirectory: true,
      multiple: false,
    });

    // Usuario canceló la selección
    if (result.canceled) {
      return null;
    }

    const file = result.assets[0];

    // Validar tamaño del archivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB en bytes
    if (file.size && file.size > maxSize) {
      Toast.show({
        type: "error",
        text1: "File too large",
        text2: "Maximum file size is 10MB",
        position: "bottom",
        visibilityTime: 4000,
        bottomOffset: 40,
      });
      return null;
    }

    // Validar tipo MIME adicional por seguridad
    const validMimeTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];

    if (!validMimeTypes.includes(file.mimeType || "")) {
      Toast.show({
        type: "error",
        text1: "Invalid file type",
        text2: "Only PDF, DOCX, and PPTX files are supported",
        position: "bottom",
        visibilityTime: 4000,
        bottomOffset: 40,
      });
      return null;
    }

    Toast.show({
      type: "success",
      text1: "File selected",
      text2: file.name,
      position: "bottom",
      visibilityTime: 2000,
      bottomOffset: 40,
    });

    return {
      uri: file.uri,
      name: file.name,
      size: file.size || 0,
      mimeType: file.mimeType || "",
    };
  } catch (error: any) {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: error.message || "Failed to select file",
      position: "bottom",
      visibilityTime: 4000,
      bottomOffset: 40,
    });
    return null;
  }
}
