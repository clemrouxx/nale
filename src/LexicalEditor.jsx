import {$getRoot, $getSelection} from 'lexical';
import {useContext, useEffect, useState} from 'react';

import {AutoFocusPlugin} from '@lexical/react/LexicalAutoFocusPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';

import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import {$convertFromMarkdownString, TRANSFORMERS} from '@lexical/markdown';

import ExportButton from './ActionBar';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import { ToolbarContext } from './context/ToolbarContext';
import { AutoNumberer } from './plugins/NumberedHeadingPlugin/AutoNumberer';
import { DEFAULT_DOCUMENT_OPTIONS } from './plugins/Options/documentOptions';
import { $isNumberedHeadingNode } from './plugins/NumberedHeadingPlugin/NumberedHeadingNode';
import { useDocumentOptions } from './plugins/Options/DocumentOptionsContext';

function Editor() {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);
  const {documentOptions,setDocumentOptions} = useDocumentOptions();

  const test = () => {
    setDocumentOptions({
      headings : {
          numberingStyles : {1 : "a", 2 : "Alph", 3 : "alph"}, // { <headingLevel> : <style> }
          numberingTemplates : {1 : "{}", 2 : "{}.{}", 3 : "{}.{}.{}"}, // { <headingLevel> : <template> }
      }
    });
  }

  useEffect(() => {
    if (!editor || !documentOptions) return;
  
    editor.update(()=>{
      const root = $getRoot();
      const visit = (node) => {
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
  }, [documentOptions, editor]);

  

  return (
    <>
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
      <AutoNumberer />
      
      <ExportButton />
      <button onClick={test}>Test</button>
    </>
  );
}

export default Editor;