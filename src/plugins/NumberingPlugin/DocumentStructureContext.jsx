import React, { createContext, useState, useContext } from 'react';

const EXAMPLE_BIBLIO = [{key:"Example1",author:[{firstName:"Emmy",lastName:"Noether"}],title:"Example of an article that would have been written by E. Noether."},{key:"Example2",author:[{firstName:"Gaspard",lastName:"Monge"}],title:"Another example of bibliographic reference."}];

const Context = createContext();

export function DocumentStructureProvider({ children }) {
  const [numberedHeadings,setNumberedHeadings] = useState([]);
  const [biblio,setBiblio] = useState(EXAMPLE_BIBLIO);
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