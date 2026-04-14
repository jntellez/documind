import React, { createContext, useContext, useRef } from 'react';
import { Document } from 'types/api';

interface DocumentCacheContextType {
  getDocument: (id: number) => Document | undefined;
  setDocument: (id: number, document: Document) => void;
  clearCache: () => void;
}

const DocumentCacheContext = createContext<DocumentCacheContextType>({} as DocumentCacheContextType);

export const useDocumentCache = () => useContext(DocumentCacheContext);

export const DocumentCacheProvider = ({ children }: { children: React.ReactNode }) => {
  const cacheRef = useRef<Map<number, Document>>(new Map());

  const getDocument = (id: number) => {
    return cacheRef.current.get(id);
  };

  const setDocument = (id: number, document: Document) => {
    cacheRef.current.set(id, document);
  };

  const clearCache = () => {
    cacheRef.current.clear();
  };

  return (
    <DocumentCacheContext.Provider value={{ getDocument, setDocument, clearCache }}>
      {children}
    </DocumentCacheContext.Provider>
  );
};