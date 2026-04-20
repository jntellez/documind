import type {
  Document,
  GetDocumentsResponse,
  ProcessedDocument,
  SaveDocumentRequest,
  SaveDocumentResponse,
} from "@documind/types";
import * as DocumentPicker from "expo-document-picker";
import { showToast } from "@/components/ui/Toast";
import { apiRequest, authenticatedApiRequest } from "./apiClient";

type FilePickerResult = {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
};

export async function processUrl(url: string): Promise<ProcessedDocument> {
  return apiRequest<ProcessedDocument>("/api/process-url", {
    method: "POST",
    body: { url },
    errorMessage: "Error al procesar el documento",
  });
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
      showToast({
        type: "error",
        text1: "File too large",
        text2: "Maximum file size is 10MB",
      });
      return null;
    }

    const validMimeTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];

    if (!validMimeTypes.includes(file.mimeType || "")) {
      showToast({
        type: "error",
        text1: "Invalid file type",
        text2: "Only PDF, DOCX, and PPTX files are supported",
      });
      return null;
    }

    showToast({
      type: "success",
      text1: "File selected",
      text2: file.name,
    });

    return {
      uri: file.uri,
      name: file.name,
      size: file.size || 0,
      mimeType: file.mimeType || "",
    };
  } catch (error: any) {
    showToast({
      type: "error",
      text1: "Error",
      text2: error.message || "Failed to select file",
    });
    return null;
  }
}

export async function saveDocument(
  document: ProcessedDocument,
): Promise<SaveDocumentResponse> {
  return authenticatedApiRequest<SaveDocumentResponse>("/api/save-document", {
    method: "POST",
    body: document satisfies SaveDocumentRequest,
    errorMessage: "Error saving document",
  });
}

export async function getDocuments(): Promise<GetDocumentsResponse> {
  return authenticatedApiRequest<GetDocumentsResponse>("/api/documents", {
    method: "GET",
    errorMessage: "Error fetching documents",
  });
}

export async function getDocumentById(id: number): Promise<Document> {
  const data = await authenticatedApiRequest<{ document: Document }>(
    `/api/documents/${id}`,
    {
      method: "GET",
      errorMessage: "Error fetching document",
    },
  );

  return data.document;
}

export async function deleteDocument(id: number): Promise<void> {
  await authenticatedApiRequest(`/api/documents/${id}`, {
    method: "DELETE",
    errorMessage: "Error deleting document",
  });
}

export async function updateDocument(
  id: number,
  data: Partial<Document>,
): Promise<Document> {
  const responseData = await authenticatedApiRequest<{ document?: Document } & Document>(
    `/api/documents/${id}`,
    {
      method: "PATCH",
      body: data,
      errorMessage: "Failed to update document",
    },
  );

  return responseData.document || responseData;
}
