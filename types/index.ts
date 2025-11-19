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
  data?: {
    title: string;
    content: string;
    originalUrl: string;
  };
};
