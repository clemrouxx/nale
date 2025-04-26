/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */


//import './ImageNode.css';

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {useLexicalEditable} from '@lexical/react/useLexicalEditable';
import {useLexicalNodeSelection} from '@lexical/react/useLexicalNodeSelection';
import {mergeRegister} from '@lexical/utils';
import {
$getNodeByKey,
$getSelection,
$isNodeSelection,
$isRangeSelection,
CLICK_COMMAND,
COMMAND_PRIORITY_LOW,
createCommand,
KEY_ENTER_COMMAND,
KEY_ESCAPE_COMMAND,
} from 'lexical';
import * as React from 'react';
import {Suspense, useCallback, useEffect, useRef, useState} from 'react';

//import ImageResizer from '../ui/ImageResizer';
import {$isImageNode} from './ImageNode';

const imageCache = new Map();

export const RIGHT_CLICK_IMAGE_COMMAND = createCommand('RIGHT_CLICK_IMAGE_COMMAND');

function useSuspenseImage(src) {
    let cached = imageCache.get(src);
    if (typeof cached === 'boolean') {
        return cached;
    } else if (!cached) {
        cached = new Promise((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve(false);
            img.onerror = () => resolve(true);
        }).then((hasError) => {
            imageCache.set(src, hasError);
            return hasError;
        });
        imageCache.set(src, cached);
        throw cached;
    }
    throw cached;
}

function LazyImage({className,imageRef,src,width,height,maxWidth,onError}) {

    const hasError = useSuspenseImage(src);

    useEffect(() => {
        if (hasError) {
            onError();
        }
    }, [hasError, onError]);

    if (hasError) {
        return <BrokenImage />;
    }

    const imageStyle = {height,maxWidth,width};

    return (
        <img
        className={className || undefined}
        src={src}
        alt={"Test image"}
        ref={imageRef}
        style={imageStyle}
        onError={onError}
        draggable="false"
        onLoad={(e) => {}}
        />
    );
}

function BrokenImage() {
    return (
       <span>BROKEN IMAGE</span>
    );
}

export default function ImageComponent({src,altText,nodeKey,width,height,maxWidth,resizable}) {
    const imageRef = useRef(null);
    const [isSelected, setSelected, clearSelection] =
        useLexicalNodeSelection(nodeKey);
    const [isResizing, setIsResizing] = useState(false);
    const [editor] = useLexicalComposerContext();
    const [selection, setSelection] = useState(null);
    const [isLoadError, setIsLoadError] = useState(false);
    const isEditable = useLexicalEditable();

    const onClick = useCallback(
        (payload) => {
            const event = payload;

            if (isResizing) {
                return true;
            }
            if (event.target === imageRef.current) {
                if (event.shiftKey) {
                    setSelected(!isSelected);
                } else {
                    clearSelection();
                    setSelected(true);
                }
                return true;
            }

            return false;
        },
        [isResizing, isSelected, setSelected, clearSelection],
    );

    const onRightClick = useCallback(
        (event) => {
        editor.getEditorState().read(() => {
            const latestSelection = $getSelection();
            const domElement = event.target;
            if (
            domElement.tagName === 'IMG' &&
            $isRangeSelection(latestSelection) &&
            latestSelection.getNodes().length === 1
            ) {
            editor.dispatchCommand(
                RIGHT_CLICK_IMAGE_COMMAND,
                event,
            );
            }
        });
        },
        [editor],
    );

    useEffect(() => {
        const rootElement = editor.getRootElement();
        const unregister = mergeRegister(
            editor.registerUpdateListener(({editorState}) => {
                const updatedSelection = editorState.read(() => $getSelection());
                if ($isNodeSelection(updatedSelection)) {
                    setSelection(updatedSelection);
                } else {
                    setSelection(null);
                }
            }),
            editor.registerCommand(CLICK_COMMAND,onClick,COMMAND_PRIORITY_LOW),
            //editor.registerCommand(RIGHT_CLICK_IMAGE_COMMAND,onClick,COMMAND_PRIORITY_LOW),
        );

        rootElement?.addEventListener('contextmenu', onRightClick);

        return () => {
            unregister();
            rootElement?.removeEventListener('contextmenu', onRightClick);
        };
    }, [
        clearSelection,
        editor,
        isResizing,
        isSelected,
        nodeKey,
        onClick,
        onRightClick,
        setSelected,
    ]);

    /*const onResizeEnd = (
        nextWidth,
        nextHeight,
    ) => {
        // Delay hiding the resize bars for click case
        setTimeout(() => {
        setIsResizing(false);
        }, 200);

        editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isImageNode(node)) {
            node.setWidthAndHeight(nextWidth, nextHeight);
        }
        });
    };

    const onResizeStart = () => {
        setIsResizing(true);
    };*/

    const draggable = isSelected && $isNodeSelection(selection) && !isResizing;
    const isFocused = (isSelected || isResizing) && isEditable;
    return (
        <Suspense fallback={null}>
        <>
            <span draggable={draggable}>
            {isLoadError ? (
                <BrokenImage />
            ) : (
                <LazyImage
                className={
                    isFocused
                    ? `focused ${$isNodeSelection(selection) ? 'draggable' : ''}`
                    : null
                }
                src={src}
                altText={altText}
                imageRef={imageRef}
                width={width}
                height={height}
                maxWidth={maxWidth}
                onError={() => setIsLoadError(true)}
                />
            )}
            </span>
            
            {/*resizable && $isNodeSelection(selection) && isFocused && (
            <ImageResizer
                editor={editor}
                buttonRef={buttonRef}
                imageRef={imageRef}
                maxWidth={maxWidth}
                onResizeStart={onResizeStart}
                onResizeEnd={onResizeEnd}
            />
            )*/}
        </>
        </Suspense>
    );
}