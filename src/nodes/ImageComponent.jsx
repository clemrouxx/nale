/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */


//import './ImageNode.css';

import {useCollaborationContext} from '@lexical/react/LexicalCollaborationContext';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {useLexicalEditable} from '@lexical/react/useLexicalEditable';
import {useLexicalNodeSelection} from '@lexical/react/useLexicalNodeSelection';
import {mergeRegister} from '@lexical/utils';
import {
$getNodeByKey,
$getSelection,
$isNodeSelection,
$isRangeSelection,
$setSelection,
CLICK_COMMAND,
COMMAND_PRIORITY_LOW,
createCommand,
DRAGSTART_COMMAND,
KEY_ENTER_COMMAND,
KEY_ESCAPE_COMMAND,
SELECTION_CHANGE_COMMAND,
} from 'lexical';
import * as React from 'react';
import {Suspense, useCallback, useEffect, useRef, useState} from 'react';

//import {createWebsocketProvider} from '../collaboration';
//import {useSharedHistoryContext} from '../context/SharedHistoryContext';
//import brokenImage from '../images/image-broken.svg';
//import ContentEditable from '../ui/ContentEditable';
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

function isSVG(src) {
    return src.toLowerCase().endsWith('.svg'); 
}

function LazyImage({
    altText,
    className,
    imageRef,
    src,
    width,
    height,
    maxWidth,
    onError,
}) {
    const [dimensions, setDimensions] = useState(null);
    const isSVGImage = isSVG(src);

    // Set initial dimensions for SVG images
    useEffect(() => {
        if (imageRef.current && isSVGImage) {
        const {naturalWidth, naturalHeight} = imageRef.current;
        setDimensions({
            height: naturalHeight,
            width: naturalWidth,
        });
        }
    }, [imageRef, isSVGImage]);

    const hasError = useSuspenseImage(src);

    useEffect(() => {
        if (hasError) {
        onError();
        }
    }, [hasError, onError]);

    if (hasError) {
        return <BrokenImage />;
    }

    // Calculate final dimensions with proper scaling
    const calculateDimensions = () => {
        return {
                height,
                maxWidth,
                width,
            };
    };

    const imageStyle = calculateDimensions();

    return (
        <img
        className={className || undefined}
        src={src}
        alt={altText}
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
        <img
        src={brokenImage}
        style={{
            height: 200,
            opacity: 0.2,
            width: 200,
        }}
        draggable="false"
        alt="Broken image"
        />
    );
}

export default function ImageComponent({
    src,
    altText,
    nodeKey,
    width,
    height,
    maxWidth,
    resizable,
    }) {
    const imageRef = useRef(null);
    const buttonRef = useRef(null);
    const [isSelected, setSelected, clearSelection] =
        useLexicalNodeSelection(nodeKey);
    const [isResizing, setIsResizing] = useState(false);
    const {isCollabActive} = useCollaborationContext();
    const [editor] = useLexicalComposerContext();
    const [selection, setSelection] = useState(null);
    const activeEditorRef = useRef(null);
    const [isLoadError, setIsLoadError] = useState(false);
    const isEditable = useLexicalEditable();

    const $onEnter = useCallback(
        (event) => {
            const latestSelection = $getSelection();
            const buttonElem = buttonRef.current;
            if (
                isSelected &&
                $isNodeSelection(latestSelection) &&
                latestSelection.getNodes().length === 1
            ) {}
            return false;
        },
        [isSelected],
    );

    const $onEscape = useCallback(
        (event) => {
            return false;
        },
        [editor, setSelected],
    );

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
        editor.registerCommand(
            CLICK_COMMAND,
            onClick,
            COMMAND_PRIORITY_LOW,
        ),
        editor.registerCommand(
            RIGHT_CLICK_IMAGE_COMMAND,
            onClick,
            COMMAND_PRIORITY_LOW,
        ),
        editor.registerCommand(
            DRAGSTART_COMMAND,
            (event) => {
            if (event.target === imageRef.current) {
                // TODO This is just a temporary workaround for FF to behave like other browsers.
                // Ideally, this handles drag & drop too (and all browsers).
                event.preventDefault();
                return true;
            }
            return false;
            },
            COMMAND_PRIORITY_LOW,
        ),
        editor.registerCommand(KEY_ENTER_COMMAND, $onEnter, COMMAND_PRIORITY_LOW),
        editor.registerCommand(
            KEY_ESCAPE_COMMAND,
            $onEscape,
            COMMAND_PRIORITY_LOW,
        ),
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
        $onEnter,
        $onEscape,
        onClick,
        onRightClick,
        setSelected,
    ]);

    const onResizeEnd = (
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
    };

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
            
            {resizable && $isNodeSelection(selection) && isFocused && (
            <ImageResizer
                editor={editor}
                buttonRef={buttonRef}
                imageRef={imageRef}
                maxWidth={maxWidth}
                onResizeStart={onResizeStart}
                onResizeEnd={onResizeEnd}
            />
            )}
        </>
        </Suspense>
    );
}