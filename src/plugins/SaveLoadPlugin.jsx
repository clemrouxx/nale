import { createContext, useContext, useState, useEffect } from 'react';
import { useDocumentOptions } from './Options/DocumentOptionsContext';
import { useDocumentStructureContext } from './NumberingPlugin/DocumentStructureContext';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { showToast } from '../ui/Toast';
import { $getRoot, $isElementNode, CLEAR_HISTORY_COMMAND } from 'lexical';
import { jsonToBib } from '../utils/bibliographyUtils';
import { completeDocumentOptions } from './Options/documentOptions';
import { convertToLatex, getLatex } from './LatexExportPlugin/latexUtils';
import { $isImageNode } from '../nodes/ImageNodes';

async function compileUntilStable(engine, maxRuns = 5) {
  let result = {};
  let log = "";
  console.log("RUNNING (first run)");
  for (let i = 0; i < maxRuns; i++) {
    result = await engine.compileLaTeX();
    log = result.log;

    let refs_labels = result.log.includes("Rerun to get cross-references right") || result.log.includes("Label(s) may have changed");
    let biblio = result.log.includes("undefined references")
    
    if (!(refs_labels || biblio)) break;

    let reason = (refs_labels && biblio)?"internal references and citations":(refs_labels?"internal references":"citations");
    console.log(`Recompiling for ${reason}.`);
  }
  return result;
}

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
    const options = {
          suggestedName:"article.nale",
          types: [{ description: 'NALE files', accept: { 'application/nale': ['.nale'] } }]
        };
    try{
      const fileHandle = await window.showSaveFilePicker(options);
      setLastFileHandle(fileHandle);
      setLastFilename(fileHandle.name);
      const writable = await fileHandle.createWritable();
      await writable.write(getTextToSave());
      await writable.close();
      editor.dispatchCommand(CLEAR_HISTORY_COMMAND); // Reset History
      return true; // Success
    } catch(error) {
      if (error.name === 'AbortError') {
        return true;
      }
      throw error;
    }
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

  // File input handler for loading files (without the API)
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/json' && !file.name.endsWith('.nale')) {
      showToast('Please select a valid .nale file');
      return;
    }
    setLastFilename(getOriginalFilename(file.name));
    importFile(editor, setDocumentOptions, setBiblio, setNextLabelNumber, file);
  }

  // Function to open a file and get its handle for later saving (if possible)
  const openFile = async () => {
    try {
      // Check if the File System Access API is supported
      if (!isFileApiAvaillable()) {
        document.getElementById('mainFileInput').click();// Use the default method
      }

      // Configure file picker options (optional)
      const options = {
        types: [
          {
            description: 'NaLE file',
            accept: {"application/nale":[".nale"]}
          },
        ],
        excludeAcceptAllOption: true,
        multiple: false,
      };

      const [fileHandle] = await window.showOpenFilePicker(options);
      const file = await fileHandle.getFile();
      
      setLastFileHandle(fileHandle);
      importFile(editor, setDocumentOptions, setBiblio, setNextLabelNumber, file);
      
    } catch (error) {
      if (!error.name === 'AbortError') {
        showToast('Error while opening file', 3000,"error");
        console.error('Error while opening file', error);
      }
      return null;
    }
  };

  const compile = async ()=>{
    try {
      const engine = new PdfTeXEngine();
      
      if (!engine) throw new Error("PdfTeXEngine not loaded");
      await engine.loadEngine();
      
      // Write files to WASM FS
      
      const latex = getLatex(editor,documentOptions); // For some reason, does not work with empty files.
      engine.writeMemFSFile("main.tex", latex);
      
      if (biblio.length > 0){
        engine.writeMemFSFile("references.bib", jsonToBib(biblio));
      }
      const imgFiles = await getAllImageFiles(editor);
      if (imgFiles.length>0){
        engine.makeMemFSFolder("images");
        for (let img of imgFiles) {
          engine.writeMemFSFile(img.name, new Uint8Array(await img.content.arrayBuffer()));
        }
      }

      engine.setEngineMainFile("main.tex");

      //const result = await engine.compileLaTeX();
      const result = await compileUntilStable(engine,5);

      if (result.pdf){
        const blob = new Blob([result.pdf], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        window.open(url);
      }
      else{
        showToast("Compilation failed. See console for full log.",3000,"error");
        console.log(result.log);
      }
      
    } catch (e) {
      showToast("Compilation failed. See console for details.",3000,"error");
      console.error("Compilation error:", e);
    }
  }

  const downloadCompilationZip = async ()=>{
    const files = [
      { name: 'README.md', content: '# NaLE Compilation-ready folder\n\nThis folder contains all the necessary files for you to create your pdf. \nThis is done by running a LaTeX PDF compiler in this folder. \nTo do this, we advise you to : \n- Download TeX Live from https://tug.org/texlive/ \n- In a command promp in this folder (on Windows, the Powershell will do), run "latexmk -pdf main.tex"\n- This should create your PDF document "main.pdf", as well as a bunch of other files. You can get rid of them by running "latexmk -pdf -c main.tex".'},
      { name: 'main.tex', content: getLatex(editor,documentOptions)},
    ];

    // Images
    const newFiles = await getAllImageFiles(editor);
    files.push(...newFiles);

    // Bibliographic references
    if (biblio.length > 0){
      files.push({name:"references.bib", content:jsonToBib(biblio)});
    }
    
    try {
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();
        files.forEach(file => {
          zip.file(file.name, file.content);
        });

        // Generate ZIP file
        const content = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: {level: 6}});
        
        const url = URL.createObjectURL(content);
        saveFromLink(url,"test.zip");
        URL.revokeObjectURL(url);
        
      } catch (error) {
        console.error('Error creating ZIP:', error);
        showToast('Error creating exporting project: ' + error.message,5000,"error");
      }
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
      handleFileChange,
      openFile,
      downloadCompilationZip,
      compile
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
    let parsedContent = null;
    try {
      const content = event.target.result;
      parsedContent = JSON.parse(content);
    } catch (error) {
      console.error('Invalid file format:', error.message);
      showToast('Error: Invalid file format',3000,"error");
      return;
    }
    // Parse and set the editor state
    const editorState = editor.parseEditorState(parsedContent.editorState);
    try {
      editor.setEditorState(editorState);
    } catch (error) {
      console.error("Error while setting editor state from file : ",error);
    }// try to continue anyway

    setDocumentOptions(completeDocumentOptions(parsedContent.documentOptions));// For backwards compatibility
    setBiblio(parsedContent.biblio);
    setNextLabelNumber(parsedContent.documentStructure.nextLabelNumber);
    editor.dispatchCommand(CLEAR_HISTORY_COMMAND); // Reset History
  };
  
  reader.onerror = () => {
    console.error('Failed to read file');
    showToast('Error: Failed to read file',3000,"error");
  };
  
  reader.readAsText(file);
}

function downloadJsonFile(filename,content){
  // Create blob and download link
  const blob = new Blob([content], { type: 'application/json' });
  directBlobDownload(blob,filename);
}

function directBlobDownload(blob,filename){
  const url = URL.createObjectURL(blob);
  directLinkDownload(url,filename);
  // Clean up object URL
  URL.revokeObjectURL(url);
}

function directLinkDownload(url,filename){
  // Create temporary download link
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const getOriginalFilename = (filename) => {
  // Remove " (number)" pattern before the file extension
  return filename.replace(/ \(\d+\)(?=\.[^.]*$)/, '');
};

function isFileApiAvaillable(){
  return ('showSaveFilePicker' in window);
}

export async function saveToTextFile(textContent,filename,filetype=null){
  if (isFileApiAvaillable()){
    const options = { suggestedName:filename,types: [filetype]};
    const fileHandle = await window.showSaveFilePicker(options);
    const writable = await fileHandle.createWritable();
    await writable.write(textContent);
    await writable.close();
  }
  else{
    const blob = new Blob([textContent]);
    directBlobDownload(blob,filename);
  }
}

async function saveFromLink(url,filename) {
  // Without file system api for now
  directLinkDownload(url,filename);
}

export async function urlToBlob(url){
  const response = await fetch(url);
  const blob = await response.blob();
  return blob;
}

async function getAllImageFiles(editor) {
  const imageFiles = editor.read(() => {
    const root = $getRoot();
    const imageFiles = [];
    
    function traverse(node) {
      if ($isImageNode(node)) {
        imageFiles.push({name:node.getFilename(),src:node.getSrc()});
      }
      
      // Only element nodes have children
      if ($isElementNode(node)) { 
        node.getChildren().forEach(traverse);
      }
    }
    
    traverse(root);
    return imageFiles;
  });

  await Promise.all(imageFiles.map(async (elmt) => {
    elmt.content = await urlToBlob(elmt.src);
  }));

  return imageFiles;
}