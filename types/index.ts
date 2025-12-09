import { Document, ProcessedDocument } from "./api";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { StackScreenProps } from "@react-navigation/stack";

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

// Stack Screen Props
export type LoginScreenProps = StackScreenProps<RootStackParamList, "Login">;
export type DocumentScreenProps = StackScreenProps<
  RootStackParamList,
  "Document"
>;

// Tab Screen Props
export type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, "Home">,
  StackScreenProps<RootStackParamList>
>;

export type DocumentsScreenProps = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, "Documents">,
  StackScreenProps<RootStackParamList>
>;

export type SettingsScreenProps = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, "Settings">,
  StackScreenProps<RootStackParamList>
>;
