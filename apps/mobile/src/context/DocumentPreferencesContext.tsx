import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type DocumentContentFontSize = "small" | "medium" | "large";

interface DocumentPreferencesState {
  showImagesInDetail: boolean;
  documentContentFontSize: DocumentContentFontSize;
}

interface DocumentPreferencesContextValue extends DocumentPreferencesState {
  setShowImagesInDetail: (value: boolean) => void;
  setDocumentContentFontSize: (value: DocumentContentFontSize) => void;
}

const STORAGE_KEY = "document_detail_preferences";

const DEFAULT_PREFERENCES: DocumentPreferencesState = {
  showImagesInDetail: true,
  documentContentFontSize: "medium",
};

const DocumentPreferencesContext = createContext<DocumentPreferencesContextValue | null>(null);

export function DocumentPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<DocumentPreferencesState>(DEFAULT_PREFERENCES);

  useEffect(() => {
    async function loadPreferences() {
      try {
        const serializedPreferences = await AsyncStorage.getItem(STORAGE_KEY);
        if (!serializedPreferences) return;

        const parsedPreferences = JSON.parse(serializedPreferences) as Partial<DocumentPreferencesState>;
        setPreferences((current) => ({
          ...current,
          ...parsedPreferences,
        }));
      } catch {
        // Keep defaults if stored value is invalid.
      }
    }

    void loadPreferences();
  }, []);

  const persistPreferences = useCallback((nextPreferences: DocumentPreferencesState) => {
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextPreferences));
  }, []);

  const setShowImagesInDetail = useCallback((value: boolean) => {
    setPreferences((current) => {
      const nextPreferences = {
        ...current,
        showImagesInDetail: value,
      };

      persistPreferences(nextPreferences);
      return nextPreferences;
    });
  }, [persistPreferences]);

  const setDocumentContentFontSize = useCallback((value: DocumentContentFontSize) => {
    setPreferences((current) => {
      const nextPreferences = {
        ...current,
        documentContentFontSize: value,
      };

      persistPreferences(nextPreferences);
      return nextPreferences;
    });
  }, [persistPreferences]);

  const value = useMemo(() => ({
    ...preferences,
    setShowImagesInDetail,
    setDocumentContentFontSize,
  }), [preferences, setDocumentContentFontSize, setShowImagesInDetail]);

  return (
    <DocumentPreferencesContext.Provider value={value}>
      {children}
    </DocumentPreferencesContext.Provider>
  );
}

export function useDocumentPreferences() {
  const context = useContext(DocumentPreferencesContext);

  if (!context) {
    throw new Error("useDocumentPreferences must be used inside DocumentPreferencesProvider");
  }

  return context;
}
