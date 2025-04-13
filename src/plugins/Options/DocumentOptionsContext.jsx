import { DEFAULT_DOCUMENT_OPTIONS } from "./documentOptions";
import { createContext, useState, useContext } from "react";

const DocumentOptionsContext = createContext();

export function DocumentOptionsProvider({ children }) {
  const [documentOptions, setDocumentOptions] = useState(DEFAULT_DOCUMENT_OPTIONS);

  return (
    <DocumentOptionsContext.Provider value={{ documentOptions, setDocumentOptions }}>
      {children}
    </DocumentOptionsContext.Provider>
  );
}

export function useDocumentOptions() {
    return useContext(DocumentOptionsContext);
}