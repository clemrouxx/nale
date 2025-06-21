

// Export/Save editor state to file
export function saveInFile(editor, fileName = 'article.nale') {
  const editorState = editor.getEditorState();
  const serializedState = JSON.stringify(editorState.toJSON(), null, 2);

  console.log(serializedState);
  
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
  //link.click(); !!!
  document.body.removeChild(link);
  
  // Clean up object URL
  URL.revokeObjectURL(url);
}