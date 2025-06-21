

// Export/Save editor state to file
export function saveInFile(editor, documentOptions, biblio, fileName = 'article.nale') {
  const editorState = editor.getEditorState().toJSON();
  const toSave = {editorState:editorState,documentOptions:documentOptions,bibliography:biblio};
  const serializedState = JSON.stringify(toSave, null, 2);

  console.log(toSave);
  
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