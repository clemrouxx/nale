import { createContext, useContext, useState, useEffect } from 'react';
import { useDocumentOptions } from './Options/DocumentOptionsContext';
import { useDocumentStructureContext } from './NumberingPlugin/DocumentStructureContext';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

// Create the Save Context
const SaveContext = createContext();

// Save Provider Component
export function SaveProvider({ children }) {
  const [lastFilename, setLastFilename] = useState('article.nale');
  const [editor] = useLexicalComposerContext();
  const {documentOptions, setDocumentOptions} = useDocumentOptions();
  const {nextLabelNumber, setNextLabelNumber, biblio, setBiblio} = useDocumentStructureContext();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        quickSave();
      }
      else if (e.ctrlKey && e.key === 'S') {
        e.preventDefault();
        saveAs();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [lastFilename]);

  // Export/Save editor state to file
  const saveInFile = (filename) => {
    setLastFilename(filename);
    const editorState = editor.getEditorState().toJSON();
    const toSave = {editorState,documentOptions,biblio,documentStructure:{nextLabelNumber}};
    const serializedState = JSON.stringify(toSave, null, 2);
    
    // Create blob and download link
    const blob = new Blob([serializedState], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create temporary download link
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up object URL
    URL.revokeObjectURL(url);
  }

  const saveAs = () => {
    const filename = prompt("Enter filename:" || "article");
    saveInFile(filename+".nale");
  }

  const quickSave = () => {
    saveInFile(lastFilename);
  }

  // File input handler for loading files
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/json' && !file.name.endsWith('.nale')) {
      alert('Please select a valid .nale file');
      return;
    }
    setLastFilename(getOriginalFilename(file.name));
    importFile(editor, setDocumentOptions, setBiblio, setNextLabelNumber, file);
  }

  return (
    <SaveContext.Provider value={{ 
      saveInFile, 
      saveAs, 
      quickSave,
      handleFileChange
    }}>
      {children}
    </SaveContext.Provider>
  );
}

// Custom hook to use save context
export function useSaveLoadContext() {
  const context = useContext(SaveContext);
  if (!context) {
    throw new Error('useSaveLoadContext must be used within a SaveProvider');
  }
  return context;
}

function importFile(editor, setDocumentOptions, setBiblio, setNextLabelNumber, file) {
  const reader = new FileReader();
  
  reader.onload = (event) => {
    try {
      const content = event.target.result;
      const parsedContent = JSON.parse(content);
      // Parse and set the editor state
      const editorState = editor.parseEditorState(parsedContent.editorState);
      editor.setEditorState(editorState);
      setDocumentOptions(parsedContent.documentOptions);
      setBiblio(parsedContent.biblio);
      setNextLabelNumber(parsedContent.documentStructure.nextLabelNumber);
    } catch (error) {
      console.error('Invalid file format:', error.message);
      alert('Error: Invalid file format');
    }
  };
  
  reader.onerror = () => {
    console.error('Failed to read file');
    alert('Error: Failed to read file');
  };
  
  reader.readAsText(file);
}

const getOriginalFilename = (filename) => {
  // Remove " (number)" pattern before the file extension
  return filename.replace(/ \(\d+\)(?=\.[^.]*$)/, '');
};