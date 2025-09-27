import MathKeyboard from "./MathKeyboard";
import MathNodes from "./MathNodes";

// MATH TREE MANIPULATION

// Basic & general manipulations

function applyToAllNodes(node, func) {// Not inplace
  const newnode = {
    ...node,
  };
  if (node.children) newnode.children = node.children.map(child => applyToAllNodes(child, func));
  func(newnode);
  return newnode;
}

function pathToNode(tree,path){// Recursively loops along the indices n and gets the n(th) children every time. Returns the node at the end.
  if (path.length===0) return tree;
  return pathToNode(tree.children[path[0]],path.slice(1));
}


function deleteNode(tree,path,deletionMode="selection",replaceWithCursor=false){ // Deletion mode : "selection"|"cursor".
  var newnode = {...tree};
  if (path.length===1){ // We need to delete one of its children
    const nodeToDelete = newnode.children[path[0]];
    if (!nodeToDelete.children || (nodeToDelete.hassinglechild && deletionMode==="cursor") || nodeToDelete.implodes){ // Implode
      newnode.children.splice(path[0],1);
    }
    else { // We will make it "explode" (ie leave its children).
      newnode.children.splice(path[0],1,...nodeToDelete.children);
    }
    if (replaceWithCursor) newnode.children.splice(path[0],0,MathNodes.CURSOR);
    return newnode;
  }
  // Else : do recursion
  // We need to check if we have emptied a modifier or a node that has a single child :
  var modifiedNode = deleteNode(newnode.children[path[0]],path.slice(1),deletionMode,replaceWithCursor);
  if (MathNodes.nChildren(modifiedNode)===0 && (modifiedNode.ismodifier || modifiedNode.hassinglechild)){
    newnode.children.splice(path[0],1); // Delete that node
    if (replaceWithCursor || deletionMode==="cursor") newnode.children.splice(path[0],0,MathNodes.CURSOR);
  }
  else newnode.children[path[0]] = modifiedNode;
  return newnode;
}

function insertAtPath(tree,path,node,replace=false){
  var newnode = {...tree};
  if (path.length===1){
    newnode.children.splice(path[0],replace?1:0,node);
  }
  else newnode.children[path[0]] = insertAtPath(newnode.children[path[0]],path.slice(1),node,replace);
  return newnode;
}

function applyAtPath(tree,path,f){
  const previousNode = pathToNode(tree,path);
  const newNode = f(previousNode);
  if (newNode) return insertAtPath(tree,path,newNode,true);
  return false;
}

function adoptAtPath(tree,path,parent){// The target node is replaced by the node 'parent', which adopts the previously present node.
  var previousnode = pathToNode(tree,path);
  parent.children = [previousnode];
  tree = insertAtPath(tree,path,parent,true);
  setUids(tree);
  return tree;
}

function alignAll(tree){ // Puts the whole tree (minus the root) in an align environment
  const alignNode = MathNodes.getNode("\\begin{align}");
  alignNode.children = tree.children.flatMap(n => (n.symbol==="="?[MathNodes.getNode("&"),n]:[n])); // Put '&' in front of any '='
  tree.children = [alignNode];
  return tree;
}

function setUids(tree,nextUid=0){// Inplace
  // Let's just give ids to all nodes
  tree.id = nextUid;
  nextUid++;
  if (tree.children){
    tree.children.forEach(childnode => {
      nextUid = setUids(childnode,nextUid);
    });
  }
  return nextUid;
}

function canReplace(node,newnode){
  if ((!node.children) || node.implodes) return true; // A node with no children list can always be replaced. Same with a node that should 'implode' upon deletion
  // node has children and does not implode
  if (node.fixedchildren) return (newnode.fixedchildren && newnode.children.length===node.children.length);
  if (node.hassinglechild) return (newnode.hassinglechild);
  if (node.ismodifier) return (newnode.ismodifier);
  if (node.ismultiline) return (newnode.ismultiline);
  return true;
}

function replaceAndAdopt(tree,path,newnode,placeCursor=false){
  const node = pathToNode(tree,path);
  var newtree = tree;
  if (node.children) newnode.children = node.children;
  if (placeCursor){
    const modifiedNewnode = MathNodes.insertCursorInNode(newnode);
    if (modifiedNewnode) newnode = modifiedNewnode;
    else{
      var cursorPath = [...path];
      cursorPath[cursorPath.length-1] = path.at(-1)+1;
      newtree = insertAtPath(newtree,cursorPath,MathNodes.CURSOR);
    }
  }
  var newtree = insertAtPath(tree,path,newnode,true);
  setUids(newtree);
  return newtree;
}

function getPositionInArray(tree,path){
  const targetIndex = path.at(-1);
  const parent = pathToNode(tree,path.slice(0,path.length-1));
  const siblings = parent.children;
  if (!parent.ismultiline) return false;
  var ilig = 0, icol = 0;
  for (var i=0;i<targetIndex;i++){
    if (siblings[i].symbol==="&") icol += 1;
    else if (siblings[i].symbol==="\\\\"){
      ilig += 1;
      icol = 0;
    }
  }
  return {ilig,icol};
}

function alignCol(tree,path,value){
  const icol = getPositionInArray(tree,path).icol;
  const arrpath = path.slice(0,path.length-1);
  var arr = pathToNode(tree,arrpath);
  if (arr.colparams.length > icol){
    arr.colparams = [...arr.colparams.slice(0, icol), value, ...arr.colparams.slice(icol + 1)].join("");
  }
  else{
    arr.colparams += "c".repeat(icol-arr.colparams.length) + value;
  }
  return insertAtPath(tree,arrpath,arr,true);
}

function findCurrentPath(tree,editMode){
  if (editMode==="cursor") return findCursorParent(tree).cursorPath;
  else if (editMode==="selection") return findSelectedNode(tree).path;
}

// Cursor position

function isCursorAtStart(tree){
  return (tree.children && tree.children[0].iscursor);
}

function isCursorAtEnd(tree){
  return (tree.children && tree.children.at(-1).iscursor);
}

function isOnlyCursor(tree){
  return (tree.children && tree.children.length === 1 && tree.children[0].iscursor);
}


// Cursor manipulations

function removeCursor(tree){
  const path = findCursorParent(tree).cursorPath;
  if (path) return deleteNode(tree,path);
  return tree;
}

function appendCursor(tree,prepend=false){
  if (prepend) tree.children.unshift(MathNodes.CURSOR);
  else tree.children.push(MathNodes.CURSOR);
  return tree;
}

function getEditMode(tree){
  const cP = findCursorParent(tree);
  if (cP) return "cursor";
  const sel = findSelectedNode(tree);
  if (sel) return "selection";
  return "none";
}

function findCursorParent(tree){
  if (tree.children){
    for (var index=0;index<tree.children.length;index++){
      let child = tree.children[index];
      if (child.iscursor) return {node:tree,path:[],cursorIndex:index,cursorPath:[index]};
      else if (child.children) {
        var result = findCursorParent(child);
        if (result){
          result.path.unshift(index);
          result.cursorPath.unshift(index);
          return result;
        }
      }
    }
  }
  return false;
}

function pushCursorAtPath(tree,path){// MathNodes.CURSOR will be pushed as a child of the node reached following the path
  if (path.length===0) {tree.children.push(MathNodes.CURSOR); return tree;}
  tree.children[path[0]] = pushCursorAtPath(tree.children[path[0]],path.slice(1));
  return tree;
}

function deleteNextToCursor(tree,direction){
  const index_shift = (direction==="right") ? 1 : -1;
  const cursorParentResults = findCursorParent(tree);
  const cursorParent = cursorParentResults.node;
  var path = cursorParentResults.path;
  const index = cursorParentResults.cursorIndex;
  const toDelete = cursorParent.children[index+index_shift];
  if (toDelete){ // Found something to delete !
    path.push(index+index_shift);
    // Specific case for when the node has children, and only a symbol on the left (no 'rightsymbol') : do nothing if going left !
    if (direction==="left" && toDelete.nodeletionfromright){ // Then we should "enter" (if the node has children), and delete nothing for now
      if (toDelete.children) {
        cursorParent.children.splice(index,1); // Remove cursor
        toDelete.children.push(MathNodes.CURSOR);
        return tree;
      }
      return false; 
    }
    if (direction==="right" && toDelete.nodeletionfromleft){ // Then we should "enter" (if the node has children), and delete nothing for now
      if (toDelete.children) {
        cursorParent.children.splice(index,1); // Remove cursor
        toDelete.children.splice(0,0,MathNodes.CURSOR);
        return tree;
      }
      return false; 
    }
    else if (toDelete.ismodifier){// Then we need to enter the modifier (depends on how many children it has)
      let nchildren = toDelete.children.length;
      if (nchildren<=1) return deleteNode(tree,path,"cursor"); // We empty the modifier, so we delete it completely.
      else{
        // Start by removing the cursor
        cursorParent.children.splice(index,1);
        // Then delete the node and replace it with the cursor
        let childToDeleteIndex = (direction==="right") ? 0 : toDelete.children.length-1;
        path.push(childToDeleteIndex);
        return deleteNode(tree,path,"cursor",true);
      }
    }
    return deleteNode(tree,path,"cursor");
  }
  else if (!cursorParent.nodeletion && (index+index_shift === -1 || (index+index_shift === cursorParent.children.length && !cursorParent.nodeletionfromright)) && !(cursorParent.ismodifier && cursorParent.children.length>1)){// deletion 'from inside' of cursorParent.
    if (cursorParent.implodes) return deleteNode(tree,path,"cursor",true);
    else return deleteNode(tree,path,"cursor",false);// The cursor will already be placed as for any other child (if explosion only)
  }
  return false;
}

function recursiveShiftCursor(node,shift) {
  // node is NOT cursor
  const newnode = {...node}; // Make copy
  if (node.children){
    const index = node.children.findIndex(child => child.iscursor);// Looking for the cursor
    if (index===-1){// Not found among direct children. recursion.
      newnode.children = [];
      if (newnode.fixedchildren){
        let results = node.children.map(c=>recursiveShiftCursor(c,shift));
        newnode.children = results.map(c=>c.node);
        const justFoundCursorIndex = results.findIndex(r => r.justFoundCursor);
        if (justFoundCursorIndex===-1) return {node:newnode,justFoundCursor:false}; // Cursor not found
        const shiftedIndex = justFoundCursorIndex+shift;
        if (0 <= shiftedIndex && shiftedIndex < newnode.children.length){ // Moving from one child to another
          if (shift===1) newnode.children[shiftedIndex].children.splice(0,0,MathNodes.CURSOR);// Move cursor to the 'right'
          else newnode.children[shiftedIndex].children.push(MathNodes.CURSOR); // Move to the 'left'
          return {node:newnode,justFoundCursor:false}; // Not necessary statement, but makes the code slightly clearer
        }
        else return {node:newnode,justFoundCursor:true}; // Send the cursor another level up
      }
      else{
        node.children.forEach(child => {
          let results = recursiveShiftCursor(child,shift);
          if (shift===-1 && results.justFoundCursor) newnode.children.push(MathNodes.CURSOR);
          newnode.children.push(results.node);
          if (shift===1 && results.justFoundCursor) newnode.children.push(MathNodes.CURSOR);
        });
      }
    }
    else{ // MathNodes.CURSOR is a direct child of newnode
      var nextnode = newnode.children[index+shift];
      if (nextnode){ // Simple case : we don't leave this branch
        if (nextnode.fixedchildren){ // Special case, we need to go down 2 levels
          newnode.children.splice(index,1); // Remove the cursor
          if (shift === 1) nextnode.children.at(0).children.splice(0,0,MathNodes.CURSOR);
          else nextnode.children.at(-1).children.splice(nextnode.children.at(-1).children.length,0,MathNodes.CURSOR);
        }
        else if (nextnode.children && !nextnode.hassinglechild){// We need to go down the tree, and insert the cursor as a new leaf.
          newnode.children.splice(index,1); // Remove the cursor
          nextnode.children.splice((shift===1)?0:nextnode.children.length,0,MathNodes.CURSOR);
        }
        else{// Just exchange MathNodes.CURSOR and nextnode
          [newnode.children[index],newnode.children[index+shift]] = [nextnode,MathNodes.CURSOR];
        }
      }
      else{ // We need to go up the tree. We do that by returning a flag saying we just found the cursor
        if (!node.isroot) newnode.children.splice(index,1); // Remove the cursor (except if we are the root node)
        return {node:newnode,justFoundCursor:true};
      }
    }
  }
  return {node:newnode,justFoundCursor:false};
}

function shiftCursor(tree,direction){
  return recursiveShiftCursor(tree,direction==="right"?1:-1).node;
}

function insertAtCursor(tree,newnode){
  const targetpath = findCursorParent(tree).cursorPath;
  const modifiedNode = MathNodes.insertCursorInNode(newnode);
  var newtree = {};
  if (modifiedNode){// Case where we inserted the cursor, then we need to remove it by replacing it.
    newtree = insertAtPath(tree,targetpath,modifiedNode,true);
  }
  else{
    newtree = insertAtPath(tree,targetpath,newnode,false);
  }
  setUids(newtree);
  return newtree;
}

function adoptNodeBeforeCursor(tree,newnode){ // Add an accent or modifier on the node before the cursor
  const cpr = findCursorParent(tree);
  if (cpr.cursorIndex>=1){
    var path = cpr.path;
    path.push(cpr.cursorIndex-1);
    return adoptAtPath(tree,path,newnode);
  }
  return tree;
}

function applyReplacementShortcut(tree){
  const cursorParentResults = findCursorParent(tree);
  var cursorParent = cursorParentResults.node;
  const index = cursorParentResults.cursorIndex;
  var s = "";
  const maxlength = 6;
  for (var i=1;i<=maxlength;i++){ // First, find the longest possible string
    if (index-i<0 || !cursorParent.children[index-i].symbol || cursorParent.children[index-i].symbol.length !== 1) break;
    s = cursorParent.children[index-i].symbol + s;
  }
  // Then, we look in priority at the longest sequences
  const slen = s.length;
  for (var j=0;j<=slen-1;j++){
    let splitstring = s.slice(j);
    if (splitstring in MathKeyboard.SHORTCUTS){
      cursorParent.children.splice(index-slen+j,slen-j); // Remove the "used" nodes
      return {tree,symbol:MathKeyboard.SHORTCUTS[splitstring]};
    }
  }
  return {tree,symbol:undefined};
}

// Selection

function unselect(tree){
  return applyToAllNodes(tree,n => n.selected=false);
}

function setSelectedNode(tree,id){
  return applyToAllNodes(tree,(n)=>{n.selected=(n.id===id)});
}

function deleteSelectedNode(tree,replaceWithCursor){
  return deleteNode(tree,findSelectedNode(tree).path,"selection",replaceWithCursor);
}

function findSelectedNode(node){
  if (node.selected) return {node,path:[]};
  if (node.children){
    for (var index=0;index<node.children.length;index++){
      var res = findSelectedNode(node.children[index]);
      if (res){
        res.path.unshift(index);
        return res;
      }
    }
  }
  return false;
}

function adoptSelectedNode(tree,newnode){
  const selection = findSelectedNode(tree);
  return adoptAtPath(tree,selection.path,newnode);
}

function selectedToCursor(tree,side){ // Add cursor next to selected, and unselect
  var path = findSelectedNode(tree).path;
  if (side==="right") path[path.length-1] += 1;
  return unselect(insertAtPath(tree,path,MathNodes.CURSOR,false));
}

export default {pathToNode,getPositionInArray,findCurrentPath,alignCol,pushCursorAtPath,deleteSelectedNode,deleteNextToCursor,insertAtCursor,adoptNodeBeforeCursor,adoptSelectedNode,removeCursor,appendCursor,shiftCursor,setSelectedNode,selectedToCursor,unselect,findCursorParent,applyReplacementShortcut,alignAll,findSelectedNode,canReplace,replaceAndAdopt,applyAtPath,insertAtPath,isCursorAtStart,isCursorAtEnd,getEditMode,isOnlyCursor}