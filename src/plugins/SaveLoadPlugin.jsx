import { createContext, useContext, useState, useEffect } from 'react';
import { useDocumentOptions } from './Options/DocumentOptionsContext';
import { useDocumentStructureContext } from './NumberingPlugin/DocumentStructureContext';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { showToast } from '../ui/Toast';
import { CLEAR_HISTORY_COMMAND } from 'lexical';

// Create the Save Context
const SaveContext = createContext();

// Save Provider Component
export function SaveProvider({ children }) {
  const [lastFilename, setLastFilename] = useState('article.nale');
  const [lastFileHandle, setLastFileHandle] = useState(null);
  const [editor] = useLexicalComposerContext();
  const {documentOptions, setDocumentOptions} = useDocumentOptions();
  const {nextLabelNumber, setNextLabelNumber, biblio, setBiblio} = useDocumentStructureContext();

  // Returns a string to save in a file
  const getTextToSave = () => {
    const editorState = editor.getEditorState().toJSON();
    const toSave = {editorState,documentOptions,biblio,documentStructure:{nextLabelNumber}};
    return JSON.stringify(toSave, null, 2);
  }

  // Export/Save editor state to file (without Api)
  const directSaveInFile = (filename) => {
    setLastFilename(filename);
    const serializedState = getTextToSave();
    downloadJsonFile(filename,serializedState);
    editor.dispatchCommand(CLEAR_HISTORY_COMMAND); // Reset History
  }

  // Same, but using File System Access API
  const saveAsWithApi = async () => {
    console.log(nextLabelNumber);
    const options = {
          suggestedName:"article.nale",
          types: [{ description: 'NALE files', accept: { 'application/nale': ['.nale'] } }]
        };
    const fileHandle = await window.showSaveFilePicker(options);
    setLastFileHandle(fileHandle);
    setLastFilename(fileHandle.name);
    const writable = await fileHandle.createWritable();
    await writable.write(getTextToSave());
    await writable.close();
    editor.dispatchCommand(CLEAR_HISTORY_COMMAND); // Reset History
    return true; // Success
  };

  const saveAs = async () => {
    if (isFileApiAvaillable()){
      await saveAsWithApi();
    }
    else{
      const filename = prompt("Enter filename:" || "article"); // !!! Maybe this should be a nicer modal window
      directSaveInFile(filename+".nale");
    }
  }

  const quickSave = async () => {
    if (isFileApiAvaillable()){
      if (lastFileHandle){
        // Directly overwrite the same file
        const writable = await lastFileHandle.createWritable();
        await writable.write(getTextToSave());
        await writable.close();
        showToast("Saved !",2000,"success");// Needs some user feedback because it is otherwise invisible
        return true;
      }
      else{// First time saving... default to the same as saveAs
        await saveAsWithApi();
      }
    }
    else directSaveInFile(lastFilename);
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

  // Shortcuts
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
      else if (e.ctrlKey && e.key==="o"){
        e.preventDefault();
        document.getElementById('mainFileInput').click();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [lastFileHandle,lastFilename,quickSave,saveAs]);

  return (
    <SaveContext.Provider value={{ 
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
      editor.dispatchCommand(CLEAR_HISTORY_COMMAND); // Reset History
    } catch (error) {
      console.error('Invalid file format:', error.message);
      alert('Error: Invalid file format');
      return;
    }
  };
  
  reader.onerror = () => {
    console.error('Failed to read file');
    alert('Error: Failed to read file');
  };
  
  reader.readAsText(file);
}

function downloadJsonFile(filename,content){
  // Create blob and download link
  const blob = new Blob([content], { type: 'application/json' });
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

const getOriginalFilename = (filename) => {
  // Remove " (number)" pattern before the file extension
  return filename.replace(/ \(\d+\)(?=\.[^.]*$)/, '');
};

function isFileApiAvaillable(){
  return ('showSaveFilePicker' in window);
}