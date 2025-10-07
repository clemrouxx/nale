/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// Copied from https://github.com/facebook/lexical/blob/main/packages/lexical-playground/src/plugins/ToolbarPlugin/index.tsx

import {
  $isCodeNode,
  CODE_LANGUAGE_MAP,
} from '@lexical/code';
import { $patchStyleText } from '@lexical/selection';
import {$isLinkNode} from '@lexical/link';
import {$isListNode, ListNode} from '@lexical/list';
import {$isTableNode, $isTableSelection} from '@lexical/table';
import {
  $findMatchingParent,
  $getNearestNodeOfType,
  IS_APPLE,
  mergeRegister,
} from '@lexical/utils';
import {
  $getSelection,
  $insertNodes,
  $isElementNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import {useCallback, useEffect, useState, useRef} from 'react';

import {
  blockTypeToBlockName,
  useToolbarState,
} from './ToolbarContext';
import DropDown, {DropDownItem, DropDownItemWithIcon} from '../../ui/DropDown';
import useModal from '../../hooks/useModal';
import {getSelectedNode} from '../../utils/getSelectedNode';

import {
  InsertImageDialog,
} from '../ImagesPlugin';

import {SHORTCUTS} from '../ShortcutsPlugin/shortcuts';

import {
    clearFormatting,
    formatCode,
    formatHeading,
    formatParagraph,
    formatLatex,
    formatList,
  } from './utils';
import { useDocumentOptions } from '../Options/DocumentOptionsContext';
import { InsertReferenceButton } from '../NumberingPlugin/InsertReferenceButton.jsx';
import { useDocumentStructureContext } from '../NumberingPlugin/DocumentStructureContext.jsx';
import { insertCitation } from '../../nodes/CitationNode.jsx';
import { addBiblioFromClipboard, bibItemToUIString } from '../../utils/bibliographyUtils.jsx';
import { insertBibliographyNode } from '../../nodes/BibliographyNode.jsx';
import { $isNumberedHeadingNode } from '../../nodes/NumberedHeadingNode.js';
import { INSERT_MATH_COMMAND } from '../MathPlugin/index.jsx';
import { insertTitle } from '../../nodes/TitleNode.jsx';
import { insertAbstract } from '../../nodes/AbstractNode.jsx';
import { $appendAuthor } from '../../nodes/AuthorNodes.jsx';
import { $appendAffiliation } from '../../nodes/AffiliationNodes.jsx';
import { useEditorOptions } from '../EditorOptionsContext.jsx';
import { $createPageBreakNode } from '../../nodes/PageBreakNode.jsx';

const DEFAULT_COLORS = ["blue","red","green","violet","purple","magenta","orange","cyan","teal","olive","brown","white","pink","lime","yellow","lightgray","gray","darkgray","black",]

function dropDownActiveClass(active) {
  if (active) {
    return 'active dropdown-item-active';
  } else {
    return '';
  }
}

function BlockFormatDropDown({
  editor,
  blockType,
  rootType,
  disabled = false,
}){
  const {documentOptions} = useDocumentOptions();
  const {nextLabelNumber,setNextLabelNumber} = useDocumentStructureContext();

  // Shortcuts handling
  useEffect(() => {
    const handleKeyDown = (e) => {
        if (e.ctrlKey && e.altKey) {
            switch (e.code){
              case "KeyN":
                e.preventDefault();
                formatParagraph(editor);
                break;
              case "Digit1":
                e.preventDefault();
                formatHeading(editor, blockType, 'h1',documentOptions,nextLabelNumber,setNextLabelNumber);
                break;
              case "Digit2":
                e.preventDefault();
                formatHeading(editor, blockType, 'h2',documentOptions,nextLabelNumber,setNextLabelNumber);
                break;
              case "Digit3":
                e.preventDefault();
                formatHeading(editor, blockType, 'h3',documentOptions,nextLabelNumber,setNextLabelNumber);
                break;
              case "c":
                e.preventDefault();
                formatCode(editor, blockType);
                break;
            }
            
            //console.log(e.code);
        }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
        document.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor]);


  return (
    <DropDown
      disabled={disabled}
      buttonClassName="toolbar-item block-controls"
      buttonIconClassName={'block-type ' + blockType}
      buttonLabel={blockTypeToBlockName[blockType]}
      buttonAriaLabel="Formatting options for text style">
      <DropDownItem
        className={
          'wide ' + dropDownActiveClass(blockType === 'paragraph')
        }
        onClick={() => formatParagraph(editor)}>
        <div className="icon-text-container">
          <i className="icon paragraph" />
          <span className="text">{blockTypeToBlockName["paragraph"]}</span>
        </div>
        <span className="shortcut">Ctrl+Alt+N</span>
      </DropDownItem>
      <DropDownItem
        className={'wide ' + dropDownActiveClass(blockType === 'h1')}
        onClick={() => formatHeading(editor, blockType, 'h1',documentOptions,nextLabelNumber,setNextLabelNumber)}>
        <div className="icon-text-container">
          <i className="icon h1" />
          <span className="text">{blockTypeToBlockName["h1"]}</span>
        </div>
        <span className="shortcut">Ctrl+Alt+1</span>
      </DropDownItem>
      <DropDownItem
        className={'wide ' + dropDownActiveClass(blockType === 'h2')}
        onClick={() => formatHeading(editor, blockType, 'h2',documentOptions,nextLabelNumber,setNextLabelNumber)}>
        <div className="icon-text-container">
          <i className="icon h2" />
          <span className="text">{blockTypeToBlockName["h2"]}</span>
        </div>
        <span className="shortcut">Ctrl+Alt+2</span>
      </DropDownItem>
      <DropDownItem
        className={'wide ' + dropDownActiveClass(blockType === 'h3')}
        onClick={() => formatHeading(editor, blockType, 'h3',documentOptions,nextLabelNumber,setNextLabelNumber)}>
        <div className="icon-text-container">
          <i className="icon h3" />
          <span className="text">{blockTypeToBlockName["h3"]}</span>
        </div>
        <span className="shortcut">Ctrl+Alt+3</span>
      </DropDownItem>
      <DropDownItem
        className={'wide ' + dropDownActiveClass(blockType === 'bullet')}
        onClick={() => formatList(editor, blockType,"bullet")}>
        <div className="icon-text-container">
          <i className="icon list-bullets" />
          <span className="text">{blockTypeToBlockName["bullet"]}</span>
        </div>
      </DropDownItem>
      <DropDownItem
        className={'wide ' + dropDownActiveClass(blockType === 'number')}
        onClick={() => formatList(editor, blockType,"number")}>
        <div className="icon-text-container">
          <i className="icon list-numbers" />
          <span className="text">{blockTypeToBlockName["number"]}</span>
        </div>
      </DropDownItem>
      <DropDownItem
        className={'wide ' + dropDownActiveClass(blockType === 'code')}
        onClick={() => formatCode(editor, blockType)}>
        <div className="icon-text-container">
          <i className="icon code" />
          <span className="text">{blockTypeToBlockName["code"]}</span>
        </div>
        <span className="shortcut">Ctrl+Alt+C</span>
      </DropDownItem>
      <DropDownItem
        className={'wide ' + dropDownActiveClass(blockType === 'latex')}
        onClick={() => formatLatex(editor, blockType)}>
        <div className="icon-text-container">
          <i className="icon latex" />
          <span className="text">Raw LaTeX</span>
        </div>
      </DropDownItem>
    </DropDown>
  );
}

function CitationDropDown({editor}){
  const {biblio,setBiblio} = useDocumentStructureContext();
  const [modal, showModal] = useModal();

  return (
    <>
    <DropDown buttonClassName="toolbar-item" buttonLabel={"Cite..."} chevron={false} buttonIconClassName={"citation"}>
      <DropDownItemWithIcon onClick={() => addBiblioFromClipboard(editor,biblio,setBiblio,showModal)} iconClassName={"clipboard"} title={"From clipboard..."}/>
      <DropDownItemWithIcon onClick={() => insertBibliographyNode(editor)} iconClassName={"plus"} title={"Insert Bibliography"}/>
      {biblio.map(bibitem => (
        <DropDownItem key={bibitem.key} className={"can-be-wide"} onClick={()=>insertCitation(editor,bibitem.key)}>
          {bibItemToUIString(bibitem)}
        </DropDownItem>
      ))}
      
    </DropDown>
    {modal}
    </>
  )
}

function ColorTextButton({editor}) {
  const [isDropdownOpen,setIsDropdownOpen] = useState();
  const dropdownRef = useRef(null);

  const close = () => setIsDropdownOpen(false);

  return (
    <div ref={dropdownRef}>
    <button onClick={()=>setIsDropdownOpen(!isDropdownOpen)} title='Text color' className="toolbar-item"><i className="icon format textcolor"/></button>
    {isDropdownOpen && 
    (
      <div className="dropdown grid colorgrid">
        {([''].concat(DEFAULT_COLORS)).map((color) => (
          <button key={color} title={color ? color : "Restore default"} style={{"background-color":`var(--xcolor-${color})`}} onClick={()=>{
            editor.update(() => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                $patchStyleText(selection, { color:`var(--xcolor-${color})` });
              }
            });
            close();
          }}>
          </button>
        ))}
      </div>
    )}
    </div>
  );
}

export default function ToolbarPlugin({
  editor,
  activeEditor,
  setActiveEditor,
  setIsLinkEditMode,
}){
  const [modal, showModal] = useModal();
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const {toolbarState, updateToolbarState} = useToolbarState();
  const {editorOptions} = useEditorOptions();

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();

    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }
      // This seems complicated... what for exactly ?

      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      const node = getSelectedNode(selection);
      const parent = node.getParent();

      // Checking if we are in a table
      /*
      const tableNode = $findMatchingParent(node, $isTableNode);
      if ($isTableNode(tableNode)) {
        updateToolbarState('rootType', 'table');
      } else {
        updateToolbarState('rootType', 'root');
      }*/

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(
            anchorNode,
            ListNode,
          );
          const type = parentList
            ? parentList.getListType()
            : element.getListType();

          updateToolbarState('blockType', type);
        } else {
          const type = $isNumberedHeadingNode(element)
            ? element.getTag()
            : element.getType();
          if (type in blockTypeToBlockName) {
            updateToolbarState(
              'blockType',
              type,
            );
          }
        }
      }
      let matchingParent;
      if ($isLinkNode(parent)) {
        // If node is a link, we need to fetch the parent paragraph node to set format
        matchingParent = $findMatchingParent(
          node,
          (parentNode) => $isElementNode(parentNode) && !parentNode.isInline(),
        );
      }

      // If matchingParent is a valid node, pass its format type
      updateToolbarState(
        'elementFormat',
        $isElementNode(matchingParent)
          ? matchingParent.getFormatType()
          : $isElementNode(node)
          ? node.getFormatType()
          : parent?.getFormatType() || 'left',
      );
    }
    if ($isRangeSelection(selection) || $isTableSelection(selection)) {
      // Update text format
      updateToolbarState('isBold', selection.hasFormat('bold'));
      updateToolbarState('isItalic', selection.hasFormat('italic'));
      updateToolbarState('isSubscript', selection.hasFormat('subscript'));
      updateToolbarState('isSuperscript', selection.hasFormat('superscript'));
      updateToolbarState('isCode', selection.hasFormat('code'));
      //updateToolbarState('isLowercase', selection.hasFormat('lowercase'));
      //updateToolbarState('isUppercase', selection.hasFormat('uppercase'));
      //updateToolbarState('isCapitalize', selection.hasFormat('capitalize'));
    }
  }, [activeEditor, editor, updateToolbarState]);

  // Calls to $updateToolbar...

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        setActiveEditor(newEditor);
        $updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor, $updateToolbar, setActiveEditor]);

  useEffect(() => {
    activeEditor.getEditorState().read(() => {
      $updateToolbar();
    });
  }, [activeEditor, $updateToolbar]);

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      activeEditor.registerUpdateListener(({editorState}) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      activeEditor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          updateToolbarState('canUndo', payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      activeEditor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          updateToolbarState('canRedo', payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [$updateToolbar, activeEditor, editor, updateToolbarState]);

  // (Some) shortcut handling
  useEffect(() => {
    const handleKeyDown = (e) => {
        if (e.ctrlKey){
          switch (e.key){
            case "F":
              e.preventDefault();
              showModal('Insert Figure', (onClose) => (
                <InsertImageDialog
                  activeEditor={activeEditor}
                  onClose={onClose}
                  figureMode={true}
                  replaceMode={false}
                />
              ));
              break;
            case "d":
              e.preventDefault();
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript');
              break;
            case "u":
              e.preventDefault();
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript');
              break;
          }
        }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
        document.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor, activeEditor]);

  return (
    <div className="toolbar hide-on-fullscreen">
    <div className="toolbar-itemgroup">
      <button
      disabled={!toolbarState.canUndo || !isEditable}
      onClick={() => {
        activeEditor.dispatchCommand(UNDO_COMMAND, undefined);
      }}
      title={IS_APPLE ? 'Undo (⌘Z)' : 'Undo (Ctrl+Z)'}
      type="button"
      className="toolbar-item"
      aria-label="Undo">
      <i className="format undo" />
    </button>
    <button
      disabled={!toolbarState.canRedo || !isEditable}
      onClick={() => {
        activeEditor.dispatchCommand(REDO_COMMAND, undefined);
      }}
      title={IS_APPLE ? 'Redo (⇧⌘Z)' : 'Redo (Ctrl+Y)'}
      type="button"
      className="toolbar-item"
      aria-label="Redo">
      <i className="format redo" />
    </button>
    </div>

    {toolbarState.blockType in blockTypeToBlockName &&
      activeEditor === editor && (
        <div className="toolbar-itemgroup">
          <BlockFormatDropDown
            disabled={!isEditable}
            blockType={toolbarState.blockType}
            rootType={toolbarState.rootType}
            editor={activeEditor}
          />
        </div>
      )}

    {!(["code","latex"].includes(toolbarState.blockType)) && ( // Not a code block or raw latex
    <>
      <div className='toolbar-itemgroup'>
        <button
          disabled={!isEditable}
          onClick={() => {
            activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
          }}
          className={
            'toolbar-item ' + (toolbarState.isBold ? 'active' : '')
          }
          title={`Bold (${SHORTCUTS.BOLD})`}
          type="button"
          aria-label={`Format text as bold. Shortcut: ${SHORTCUTS.BOLD}`}>
          <i className="format bold" />
        </button>
        <button
          disabled={!isEditable}
          onClick={() => {
            activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
          }}
          className={
            'toolbar-item ' + (toolbarState.isItalic ? 'active' : '')
          }
          title={`Italic (${SHORTCUTS.ITALIC})`}
          type="button"
          aria-label={`Format text as italics. Shortcut: ${SHORTCUTS.ITALIC}`}>
          <i className="format italic" />
        </button>
        <button
          onClick={() => {
            activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript');
          }}
          className={
            'toolbar-item ' + (toolbarState.isSubscript ? 'active' : '')
          }
          title="Subscript (Ctrl+D)"
          aria-label="Format text with a subscript">
          <i className="format subscript" />
        </button>
        <button
          onClick={() => {
            activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript');
          }}
          className={
            'toolbar-item ' + (toolbarState.isSuperscript ? 'active' : '')
          }
          title="Superscript (Ctrl+U)"
          aria-label="Format text with a superscript">
          <i className="format superscript" />
        </button>
        <button
          disabled={!isEditable}
          onClick={() => {
            activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
          }}
          className={
            'toolbar-item ' + (toolbarState.isCode ? 'active' : '')
          }
          title={`Code style`}
          type="button"
          aria-label="Format text in code style">
          <i className="format code" />
        </button>
        <ColorTextButton editor={activeEditor}/>
      </div>

        <div className="toolbar-itemgroup">
          <InsertReferenceButton/>
        </div>
        
        <div className="toolbar-itemgroup">
          <CitationDropDown editor={activeEditor}/>
        </div>

        <div className="toolbar-itemgroup">
          <DropDown
            disabled={!isEditable}
            buttonClassName="toolbar-item"
            buttonLabel="Insert"
            buttonAriaLabel="Insert specialized editor node"
            buttonIconClassName="plus"
            chevron={false}>
              
            <DropDownItem onClick={() => activeEditor.dispatchCommand(INSERT_MATH_COMMAND,true)}>
              <i className="icon equation" />
              <span className="text">Inline math</span>
              <span className="shortcut">{SHORTCUTS.MATH_INLINE}</span>
            </DropDownItem>
            <DropDownItem onClick={() => activeEditor.dispatchCommand(INSERT_MATH_COMMAND,false)}>
              <i className="icon equation" />
              <span className="text">Display math</span>
              <span className="shortcut">{SHORTCUTS.MATH_DISPLAY}</span>
            </DropDownItem>
            <DropDownItem
              onClick={() => {
                showModal('Insert Image', (onClose) => (
                  <InsertImageDialog
                    activeEditor={activeEditor}
                    onClose={onClose}
                    figureMode={false}
                    replaceMode={false}
                  />
                ));
              }}>
              <i className="icon image" />
              <span className="text">Image</span>
            </DropDownItem>
            <DropDownItem
              onClick={() => {
                showModal('Insert Figure', (onClose) => (
                  <InsertImageDialog
                    activeEditor={activeEditor}
                    onClose={onClose}
                    figureMode={true}
                    replaceMode={false}
                  />
                ));
              }}
              className="item">
              <i className="icon figure" />
              <span className="text">Figure</span>
              <span className="shortcut">Ctrl+Shift+F</span>
            </DropDownItem>
          </DropDown>
        </div>

        <div className="toolbar-itemgroup">
          <DropDown
            disabled={!isEditable}
            buttonClassName="toolbar-item"
            buttonLabel="Title page"
            buttonAriaLabel="Title page"
            buttonIconClassName="fonts"
            chevron={false}>

            <DropDownItemWithIcon title={"Main title"} onClick={() => insertTitle(activeEditor)} iconClassName={"fonts"}/>
            <DropDownItemWithIcon title={"Add author"} onClick={() => activeEditor.update($appendAuthor)} iconClassName={"person-plus"}/>
            <DropDownItemWithIcon title={"Add affiliation"} onClick={() => activeEditor.update($appendAffiliation)} iconClassName={"institution"}/>
            <DropDownItemWithIcon title={"Abstract"} onClick={() => insertAbstract(activeEditor)} iconClassName={"paragraph"}/>
          </DropDown>
        </div>

        <div className="toolbar-itemgroup">
          <DropDown
            disabled={!(isEditable)}
            buttonClassName="toolbar-item"
            buttonLabel="Layout element"
            buttonAriaLabel="Layout element"
            buttonIconClassName="plus"
            chevron={false}>

            <DropDownItemWithIcon title={"Page break"} onClick={() => activeEditor.update(() => $insertNodes([$createPageBreakNode()]))} iconClassName={"page-break"} disabled={!(editorOptions.emulateLayout)}/>
          </DropDown>
        </div>
      </>
    )}

    {modal}
  </div>
  );
}