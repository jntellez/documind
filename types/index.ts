import { Document, ProcessedDocument } from "./api";

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  Document: {
    data?: ProcessedDocument | Document;
    documentId?: number;
  };
};

export type RootTabParamList = {
  Home: undefined;
  Documents: undefined;
  Settings: undefined;
};

export type DocumentParamList = {
  data?: ProcessedDocument | Document;
};
