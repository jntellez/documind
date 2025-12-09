import { FilePickerResult, ProcessedDocument, Document } from "types/api";
import * as DocumentPicker from "expo-document-picker";
import Toast from "react-native-toast-message";
import { tokenStorage } from "@/lib/storage";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

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
      throw new Error(data.error || "Error al procesar el documento");
    }

    return data as ProcessedDocument;
  } catch (error) {
    throw error;
  }
}

export async function pickDocument(): Promise<FilePickerResult | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled) {
      return null;
    }

    const file = result.assets[0];

    const maxSize = 10 * 1024 * 1024;
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

export interface SaveDocumentResponse {
  success: boolean;
  document: Document;
}

export async function saveDocument(
  document: ProcessedDocument
): Promise<SaveDocumentResponse> {
  try {
    const token = await tokenStorage.get();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/save-document`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(document),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error saving document");
    }

    return data as SaveDocumentResponse;
  } catch (error) {
    throw error;
  }
}

export interface GetDocumentsResponse {
  success: boolean;
  documents: Document[];
  count: number;
}

export async function getDocuments(): Promise<GetDocumentsResponse> {
  try {
    const token = await tokenStorage.get();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/documents`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error fetching documents");
    }

    return data as GetDocumentsResponse;
  } catch (error) {
    throw error;
  }
}

export async function getDocumentById(id: number): Promise<Document> {
  try {
    const token = await tokenStorage.get();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error fetching document");
    }

    return data.document as Document;
  } catch (error) {
    throw error;
  }
}

export async function deleteDocument(id: number): Promise<void> {
  try {
    const token = await tokenStorage.get();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error deleting document");
    }
  } catch (error) {
    throw error;
  }
}
