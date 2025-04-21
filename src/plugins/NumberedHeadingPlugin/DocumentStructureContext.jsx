import React, { createContext, useState, useContext } from 'react';

const Context = createContext();

export function DocumentStructureProvider({ children }) {
  const [numberedHeadings,setNumberedHeadings] = useState([]);
  const [biblio,setBiblio] = useState([]);
  
  const contextValue = {
    numberedHeadings,
    setNumberedHeadings,
    biblio,
    setBiblio
  };
  
  return (
    <Context.Provider value={contextValue}>
      {children}
    </Context.Provider>
  );
}

export function useDocumentStructureContext() {
  const context = useContext(Context);
  
  if (context === undefined) {
    throw new Error('useDocumentStructureContext must be used within a DocumentStructureProvider');
  }
  
  return context;
}