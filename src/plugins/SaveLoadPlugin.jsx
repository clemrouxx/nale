

// Export/Save editor state to file
export function saveInFile(editor, documentOptions, biblio, nextLabelNumber, fileName = 'article.nale') {
  const editorState = editor.getEditorState().toJSON();
  const toSave = {editorState,documentOptions,biblio,documentStructure:{nextLabelNumber}};
  const serializedState = JSON.stringify(toSave, null, 2);

  //console.log(toSave);
  
  // Create blob and download link
  const blob = new Blob([serializedState], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // Create temporary download link
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up object URL
  URL.revokeObjectURL(url);
}

function importFile(editor, setDocumentOptions, setBiblio, setNextLabelNumber, file) {
  const reader = new FileReader();
  
  reader.onload = (event) => {
    try {
      const content = event.target.result;
      const parsedContent = JSON.parse(content);
      console.log(parsedContent);
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

// File input handler for loading files
export function handleFileChange(editor, setDocumentOptions, setBiblio, setNextLabelNumber, event) {
  const file = event.target.files[0];
  if (!file) return;
  
  if (file.type !== 'application/json' && !file.name.endsWith('.nale')) {
    alert('Please select a valid .nale file');
    return;
  }
  
  importFile(editor, setDocumentOptions, setBiblio, setNextLabelNumber, file);
}

