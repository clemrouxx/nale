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
  CODE_LANGUAGE_FRIENDLY_NAME_MAP,
  CODE_LANGUAGE_MAP,
  getLanguageFriendlyName,
} from '@lexical/code';
import {$isLinkNode, TOGGLE_LINK_COMMAND} from '@lexical/link';
import {$isListNode, ListNode} from '@lexical/list';
import {INSERT_EMBED_COMMAND} from '@lexical/react/LexicalAutoEmbedPlugin';
import {INSERT_HORIZONTAL_RULE_COMMAND} from '@lexical/react/LexicalHorizontalRuleNode';
import {
  $getSelectionStyleValueForProperty,
  $isParentElementRTL,
  $patchStyleText,
} from '@lexical/selection';
import {$isTableNode, $isTableSelection} from '@lexical/table';
import {
  $findMatchingParent,
  $getNearestNodeOfType,
  $isEditorIsNestedEditor,
  IS_APPLE,
  mergeRegister,
} from '@lexical/utils';
import {
  $getNodeByKey,
  $getRoot,
  $getSelection,
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
import {act, Dispatch, useCallback, useEffect, useState} from 'react';

import {
  blockTypeToBlockName,
  useToolbarState,
} from './ToolbarContext';
import DropDown, {DropDownItem, DropDownItemWithIcon} from '../../ui/DropDown';
import useModal from '../../hooks/useModal';
import {getSelectedNode} from '../../utils/getSelectedNode';

/*
import catTypingGif from '../../images/cat-typing.gif';
import {$createStickyNode} from '../../nodes/StickyNode';
import DropdownColorPicker from '../../ui/DropdownColorPicker';
import {sanitizeUrl} from '../../utils/url';
import {EmbedConfigs} from '../AutoEmbedPlugin';
import {INSERT_COLLAPSIBLE_COMMAND} from '../CollapsiblePlugin';
import {InsertEquationDialog} from '../EquationsPlugin';
import {INSERT_EXCALIDRAW_COMMAND} from '../ExcalidrawPlugin';

import {INSERT_PAGE_BREAK} from '../PageBreakPlugin';
import {InsertPollDialog} from '../PollPlugin';
import {SHORTCUTS} from '../ShortcutsPlugin/shortcuts';
import {InsertTableDialog} from '../TablePlugin';
import FontSize from './fontSize';*/

import {
  InsertImageDialog,
} from '../ImagesPlugin';
//import {InsertInlineImageDialog} from '../InlineImagePlugin';
//import InsertLayoutDialog from '../LayoutPlugin/InsertLayoutDialog';

import {SHORTCUTS} from '../ShortcutsPlugin/shortcuts';

import {
    clearFormatting,
    formatCode,
    formatHeading,
    formatParagraph,
    formatQuote,
    formatLatex,
    formatList,
  } from './utils';
import { useDocumentOptions } from '../Options/DocumentOptionsContext';
import { ReferenceNode,insertReferenceNode } from '../../nodes/ReferenceNode';
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

/*
const rootTypeToRootName = {
  root: 'Root',
  table: 'Table',
};

function getCodeLanguageOptions(){
  const options = [];

  for (const [lang, friendlyName] of Object.entries(
    CODE_LANGUAGE_FRIENDLY_NAME_MAP,
  )) {
    options.push([lang, friendlyName]);
  }

  return options;
}
  */

/*

const CODE_LANGUAGE_OPTIONS = getCodeLanguageOptions();

const FONT_FAMILY_OPTIONS = [
  ['Arial', 'Arial'],
  ['Courier New', 'Courier New'],
  ['Georgia', 'Georgia'],
  ['Times New Roman', 'Times New Roman'],
  ['Trebuchet MS', 'Trebuchet MS'],
  ['Verdana', 'Verdana'],
];

const FONT_SIZE_OPTIONS = [
  ['10px', '10px'],
  ['11px', '11px'],
  ['12px', '12px'],
  ['13px', '13px'],
  ['14px', '14px'],
  ['15px', '15px'],
  ['16px', '16px'],
  ['17px', '17px'],
  ['18px', '18px'],
  ['19px', '19px'],
  ['20px', '20px'],
];

const ELEMENT_FORMAT_OPTIONS = {
  center: {
    icon: 'center-align',
    iconRTL: 'center-align',
    name: 'Center Align',
  },
  end: {
    icon: 'right-align',
    iconRTL: 'left-align',
    name: 'End Align',
  },
  justify: {
    icon: 'justify-align',
    iconRTL: 'justify-align',
    name: 'Justify Align',
  },
  left: {
    icon: 'left-align',
    iconRTL: 'left-align',
    name: 'Left Align',
  },
  right: {
    icon: 'right-align',
    iconRTL: 'right-align',
    name: 'Right Align',
  },
  start: {
    icon: 'left-align',
    iconRTL: 'right-align',
    name: 'Start Align',
  },
};
*/

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
        <span className="shortcut">{SHORTCUTS.NORMAL}</span>
      </DropDownItem>
      <DropDownItem
        className={'wide ' + dropDownActiveClass(blockType === 'h1')}
        onClick={() => formatHeading(editor, blockType, 'h1',documentOptions,nextLabelNumber,setNextLabelNumber)}>
        <div className="icon-text-container">
          <i className="icon h1" />
          <span className="text">{blockTypeToBlockName["h1"]}</span>
        </div>
        <span className="shortcut">{SHORTCUTS.HEADING1}</span>
      </DropDownItem>
      <DropDownItem
        className={'wide ' + dropDownActiveClass(blockType === 'h2')}
        onClick={() => formatHeading(editor, blockType, 'h2',documentOptions,nextLabelNumber,setNextLabelNumber)}>
        <div className="icon-text-container">
          <i className="icon h2" />
          <span className="text">{blockTypeToBlockName["h2"]}</span>
        </div>
        <span className="shortcut">{SHORTCUTS.HEADING2}</span>
      </DropDownItem>
      <DropDownItem
        className={'wide ' + dropDownActiveClass(blockType === 'h3')}
        onClick={() => formatHeading(editor, blockType, 'h3',documentOptions,nextLabelNumber,setNextLabelNumber)}>
        <div className="icon-text-container">
          <i className="icon h3" />
          <span className="text">{blockTypeToBlockName["h3"]}</span>
        </div>
        <span className="shortcut">{SHORTCUTS.HEADING3}</span>
      </DropDownItem>
      <DropDownItem
        className={'wide ' + dropDownActiveClass(blockType === 'bullet')}
        onClick={() => formatList(editor, blockType,"bullet")}>
        <div className="icon-text-container">
          <i className="icon list-bullets" />
          <span className="text">{blockTypeToBlockName["bullet"]}</span>
        </div>
        <span className="shortcut">{SHORTCUTS.BULLET_LIST}</span>
      </DropDownItem>
      <DropDownItem
        className={'wide ' + dropDownActiveClass(blockType === 'number')}
        onClick={() => formatList(editor, blockType,"number")}>
        <div className="icon-text-container">
          <i className="icon list-numbers" />
          <span className="text">{blockTypeToBlockName["number"]}</span>
        </div>
        <span className="shortcut">{SHORTCUTS.NUMBERED_LIST}</span>
      </DropDownItem>
      <DropDownItem
        className={'wide ' + dropDownActiveClass(blockType === 'code')}
        onClick={() => formatCode(editor, blockType)}>
        <div className="icon-text-container">
          <i className="icon code" />
          <span className="text">{blockTypeToBlockName["code"]}</span>
        </div>
        <span className="shortcut">{SHORTCUTS.CODE_BLOCK}</span>
      </DropDownItem>
      <DropDownItem
        className={'wide ' + dropDownActiveClass(blockType === 'latex')}
        onClick={() => formatLatex(editor, blockType)}>
        <div className="icon-text-container">
          <i className="icon latex" />
          <span className="text">{blockTypeToBlockName["latex"]}</span>
        </div>
      </DropDownItem>
    </DropDown>
  );
}

function CitationDropDown({editor}){
  const {biblio,setBiblio} = useDocumentStructureContext();

  return (
    <DropDown buttonClassName="toolbar-item" buttonLabel={"Cite..."} chevron={false} buttonIconClassName={"citation"}>
      <DropDownItemWithIcon onClick={() => addBiblioFromClipboard(editor,biblio,setBiblio)} iconClassName={"clipboard"} title={"From clipboard..."}/>
      <DropDownItemWithIcon onClick={() => insertBibliographyNode(editor)} iconClassName={"plus"} title={"Insert Bibliography"}/>
      {biblio.map(bibitem => (
        <DropDownItem key={bibitem.key} className={"can-be-wide"} onClick={()=>insertCitation(editor,bibitem.key)}>
          {bibItemToUIString(bibitem)}
        </DropDownItem>
      ))}
    </DropDown>
  )
}

function Divider(){
  return <div className="divider" />;
}

/*
function FontDropDown({
  editor,
  value,
  style,
  disabled = false,
}){
  const handleClick = useCallback(
    (option) => {
      editor.update(() => {
        const selection = $getSelection();
        if (selection !== null) {
          $patchStyleText(selection, {
            [style]: option,
          });
        }
      });
    },
    [editor, style],
  );

  const buttonAriaLabel =
    style === 'font-family'
      ? 'Formatting options for font family'
      : 'Formatting options for font size';

  return (
    <DropDown
      disabled={disabled}
      buttonClassName={'toolbar-item ' + style}
      buttonLabel={value}
      buttonIconClassName={
        style === 'font-family' ? 'icon block-type font-family' : ''
      }
      buttonAriaLabel={buttonAriaLabel}>
      {(style === 'font-family' ? FONT_FAMILY_OPTIONS : FONT_SIZE_OPTIONS).map(
        ([option, text]) => (
          <DropDownItem
            className={`item ${dropDownActiveClass(value === option)} ${
              style === 'font-size' ? 'fontsize-item' : ''
            }`}
            onClick={() => handleClick(option)}
            key={option}>
            <span className="text">{text}</span>
          </DropDownItem>
        ),
      )}
    </DropDown>
  );
}

function ElementFormatDropdown({
  editor,
  value,
  isRTL,
  disabled = false,
}) {
  const formatOption = ELEMENT_FORMAT_OPTIONS[value || 'left'];

  return (
    <DropDown
      disabled={disabled}
      buttonLabel={formatOption.name}
      buttonIconClassName={`icon ${
        isRTL ? formatOption.iconRTL : formatOption.icon
      }`}
      buttonClassName="toolbar-item spaced alignment"
      buttonAriaLabel="Formatting options for text alignment">
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
        }}
        className="item wide">
        <div className="icon-text-container">
          <i className="icon left-align" />
          <span className="text">Left Align</span>
        </div>
        <span className="shortcut">{SHORTCUTS.LEFT_ALIGN}</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
        }}
        className="item wide">
        <div className="icon-text-container">
          <i className="icon center-align" />
          <span className="text">Center Align</span>
        </div>
        <span className="shortcut">{SHORTCUTS.CENTER_ALIGN}</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
        }}
        className="item wide">
        <div className="icon-text-container">
          <i className="icon right-align" />
          <span className="text">Right Align</span>
        </div>
        <span className="shortcut">{SHORTCUTS.RIGHT_ALIGN}</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
        }}
        className="item wide">
        <div className="icon-text-container">
          <i className="icon justify-align" />
          <span className="text">Justify Align</span>
        </div>
        <span className="shortcut">{SHORTCUTS.JUSTIFY_ALIGN}</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'start');
        }}
        className="item wide">
        <i
          className={`icon ${
            isRTL
              ? ELEMENT_FORMAT_OPTIONS.start.iconRTL
              : ELEMENT_FORMAT_OPTIONS.start.icon
          }`}
        />
        <span className="text">Start Align</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'end');
        }}
        className="item wide">
        <i
          className={`icon ${
            isRTL
              ? ELEMENT_FORMAT_OPTIONS.end.iconRTL
              : ELEMENT_FORMAT_OPTIONS.end.icon
          }`}
        />
        <span className="text">End Align</span>
      </DropDownItem>
      <Divider />
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
        }}
        className="item wide">
        <div className="icon-text-container">
          <i className={'icon ' + (isRTL ? 'indent' : 'outdent')} />
          <span className="text">Outdent</span>
        </div>
        <span className="shortcut">{SHORTCUTS.OUTDENT}</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
        }}
        className="item wide">
        <div className="icon-text-container">
          <i className={'icon ' + (isRTL ? 'outdent' : 'indent')} />
          <span className="text">Indent</span>
        </div>
        <span className="shortcut">{SHORTCUTS.INDENT}</span>
      </DropDownItem>
    </DropDown>
  );
}*/

export default function ToolbarPlugin({
  editor,
  activeEditor,
  setActiveEditor,
  setIsLinkEditMode,
}){
  const [selectedElementKey, setSelectedElementKey] = useState(null);
  const [modal, showModal] = useModal();
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const {toolbarState, updateToolbarState} = useToolbarState();

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

      //updateToolbarState('isRTL', $isParentElementRTL(selection));
      
      /*const isLink = $isLinkNode(parent) || $isLinkNode(node);
      updateToolbarState('isLink', isLink);*/

      // Checking if we are in a table
      /*
      const tableNode = $findMatchingParent(node, $isTableNode);
      if ($isTableNode(tableNode)) {
        updateToolbarState('rootType', 'table');
      } else {
        updateToolbarState('rootType', 'root');
      }*/

      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
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
          if ($isCodeNode(element)) {
            const language =
              element.getLanguage();
            updateToolbarState(
              'codeLanguage',
              language ? CODE_LANGUAGE_MAP[language] || language : '',
            );
            return;
          }
        }
      }

      // Handle buttons
      /*
      updateToolbarState(
        'fontColor',
        $getSelectionStyleValueForProperty(selection, 'color', '#000'),
      );
      updateToolbarState(
        'bgColor',
        $getSelectionStyleValueForProperty(
          selection,
          'background-color',
          '#fff',
        ),
      );
      updateToolbarState(
        'fontFamily',
        $getSelectionStyleValueForProperty(selection, 'font-family', 'Arial'),
      );*/
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
      //updateToolbarState('isUnderline', selection.hasFormat('underline'));
      //updateToolbarState('isStrikethrough',selection.hasFormat('strikethrough'));
      updateToolbarState('isSubscript', selection.hasFormat('subscript'));
      updateToolbarState('isSuperscript', selection.hasFormat('superscript'));
      //updateToolbarState('isHighlight', selection.hasFormat('highlight'));
      updateToolbarState('isCode', selection.hasFormat('code'));
      //updateToolbarState('fontSize',$getSelectionStyleValueForProperty(selection, 'font-size', '15px'));
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

/*
  const applyStyleText = useCallback(
    (styles, skipHistoryStack) => {
      activeEditor.update(
        () => {
          const selection = $getSelection();
          if (selection !== null) {
            $patchStyleText(selection, styles);
          }
        },
        skipHistoryStack ? {tag: 'historic'} : {},
      );
    },
    [activeEditor],
  );

  const onFontColorSelect = useCallback(
    (value, skipHistoryStack) => {
      applyStyleText({color: value}, skipHistoryStack);
    },
    [applyStyleText],
  );

  const onBgColorSelect = useCallback(
    (value, skipHistoryStack) => {
      applyStyleText({'background-color': value}, skipHistoryStack);
    },
    [applyStyleText],
  );

  const insertLink = useCallback(() => {
    if (!toolbarState.isLink) {
      setIsLinkEditMode(true);
      activeEditor.dispatchCommand(
        TOGGLE_LINK_COMMAND,
        sanitizeUrl('https://'),
      );
    } else {
      setIsLinkEditMode(false);
      activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [activeEditor, setIsLinkEditMode, toolbarState.isLink]);

  const onCodeLanguageSelect = useCallback(
    (value) => {
      activeEditor.update(() => {
        if (selectedElementKey !== null) {
          const node = $getNodeByKey(selectedElementKey);
          if ($isCodeNode(node)) {
            node.setLanguage(value);
          }
        }
      });
    },
    [activeEditor, selectedElementKey],
  );
  const insertGifOnClick = (payload) => {
    activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
  };

  const canViewerSeeInsertDropdown = !toolbarState.isImageCaption;
  const canViewerSeeInsertCodeButton = !toolbarState.isImageCaption;*/

  return (
    <div className="toolbar">
    <div className="toolbar-itemgroup">
      <button
      disabled={!toolbarState.canUndo || !isEditable}
      onClick={() => {
        activeEditor.dispatchCommand(UNDO_COMMAND, undefined);
      }}
      title={IS_APPLE ? 'Undo (⌘Z)' : 'Undo (Ctrl+Z)'}
      type="button"
      className="toolbar-item spaced"
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

    {toolbarState.blockType === 'code' && (/*
      <DropDown
        disabled={!isEditable}
        buttonClassName="toolbar-item code-language"
        buttonLabel={getLanguageFriendlyName(toolbarState.codeLanguage)}
        buttonAriaLabel="Select language">
        {CODE_LANGUAGE_OPTIONS.map(([value, name]) => {
          return (
            <DropDownItem
              className={`item ${dropDownActiveClass(
                value === toolbarState.codeLanguage,
              )}`}
              onClick={() => onCodeLanguageSelect(value)}
              key={value}>
              <span className="text">{name}</span>
            </DropDownItem>
          );
        })}
      </DropDown>*/
      <></>
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
            'toolbar-item spaced ' + (toolbarState.isBold ? 'active' : '')
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
            'toolbar-item spaced ' + (toolbarState.isItalic ? 'active' : '')
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
            'toolbar-item spaced ' + (toolbarState.isSubscript ? 'active' : '')
          }
          title="Subscript"
          aria-label="Format text with a subscript">
          <i className="format subscript" />
          <span className="shortcut"></span>
        </button>
        <button
          onClick={() => {
            activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript');
          }}
          className={
            'toolbar-item spaced ' + (toolbarState.isSuperscript ? 'active' : '')
          }
          title="Superscript"
          aria-label="Format text with a superscript">
          <i className="format superscript" />
          <span className="shortcut"></span>
        </button>
        <button
          disabled={!isEditable}
          onClick={() => {
            activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
          }}
          className={
            'toolbar-item spaced ' + (toolbarState.isCode ? 'active' : '')
          }
          title={`Code style (${SHORTCUTS.INSERT_CODE_BLOCK})`}
          type="button"
          aria-label="Format text in code style">
          <i className="format code" />
        </button>
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
            buttonClassName="toolbar-item spaced"
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
                  />
                ));
              }}
              className="item">
              <i className="icon figure" />
              <span className="text">Figure</span>
            </DropDownItem>
          </DropDown>
        </div>

        <div className="toolbar-itemgroup">
          <DropDown
            disabled={!isEditable}
            buttonClassName="toolbar-item spaced"
            buttonLabel="Title page..."
            buttonAriaLabel="Title page"
            buttonIconClassName="plus"
            chevron={false}>

            <DropDownItemWithIcon title={"Main title"} onClick={() => insertTitle(activeEditor)} iconClassName={"fonts"}/>
            <DropDownItemWithIcon title={"Add author"} onClick={() => activeEditor.update($appendAuthor)} iconClassName={"person-plus"}/>
            <DropDownItemWithIcon title={"Abstract"} onClick={() => insertAbstract(activeEditor)} iconClassName={"paragraph"}/>
          </DropDown>
        </div>
      </>
    )}

    {modal}
  </div>
  );
}