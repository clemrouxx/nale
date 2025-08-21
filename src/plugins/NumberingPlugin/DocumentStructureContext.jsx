import React, { createContext, useState, useContext } from 'react';

const Context = createContext();

export function DocumentStructureProvider({ children }) {
  const [numberedHeadings,setNumberedHeadings] = useState([]);
  const [biblio,setBiblio] = useState([]);
  const [figures,setFigures] = useState([]);
  const [numberedEquations,setNumberedEquations] = useState([]);
  const [nextLabelNumber,setNextLabelNumber] = useState(0);
  
  const contextValue = {
    numberedHeadings,
    setNumberedHeadings,
    biblio,
    setBiblio,
    figures,
    setFigures,
    numberedEquations,
    setNumberedEquations,
    nextLabelNumber,
    setNextLabelNumber,
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