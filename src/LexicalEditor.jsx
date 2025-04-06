import {$getRoot, $getSelection} from 'lexical';
import {useEffect, useState} from 'react';

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


function Editor() {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);

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
            aria-placeholder={'Enter some text...'}
            placeholder={<div>Enter some text...</div>}
            id='main-textbox'
          />
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <AutoFocusPlugin />
      <MarkdownShortcutPlugin transformers={TRANSFORMERS}/>
      
      <ExportButton />
    </>
  );
}

export default Editor;