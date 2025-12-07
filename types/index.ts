import { Document, ProcessedDocument } from "./api";

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  Document: DocumentParamList;
};

export type RootTabParamList = {
  Home: undefined;
  Documents: undefined;
  Settings: undefined;
};

export type DocumentParamList = {
  data?: ProcessedDocument | Document;
};
