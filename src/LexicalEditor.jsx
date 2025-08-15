import {$getRoot, $getSelection} from 'lexical';
import {useRef, useEffect, useState} from 'react';

import {AutoFocusPlugin} from '@lexical/react/LexicalAutoFocusPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';

import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import {TRANSFORMERS} from '@lexical/markdown';

import ToolbarPlugin from './plugins/ToolbarPlugin';
import { ToolbarContext } from './plugins/ToolbarPlugin/ToolbarContext';
import { AutoNumberer } from './plugins/NumberingPlugin/AutoNumberer';
import { useDocumentOptions } from './plugins/Options/DocumentOptionsContext';
import { setGlobalCSSRule } from './utils/generalUtils';
import { AutoOptionsPanel } from './plugins/Options/OptionsPanel';
import { DocumentStructureProvider } from './plugins/NumberingPlugin/DocumentStructureContext';
import ImagesPlugin from './plugins/ImagesPlugin';
import MathPlugin from './plugins/MathPlugin';
import { useDisplayOptions, zoomFactors, zoomLevelToText } from './plugins/DisplayOptionsContext';
import { $isNumberedHeadingNode } from './nodes/NumberedHeadingNode';
import { AbstractNodePlugin } from './plugins/AbstractNodePlugin';
import { AuthorshipPlugin } from './nodes/AuthorNodes';
import { VirtualKeyboardContainer } from './plugins/MathPlugin/VirtualKeyboard';
import { showToast } from './ui/Toast';
import { AffiliationsPlugin } from './nodes/AffiliationNodes';
import PreventRefocusPlugin from './plugins/PreventRefocusPlugin';

function Editor() {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);
  const {documentOptions} = useDocumentOptions();
  const {displayOptions,setDisplayOption} = useDisplayOptions();
  const editorRef = useRef(null);

  const updateDocumentCSS = () => { // Update CSS when documentOptions is modified
    setGlobalCSSRule(".editor-base","--fontsize-base",`${String(documentOptions.general.fontSize)}pt`);
    setGlobalCSSRule(".editor-base","--marginleft-base",`${String(documentOptions.general.margins.left)}mm`);
    setGlobalCSSRule(".editor-base","--marginright-base",`${String(documentOptions.general.margins.right)}mm`);
    setGlobalCSSRule(".editor-base","--margintop-base",`${String(documentOptions.general.margins.top)}mm`);
    setGlobalCSSRule(".editor-base","--marginbottom-base",`${String(documentOptions.general.margins.bottom)}mm`);
    setGlobalCSSRule(".editor-paragraph","text-indent",documentOptions.paragraphs.indentFirst?"var(--paragraph-indent)":"");
    setGlobalCSSRule(".editor-title","font-size",`var(--fontsize-${documentOptions.title.relativeFontSize})`);
    setGlobalCSSRule(".real-page-width .editor-base","column-count",documentOptions.general.twoColumns?"2":"1");
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
          if (node.setDocumentOptions) {
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
    
  useEffect(() => {
      const zoomIn = () => {
        if (displayOptions.zoomLevel<zoomFactors.length-1){
          const newZoomLevel = displayOptions.zoomLevel+1
          setDisplayOption("zoomLevel",newZoomLevel);
          showToast(zoomLevelToText(newZoomLevel),1000);
        }
      }
      const zoomOut = () => {
          if (displayOptions.zoomLevel>=1) { 
            const newZoomLevel = displayOptions.zoomLevel-1;
            setDisplayOption("zoomLevel",newZoomLevel);
            showToast(zoomLevelToText(newZoomLevel),1000);
          }
      }
      const element = editorRef.current;
      const handleWheel = (e) => {
          if (e.ctrlKey) {
              e.preventDefault();
              if (e.deltaY>0) zoomOut(); else zoomIn();
          }
      };
      
      element?.addEventListener('wheel', handleWheel, { passive: false });
      
      return () => {
          element?.removeEventListener('wheel', handleWheel);
      };
  }, [displayOptions]);

  return (
    <>
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
          <div id="main-editor-container" className="editor-container">
            <RichTextPlugin
            contentEditable={
              <ContentEditable
                id='main-editor'
                aria-placeholder={""}
                placeholder={<></>}
                className='editor-base'
                spellCheck={false}
                ref={editorRef}
              />
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
          </div>
          <HistoryPlugin />
          <AutoFocusPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS}/>
          <AutoNumberer/>
          <ImagesPlugin/>
          <MathPlugin/>
          <AbstractNodePlugin/>
          <AuthorshipPlugin/>
          <AffiliationsPlugin/>
          <PreventRefocusPlugin />
        </div>
        <VirtualKeyboardContainer/>
    </>
  );
}

export default Editor;