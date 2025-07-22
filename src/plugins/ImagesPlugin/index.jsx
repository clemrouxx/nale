/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$wrapNodeInElement, mergeRegister} from '@lexical/utils';
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW,
  createCommand,
  DELETE_CHARACTER_COMMAND,
} from 'lexical';
import {useEffect, useRef, useState} from 'react';

import yellowFlowerImage from '../../images/sample.jpg';
import { $createSimpleImageNode, SimpleImageNode } from '../../nodes/ImageNodes';
import TextInput from '../../ui/TextInput';
import { $createFigureNode } from '../../nodes/FigureNode';
import { $onDeleteCharacterInCaption } from '../../nodes/CaptionNode';
import { useDocumentStructureContext } from '../NumberingPlugin/DocumentStructureContext';

export const INSERT_IMAGE_COMMAND = createCommand('INSERT_IMAGE_COMMAND');
export const INSERT_FIGURE_COMMAND = createCommand('INSERT_FIGURE_COMMAND');

export function InsertImageUriDialogBody({onClick}) {
  const [src, setSrc] = useState('');

  const isDisabled = src === '';

  return (
    <>
      <TextInput
        label="Image URL"
        placeholder="i.e. https://source.unsplash.com/random"
        onChange={setSrc}
        value={src}
        data-test-id="image-modal-url-input"
      />
      <div>
        <button
          data-test-id="image-modal-confirm-btn"
          disabled={isDisabled}
          onClick={() => onClick({src, filename:src.split("/").at(-1)})}>
          Confirm
        </button>
      </div>
    </>
  );
}

export function InsertImageDialog({
  activeEditor,
  onClose,
  figureMode
}) {
  const [mode, setMode] = useState(null);
  const hasModifier = useRef(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    hasModifier.current = false;
    const handler = (e) => {
      hasModifier.current = e.altKey;
    };
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, [activeEditor]);

  const onClick = (payload) => {
    if (figureMode) activeEditor.dispatchCommand(INSERT_FIGURE_COMMAND, payload);
    else activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
    onClose();
  };

  const loadFromFile = (e) => {
    const files = e.target.files;
    const reader = new FileReader();
    reader.onload = function () {
      if (typeof reader.result === 'string') {
        onClick({src:reader.result,filename:files[0].name})
      }
      return '';
    };
    if (files !== null) {
      reader.readAsDataURL(files[0]);
    }
  };

  return (
    <>
      {!mode && (
        <div className="dialog-buttons-list">
          <button
            data-test-id="image-modal-option-sample"
            onClick={() =>
              onClick({src: yellowFlowerImage,filename:"sample.jpg"})
            }>
            Sample
          </button>
          <button
            data-test-id="image-modal-option-url"
            onClick={() => setMode('url')}>
            URL
          </button>
          <button
            data-test-id="image-modal-option-file"
            onClick={() => fileInputRef.current.click()}>
            File
          </button>
          <input
            type='file'
            onChange={loadFromFile}
            accept="application/pdf,image/jpeg,image/png"
            data-test-id="age-modal-file-upload"
            className="hidden"
            ref={fileInputRef}
          />
        </div>
      )}
      {mode === 'url' && <InsertImageUriDialogBody onClick={onClick} />}
    </>
  );
}

export default function ImagesPlugin() {
  const [editor] = useLexicalComposerContext();
  const {nextLabelNumber,setNextLabelNumber} = useDocumentStructureContext();

  useEffect(() => {
    if (!editor.hasNodes([SimpleImageNode])) {
      throw new Error('ImagesPlugin: SimpleImageNode not registered on editor');
    }

    return mergeRegister(
      editor.registerCommand(
        INSERT_IMAGE_COMMAND,
        (payload) => {
          const imageNode = $createSimpleImageNode(payload);
          $insertNodes([imageNode]);
          if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
            $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
          }
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),

      editor.registerCommand(
        INSERT_FIGURE_COMMAND,
        (payload) => {
          //console.log(payload);
          const figureNode = $createFigureNode(payload,nextLabelNumber);
          setNextLabelNumber(nextLabelNumber+1);
          $insertNodes([figureNode]);
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),

      editor.registerCommand(
        DELETE_CHARACTER_COMMAND,
        $onDeleteCharacterInCaption,
        COMMAND_PRIORITY_LOW,
      )
    )
  }, [editor]);

  return null;
}