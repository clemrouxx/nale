// Defines useful lists / constants / simple functions regarding math nodes, and trnasforming symbols into nodes and nodes into LaTeX

// The following lists / dictionnaries determine the propesrties of the inserted node (regarding selection, cursor placement, deletion...)
// Includes the core and AMS commands (as well as a few commands from the physics package)
export const MATH_COLORS = ["black", "blue", "brown", "cyan", "darkgray", "gray", "green", "lightgray", "lime", "magenta", "olive", "orange", "pink", "purple", "red", "teal", "violet", "white", "yellow"];
const PARENT_SYMBOLS = ["\\sqrt","\\overline","\\underline","\\widehat","\\widetilde","\\overrightarrow","\\overleftarrow","\\overleftrightarrow","\\underleftarrow","\\underrightarrow","\\underleftrightarrow","\\bra","\\ket","\\Bra","\\Ket","\\abs","\\norm","\\order","\\stackrel{!}","\\stackrel{?}","\\boxed","\\operatorname","\\mod","\\bmod","\\pmod","\\substack"];
export const MATH_COLOR_NODES = MATH_COLORS.map(c=>`\\textcolor{${c}}`);
const INVISIBLE_PARENT_SYMBOLS = ["_","^"].concat(MATH_COLOR_NODES);
const MULTILINE_PARENT_SYMBOLS = ["\\substack"];
const ACCENTS = ["\\vec","\\bar","\\dot","\\ddot","\\dddot","\\ddddot","\\hat","\\vu","\\check","\\tilde","\\breve","\\acute","\\grave","\\mathring"];
const STYLES = ["\\mathcal","\\mathbb","\\mathfrak","\\mathbf","\\mathsf","\\vb","\\va","\\boldsymbol","\\pmb"];
const DELIMITERS = {"(":")","[":"]","\\{":"\\}","\\lvert":"\\rvert","\\lVert":"\\rVert","\\langle":"\\rangle","\\lfloor":"\\rfloor","\\lceil":"\\rceil","\\ulcorner":"\\urcorner","\\llcorner":"\\lrcorner"};
const MODIFIERS = ["\\mathrm","\\text","\\textrm","\\textbf","\\textit"];
const FRAC_LIKE = ["\\frac","\\overbrace","\\underbrace","\\overset","\\underset","\\dv","\\pdv","\\fdv","\\braket","\\ketbra","\\dyad","\\comm","\\acomm","\\pb","\\ip","\\op","\\expval","\\ev","\\dfrac","\\tfrac","\\cfrac","\\binom","\\dbinom","\\tbinom","\\sideset","\\xleftarrow","\\xrightarrow"]; // Symbols that have strictly 2 children (other than sum-like)
const SUM_LIKE = ["\\sum","\\int","\\bigcap","\\bigcup","\\bigodot","\\bigoplus","\\bigotimes","\\bigsqcup","\\biguplus","\\bigvee","\\bigwedge","\\coprod","\\prod"]; // Also strictly 2 children, but displayed differently as fractions
const LIM_LIKE = ["\\lim","\\iint","\\iiint","\\iiiint","\\oint","\\idotsint"];
const THREE_CHILDREN = ["\\eval","\\matrixel","\\mel","\\mel**","\\overunderset"];
const ENVIRONMENTS_NAMES = ["aligned","cases","matrix","pmatrix","bmatrix","Bmatrix","vmatrix","Vmatrix"];
var ENVIRONMENTS = ENVIRONMENTS_NAMES.reduce((acc, name) => {
    acc[`\\begin{${name}}`] = `\\end{${name}}`;
    return acc;
  }, {});
ENVIRONMENTS[`\\begin{array}{}`] = "\\end{array}";

const INVISIBLE_SYMBOLS = ["_","^","\\\\","&","\\hline"]; // Don't have html classes attached. Unfortunately seems necessary for hline

const DELIMITER_SIZES = {auto:["\\left","\\right"],default:["",""],big:["\\bigl","\\bigr"],Big:["\\Bigl","\\Bigr"],bigg:["\\biggl","\\biggr"],Bigg:["\\Biggl","\\Biggr"]};

const CURSOR = {iscursor:true,symbol:"|"};

const DEFAULT_TREE = {isroot:true,nodeletion:true,children:[]};

// Functions that act like node constructors
const Symbol = (symbol) => {return {symbol}};
const ParentSymbol = (symbol) => {return {symbol,children:[],nodeletionfromright:true,ismultiline:MULTILINE_PARENT_SYMBOLS.includes(symbol)}};
const InvisibleParentSymbol = (symbol) => {return {symbol,children:[],nodeletionfromright:true,nodeletionfromleft:true,ismultiline:MULTILINE_PARENT_SYMBOLS.includes(symbol)}};
const LimLike = (symbol) => {return {symbol,children:[],childrenaredown:true,implodes:true}};
const Accent = (symbol) => {return {symbol,children:[],hassinglechild:true}}
const Style = (symbol) => {return {symbol,children:[],hassinglechild:true,implodes:true}}
const Delimiter = (symbol) => {return {leftsymbol:symbol,rightsymbol:DELIMITERS[symbol],children:[],size:"auto"}};
const Modifier = (symbol) => {return {symbol,children:[],ismodifier:true,parseastext:true,implodes:true}};
const FracLike = (symbol) => {
  var childrenstring = "{§0}{§1}";
  var verticalorientation = "down";
  if (SUM_LIKE.includes(symbol)) {childrenstring = "_{§0}^{§1}"; verticalorientation="up";}
  else if (symbol === "\\underbrace") childrenstring = "{§0}_{§1}";
  else if (symbol === "\\overbrace") {childrenstring = "{§0}^{§1}"; verticalorientation="up";}
  else if (symbol === "\\sqrt") childrenstring = "[§0]{§1}";
  else if (["\\xleftarrow","\\xrightarrow"].includes(symbol)) {childrenstring = "[§0]{§1}"; verticalorientation="up";}
  else if (symbol==="\\underset") verticalorientation="up";
  return {symbol,verticalorientation,children:[{children:[],nodeletion:true},{children:[],nodeletion:true}],fixedchildren:true,implodes:true,childrenstring}
};
const ThreeChildren = (symbol) => {
  var childrenstring = "{§0}{§1}{§2}";
  if (symbol==="\\eval") childrenstring = "{§0}_§1^§2";
  return {symbol,children:[{children:[],nodeletion:true},{children:[],nodeletion:true},{children:[],nodeletion:true}],fixedchildren:true,implodes:true,childrenstring}
};
const Environment = (symbol) => {return {leftsymbol:symbol,rightsymbol:ENVIRONMENTS[symbol],children:[],ismultiline:true,nodeletionfromright:true,implodes:true,colparams:""}};

const NAMED_NODES = {
  squared:{...getNode("^"),children:[{symbol:"2"}]},
  nsqrt: FracLike("\\sqrt"),// Like sqrt, but with an additionnal argument (in [...]).
  inverse: {...getNode("^"),children:[{symbol:"-"},{symbol:"1"}]},
  transpose: {...getNode("^"),children:[{symbol:"\\top"}]},
  updagger: {...getNode("^"),children:[{symbol:"\\dagger"}]},
  dvn : {...ThreeChildren("\\dv"),childrenstring:"[§0]{§1}{§2}"},
  pdvn : {...ThreeChildren("\\pdv"),childrenstring:"[§0]{§1}{§2}"},
  dv2: {...FracLike("\\dv"),childrenstring:"[2]{§0}{§1}"},
  pdv2: {...FracLike("\\pdv"),childrenstring:"[2]{§0}{§1}"},
  pdvmixed : ThreeChildren("\\pdv"),
  rbrace : {leftsymbol:".",rightsymbol:"\\rbrace",children:[getNode("\\begin{array}{}")],size:"auto"},
  starred:{...getNode("^"),children:[{symbol:"*"}]},
}


// Automatically create node for a given symbol
function getNode(symbol,rawtext=false,addplaceholders=false){
  var node = {};
  if (rawtext) node = Symbol(symbol);
  else if (PARENT_SYMBOLS.includes(symbol)) node = ParentSymbol(symbol);
  else if (INVISIBLE_PARENT_SYMBOLS.includes(symbol)) node = InvisibleParentSymbol(symbol);
  else if (ACCENTS.includes(symbol)) node = Accent(symbol);
  else if (STYLES.includes(symbol)) node = Style(symbol);
  else if (symbol in DELIMITERS) node = Delimiter(symbol);
  else if (MODIFIERS.includes(symbol)) node = Modifier(symbol);
  else if (FRAC_LIKE.includes(symbol) || SUM_LIKE.includes(symbol)) node = FracLike(symbol);
  else if (LIM_LIKE.includes(symbol)) node = LimLike(symbol);
  else if (THREE_CHILDREN.includes(symbol)) node = ThreeChildren(symbol);
  else if (symbol in ENVIRONMENTS) node = Environment(symbol);
  else if (symbol in NAMED_NODES) node = structuredClone(NAMED_NODES[symbol]);
  else node = Symbol(symbol);
  if (addplaceholders) return includePlaceholders(node);
  else return node;
}

const PLACEHOLDER = {isplaceholder:true,symbol:"\\square"};
const SMALLLETTERPLACEHOLDER = {isplaceholder:true,symbol:"x"};
const BIGLETTERPLACEHOLDER = {symbol:"A"};// Removed the placeholder flag so that it is not transluscent
const MULTILINEPLACEHOLDER = {symbol:".&.\\\\.&."};
const FULLSQUAREPLACEHOLDER = {symbol:"\\blacksquare"};

function includePlaceholders(node){
  if (!node.children) return node;
  if (ACCENTS.includes(node.symbol)) return {...node,children:[SMALLLETTERPLACEHOLDER]};
  if (STYLES.includes(node.symbol)) return {...node,children:[BIGLETTERPLACEHOLDER]};
  if (MATH_COLOR_NODES.includes(node.symbol)) return {...node,children:[FULLSQUAREPLACEHOLDER]};
  if (node.fixedchildren) return {...node,children:node.children.map(c=>{return c.children?{...c,children:[PLACEHOLDER]}:c;})};
  if (node.children.length===0) return {...node,children:[node.ismultiline?MULTILINEPLACEHOLDER:PLACEHOLDER]};
  // Parent node, we do this recursively (should be the case also for fixedchildren...)
  return {...node,children:node.children.map(includePlaceholders)};
}

const DELIMITER_SIZES_ORDER = ["default","big","Big","bigg","Bigg"];

function changeDelimiterSize(node,direction){// direction : "bigger","smaller" or "auto"
  var size = node.size;
  if (size==="auto"){
    if (direction==="bigger") return {...node,size:"big"};
    else if (direction==="smaller") return {...node,size:"default"};
    else return false;
  }
  if (direction==="auto") return {...node,size:"auto"};
  const i = DELIMITER_SIZES_ORDER.indexOf(size);
  const shift = (direction==="bigger")?1:-1;
  if (i+shift<0 || i+shift>=DELIMITER_SIZES_ORDER.length) return false; // Already at min or max size
  return {...node,size:DELIMITER_SIZES_ORDER[i+shift]};
}

// LaTeX formula
function getFormula(node,forEditor){
    if (node.iscursor) return forEditor ? `\\class{math-cursor}{${node.symbol}}` : "";

    var string =  "";
    
    // First / main symbol
    if (node.symbol) string += node.symbol;
    if (!node.children && node.symbol.startsWith("\\")) string += " ";// Add space after commands with no children
    else if (node.leftsymbol){
      if (node.size) string += DELIMITER_SIZES[node.size][0];
      if (node.colparams) string += node.leftsymbol.replace("{}",`{${node.colparams}}`);
      else string += node.leftsymbol;
      string += " ";
    }

    // Now we consider the node children
    if (node.parseastext){// Raw text
      let inside = node.children.map(c=>(c.iscursor && !forEditor)?"":c.symbol).join("");
      string += `{${inside}}`;
    }
    // In all other cases, there is recursion
    else if (node.fixedchildren){
      if (node.children.length===2) string += node.childrenstring.replace("§0",getFormula(node.children[0],forEditor)).replace("§1",getFormula(node.children[1],forEditor));
      else string += node.childrenstring.replace("§0",getFormula(node.children[0],forEditor)).replace("§1",getFormula(node.children[1],forEditor)).replace("§2",getFormula(node.children[2],forEditor));
    }
    else if (node.children){
      if (node.symbol){
        if (node.childrenaredown) string += "_";// For limits...
        string += `{${node.children.map(c=>getFormula(c,forEditor)).join("")}}`;
      }
      else string += node.children.map(c=>getFormula(c,forEditor)).join(""); // Just a simple grouping
    }

    // Second symbol if it exists (ex closing delimiter)
    if (node.rightsymbol){
      if (node.size) string += DELIMITER_SIZES[node.size][1];
      string += node.rightsymbol;
      string += " "; // Ensures good separation
    }

    // Surrounding commands for classes & ids
    const isinvisible = INVISIBLE_SYMBOLS.includes(node.symbol);
    if (forEditor && !node.isroot && !isinvisible) string = `\\class{math-node}{\\cssId{math-${node.id}}{${string}}}`;
    if (node.selected && forEditor) string = `\\class{math-selected}{${string}}`;
    else if (node.isplaceholder) string = `\\class{math-placeholder}{${string}}`;
    return string;
}

function isValidRawText(node){
    if (node.children) return false;
    if (node.symbol.length>1) return false;
    return true;
}

function nChildren(node){ // Number of 'real' children
  if (!node.children) return undefined;
  if (node.children.some(c=>c.iscursor)) return node.children.length-1;
  return node.children.length;
}

function insertCursorInNode(node){// Insert cursor at the "right place", assuming this node will be added to the math tree
  if (!node.children) return false; // Cannot insert cursor
  const nchildren = nChildren(node);
  var newnode = {...node};
  if (nchildren===0) {
    newnode.children = [CURSOR];
    return newnode;
  }
  for (var i=0;i<nchildren;i++){
    const modifiedNode = insertCursorInNode(node.children[i]); // Recursivity
    if (modifiedNode){// Success
      newnode.children[i] = modifiedNode;
      return newnode;
    }
  }
  // No success
  return false;
}

const MathNodes = {DEFAULT_TREE,CURSOR,ACCENTS,STYLES,DELIMITERS,getNode,getFormula,isValidRawText,nChildren,insertCursorInNode,changeDelimiterSize};

export default MathNodes;