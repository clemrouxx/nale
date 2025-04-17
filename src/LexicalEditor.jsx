import {$getRoot, $getSelection} from 'lexical';
import {useContext, useEffect, useState} from 'react';

import {AutoFocusPlugin} from '@lexical/react/LexicalAutoFocusPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';

import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import {TRANSFORMERS} from '@lexical/markdown';

import ExportButton from './ActionBar';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import { ToolbarContext } from './plugins/ToolbarPlugin/ToolbarContext';
import { AutoNumberer } from './plugins/NumberedHeadingPlugin/AutoNumberer';
import { $isNumberedHeadingNode } from './plugins/NumberedHeadingPlugin/NumberedHeadingNode';
import { useDocumentOptions } from './plugins/Options/DocumentOptionsContext';
import { setGlobalCSSRule } from './utils/generalUtils';
import { AutoOptionsPanel, OptionsPanel } from './plugins/Options/OptionsPanel';

function Editor() {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);
  const {documentOptions} = useDocumentOptions();

  const updateDocumentCSS = () => { // Update CSS when documentOptions is modified
    setGlobalCSSRule("#main-textbox","--fontsize-base",`${String(documentOptions.general.fontSize)}pt`);
    setGlobalCSSRule(".editor-paragraph","text-indent",documentOptions.paragraphs.indentFirst?"var(--paragraph-indent)":"");
  }

  // Changed documentOptions
  useEffect(() => { 
    if (!editor || !documentOptions) return;

    // CSS modifications
    updateDocumentCSS();
    
    // Direct node modifications
    editor.update(()=>{
      const root = $getRoot();
      const visit = (node) => { // Can be simplified : no recursion needed
          if ($isNumberedHeadingNode(node)) {
            node.setDocumentOptions(documentOptions);
          }
          
          // Recurse through children
          if (node.getChildren) {
            node.getChildren().forEach(visit);
          }
      };
      visit(root);
    });

  }, [documentOptions]);

  return (
    <div className='horizontal-layout'>
      <AutoOptionsPanel/>
      <div className='editor-block'>
        <ToolbarContext>
          <ToolbarPlugin
              editor={editor}
              activeEditor={activeEditor}
              setActiveEditor={setActiveEditor}
              setIsLinkEditMode={setIsLinkEditMode}
            />
        </ToolbarContext>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                aria-placeholder={""}
                placeholder={<></>}
                id='main-textbox'
                spellCheck={false}
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        <HistoryPlugin />
        <AutoFocusPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS}/>
        
        <ExportButton />
      </div>
    </div>
  );
}

export default Editor;