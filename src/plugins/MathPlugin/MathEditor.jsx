import React, { useEffect, useState, useRef, useImperativeHandle, forwardRef, useLayoutEffect } from "react";
import {MathJax} from "better-react-mathjax";
import MathTree from "./MathTree";
import MathKeyboard from "./MathKeyboard";
import MathNodes, { MATH_COLOR_NODES } from "./MathNodes";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey, $getSelection, SELECTION_CHANGE_COMMAND, COMMAND_PRIORITY_LOW, $isNodeSelection, $isRangeSelection, $createNodeSelection, $setSelection } from "lexical";
import { showToast } from "../../ui/Toast";

const MathEditor = forwardRef(({nodeKey,initMathTree,inline,numbering,color},ref) => {
    const [mathTree,setMathTree] = useState(structuredClone(initMathTree));
    const [formula,setFormula] = useState("");
    const [command,setCommand] = useState("");
    const domRef = useRef(null);
    const [editor] = useLexicalComposerContext();

    useImperativeHandle(ref, () => ({
        addSymbol,
        customAction,
        handleClick // Makes these functions accessible from outside (in the lexical command callback)
    }));

    const setLocalMathTree = (newtree) => {// The tree is getting changed from inside this component
        setMathTree(newtree);
        editor.update(()=>{
            const node = $getNodeByKey(nodeKey);
            node.setMathTree(newtree); // Modifying 'upwards'
        });
    }

    const changeMathTree = (newtree) => { // 'Real' changes (ie not just cursor movement or selection) to the math tree. Relevant for the undo-redo functionnality. Would be nice if only those changes were taken into account for HistoryPlugin.
        setLocalMathTree(newtree);
    }

    useEffect(() => {
    return editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
            const selection = $getSelection();
            const editMode = MathTree.getEditMode(mathTree);

            if (editMode !== "none"){
                if ($isNodeSelection(selection)) {
                    const isThisNodeSelected = selection.getNodes().some(node => node.getKey() === nodeKey);
                    if (isThisNodeSelected){
                        return false;
                    }
                }
                unfocus();
            }
            return false;
        },
        COMMAND_PRIORITY_LOW
        );
    }, [editor, nodeKey, mathTree]);

    const unfocus = () => {
        const newmathtree = MathTree.unselect(MathTree.removeCursor(mathTree));
        setLocalMathTree(newmathtree);
    }

    const isCursorInModifier = () => {
        const cursorParent = MathTree.findCursorParent(mathTree);
        if (!cursorParent) return false;
        return cursorParent.node.ismodifier;
    }

    const addSymbol = (symbol,rawtext=false) => { // Called after a key press/command entered/on-screen key press
        const newnode = MathNodes.getNode(symbol,rawtext);
        addNode(newnode);
    }

    const addNode = (node,copyBefore=false) => {
        var newnode = {};
        if (copyBefore) newnode = structuredClone(node);
        else newnode = node;
        const editMode = MathTree.getEditMode(mathTree);
        if (editMode==="cursor"){
            if (isCursorInModifier() && !MathNodes.isValidRawText(newnode)) return; // Block adding this node
            if (MathNodes.ACCENTS.includes(newnode.symbol) || MathNodes.STYLES.includes(newnode.symbol)){
                changeMathTree(MathTree.adoptNodeBeforeCursor(mathTree,newnode));
            }
            else changeMathTree(MathTree.insertAtCursor(mathTree,newnode));
        }
        else if (editMode==="selection"){
            if (MathNodes.ACCENTS.includes(newnode.symbol) || MathNodes.STYLES.includes(newnode.symbol) || MATH_COLOR_NODES.includes(newnode.symbol)){
                changeMathTree(MathTree.adoptSelectedNode(mathTree,newnode));
            }
            else{
                const selection = MathTree.findSelectedNode(mathTree);
                if (MathTree.canReplace(selection.node,newnode)){
                    changeMathTree(MathTree.replaceAndAdopt(mathTree,selection.path,newnode,true));
                }
            }
        }
    };
    
    const customAction = (name) => {
        const splitname = name.split("-");
        const editMode = MathTree.getEditMode(mathTree);
        switch (splitname[0]){
            case "array":
                if (editMode==="cursor" || editMode==="selection"){
                    const path = MathTree.findCurrentPath(mathTree,editMode);
                    if (splitname[1]==="align"){
                        changeMathTree(MathTree.alignCol(mathTree,path,splitname[2]));
                    }
                }
                break;
            case "delimiter":
                if (editMode === "selection"){
                    const selection = MathTree.findSelectedNode(mathTree);
                    if (!selection.node.size) return; // Not a delimiter
                    if (splitname[1]==="size"){
                        const direction = splitname[2];
                        const result = MathTree.applyAtPath(mathTree,selection.path,n=>MathNodes.changeDelimiterSize(n,direction));
                        if (result) changeMathTree(result);
                    }
                }
        }
    }

    const handleClick =  (event) => {
        //event.preventDefault();
        event.stopPropagation(); // Avoids problems with focusing

        // Make sure to select the node in lexical
        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if (node) {
                const nodeSelection = $createNodeSelection();
                nodeSelection.add(nodeKey);
                $setSelection(nodeSelection);
            }
        });
        
        var element = event.target; // We need to go up the tree until we find an element with id 'math-...'
        while (!element.id || element.id.split("-")[0]!=="math") element = element.parentElement;
        var id = parseInt(element.id.split("-").pop());
        var newtree = MathTree.removeCursor(mathTree);
        newtree = MathTree.setSelectedNode(newtree,id);
        setLocalMathTree(newtree);
    };

    const handleCtrlShortcut = (event) => {
        const editMode = MathTree.getEditMode(mathTree);
        switch (event.key){
            case "i":
                setCommand("\\");
                break;
            case "u":
                event.preventDefault();
                addSymbol("^");
                break;
            case "d":
                addSymbol("_");
                break;
            case "a":
                event.preventDefault();
                // Maybe select all nodes (as a list ?)
                break;
            case "c":
                if (editMode==="selection"){
                    const selectedNode = MathTree.unselect(MathTree.findSelectedNode(mathTree).node);
                    const string = JSON.stringify(selectedNode);
                    navigator.clipboard.writeText(string);
                }
                break;
            case "x":
                if (editMode==="selection"){
                    const selection = MathTree.findSelectedNode(mathTree);
                    const string = JSON.stringify(MathTree.unselect(selection.node));
                    navigator.clipboard.writeText(string);
                    changeMathTree(MathTree.deleteSelectedNode(mathTree,true));
                }
                break;
            case "v":
                navigator.clipboard.readText().then((string)=>{
                    if ([...string].length===1){
                        addSymbol(string);
                    }
                    else{
                        try{
                            addNode(JSON.parse(string));
                        }
                        catch{
                            showToast("Could not paste text. Only valid imputs are single-character strings or formula parts directly copied.")
                            return;// Invalid JSON input
                        }
                    }// This code is hideous
                })
                break;
            case "ArrowUp":
                if (editMode==="selection"){
                    customAction("delimiter-size-bigger");
                }
                break;
            case "ArrowDown":
                if (editMode==="selection"){
                    customAction("delimiter-size-smaller");
                }
                break;
            case "r":
                event.preventDefault();
                if (editMode==="selection"){
                    customAction("delimiter-size-auto");
                }
                break;
        }
    };

    const handleCursormodeKeyDown = (event,parent,cursorPath) => {
        switch (event.key){
            case "Tab":
                if (parent.ismultiline) addSymbol("&");
                else if (parent.isroot){
                    if (inline && MathTree.isCursorAtEnd(mathTree)) break; // A bit ugly code since I'm checking the opposite in treating the KEY_TAB_COMMAND
                    addSymbol("\\quad");
                }
                else setLocalMathTree(MathTree.shiftCursor(mathTree,"right"));
                event.preventDefault();
                break;
            case "Enter":
                if (parent.ismultiline) addSymbol("\\\\");
                else if (parent.isroot){//AutoAlign
                    if (event.shiftKey){ // Now only if the shift key is pressed, to make leaving the math node easier
                        event.preventDefault();// For some reason, this doesn't work
                        setLocalMathTree(MathTree.alignAll(mathTree));
                        addSymbol("\\\\");
                    }
                }
                // Add \substack if needed
                else if (parent.nodeletion || parent.childrenaredown){
                    const substack = MathNodes.getNode("\\substack");
                    substack.children = structuredClone(parent.children);
                    parent.children = [substack];
                    setLocalMathTree(MathTree.insertAtPath(mathTree,cursorPath,parent,true));
                    addSymbol("\\\\");
                    event.preventDefault();
                }
                break;
            case "ArrowRight":
                setLocalMathTree(MathTree.shiftCursor(mathTree,"right"));
                event.preventDefault();
                break;
            case "ArrowLeft":
                setLocalMathTree(structuredClone(MathTree.shiftCursor(mathTree,"left")));
                event.preventDefault();
                break;
            case "ArrowDown":
                if (cursorPath.length>=1){ // In a frac-like sub-element. We need to go up two levels
                    var path = cursorPath.slice(0,-1);
                    const grandParent = MathTree.pathToNode(mathTree,path);
                    if ((cursorPath.at(-1)===0 && grandParent.verticalorientation==="down") || (cursorPath.at(-1)===1 && grandParent.verticalorientation==="up")){
                        path.push(1-cursorPath.at(-1));// Switch to the "down" part
                        var newtree = MathTree.removeCursor(mathTree);
                        newtree = MathTree.pushCursorAtPath(newtree,path);
                        setLocalMathTree(newtree);
                    }
                    event.preventDefault();
                }
                break;
            case "ArrowUp":
                if (cursorPath.length>=1){
                    var path = cursorPath.slice(0,-1);
                    const grandParent = MathTree.pathToNode(mathTree,path);
                    if ((cursorPath.at(-1)===0 && grandParent.verticalorientation==="up") || (cursorPath.at(-1)===1 && grandParent.verticalorientation==="down")){
                        path.push(1-cursorPath.at(-1));// Switch to the "up" part
                        var newtree = MathTree.removeCursor(mathTree);
                        newtree = MathTree.pushCursorAtPath(newtree,path);
                        setLocalMathTree(newtree);
                    }
                    event.preventDefault();
                }
                break;
            case "Backspace":
                var deletionResult = MathTree.deleteNextToCursor(mathTree,"left");
                if (deletionResult) changeMathTree(deletionResult);
                event.preventDefault();
                break;
            case "Delete":
                var deletionResult = MathTree.deleteNextToCursor(mathTree,"right");
                if (deletionResult) changeMathTree(deletionResult);
                event.preventDefault();
                break;
            case " ": // Space
                let replacementResult = MathTree.applyReplacementShortcut(mathTree);
                if (replacementResult.symbol){
                    setLocalMathTree(replacementResult.tree);// This removes the previously added characters
                    addSymbol(replacementResult.symbol);// This adds the new symbol (and updates the tree for Undo/Redo)
                }
                event.preventDefault();
                break;
            default:
                if (Object.values(MathNodes.DELIMITERS).includes(event.key)){
                    if (parent.rightsymbol===event.key && parent.children[parent.children.length-1].iscursor){
                        // Close the delimiter
                        setLocalMathTree(MathTree.shiftCursor(mathTree,"right"));
                        event.preventDefault();
                    }
                }
                break;
        }
    };

    const handleSelectionmodeKeyDown = (event) => {
        event.preventDefault();
        switch (event.key){
            case "Delete":
            case "Backspace":
                changeMathTree(MathTree.deleteSelectedNode(mathTree,true));
                break;
            case "ArrowRight":
                setLocalMathTree(MathTree.selectedToCursor(mathTree,"right"));
                break;
            case "ArrowLeft":
                setLocalMathTree(MathTree.selectedToCursor(mathTree,"left"));
                break;
        }
    }

    const handleKeyDown = (event) => {
        const editMode = MathTree.getEditMode(mathTree);
        if (editMode==="none") return;

        //console.log(event);

        // We need to check if we are in a "raw text" area and in cursor mode
        // I also keep a copy of the parent
        var parentCopy = {};
        var cursorPath = [];
        if (editMode==="cursor"){
            const result = MathTree.findCursorParent(mathTree);
            const parent = result.node;
            cursorPath = result.path;
            parentCopy = {...parent};
            if (parent.parseastext && event.key.length===1 && !event.ctrlKey){
                event.preventDefault();
                addSymbol(event.key,true);
                return;
            }
        }

        if (command===""){// Not writing a command
            if (event.ctrlKey){ // All control-based shortcuts
                handleCtrlShortcut(event);
            }
            else if (MathKeyboard.DIRECT_INPUT.includes(event.key))// Can be included as-is
            {
                event.preventDefault();
                addSymbol(event.key);
                // FastMath mode : we check for shortcuts also here
                if (!event.altKey){
                    let replacementResult = MathTree.applyReplacementShortcut(mathTree,true);
                    if (replacementResult.symbol){
                        setLocalMathTree(replacementResult.tree);// This removes the previously added characters
                        addSymbol(replacementResult.symbol);// This adds the new symbol (and updates the tree for Undo/Redo)
                    }
                }
            }
            else if (event.key in MathKeyboard.SIMPLE_REPLACEMENT){// Mostly for escaped characters that can be typed (ex. '{')
                event.preventDefault();
                addSymbol(MathKeyboard.SIMPLE_REPLACEMENT[event.key]);
            }
            else if (editMode==="cursor"){ // Controls that are specific to cursor mode (moving the cursor,...)
                handleCursormodeKeyDown(event,parentCopy,cursorPath);
            }
            else if (editMode==="selection"){ // Controls that are specific to selection mode
                handleSelectionmodeKeyDown(event);
            }
        }
        else{ // Writing a command
            if (event.key.length===1){
                event.preventDefault();
                setCommand(command+event.key);
            }
            else if (event.key==="Enter"){
                event.preventDefault();
                addSymbol(command);
                setCommand("");
            } 
        }
    }

    useEffect(() => { // Times where I need to change the listeners...
        const domElement = domRef.current;
        if (domElement) domElement.addEventListener("click",handleClick);
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            if (domElement) domElement.removeEventListener("click",handleClick);
            window.removeEventListener("keydown", handleKeyDown);
        }
    }, [mathTree,command]);

    useLayoutEffect(() => { // Updates the formula and thus the displayed equation
        const newformula = MathNodes.getFormula(mathTree,true);
        //console.log(newformula);
        setFormula(newformula);
    }, [mathTree]);

    const delimiter = inline ? "$" : "$$";
    const tag = numbering ? `\\tag{${numbering}}` : "";

  return (
    <div ref={domRef} className={inline?"inline":""} style={{color:`var(--xcolor-${color})`}}>
        <MathJax key={formula} inline={inline}>{`${delimiter} ${formula} ${tag} ${delimiter}`}</MathJax>
    </div>
  );
});

export default MathEditor;

