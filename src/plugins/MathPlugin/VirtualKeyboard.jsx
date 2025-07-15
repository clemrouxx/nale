import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useActiveNode } from "../../utils/lexicalUtils";
import { useState } from "react";
import { MathJax } from "better-react-mathjax";
//import { Tooltip } from "react-tooltip";
import MathKeyboard from "./MathKeyboard";
import MathNodes from "./MathNodes";
import { ADD_MATH_SYMBOL_COMMAND } from ".";

const GREEK_LETTERS = ["\\alpha","\\beta","\\gamma","\\Gamma","\\delta","\\Delta","\\epsilon","\\varepsilon","\\zeta","\\eta","\\theta","\\vartheta","\\Theta","\\iota","\\kappa","\\varkappa","\\lambda","\\Lambda","\\mu","\\nu","\\xi","\\Xi","\\pi","\\Pi","\\rho","\\varrho","\\sigma","\\Sigma","\\tau","\\upsilon","\\Upsilon","\\phi","\\varphi","\\Phi","\\chi","\\psi","\\Psi","\\omega","\\Omega"];
const MISC = ["\\infty","\\partial","\\forall","\\exists","\\nexists","\\varnothing","\\ell","\\nabla","\\triangle","\\square","\\hbar","\\imaginary","\\real","\\complement","\\dagger","\\neg","\\therefore","\\dots","\\because","\\vdots","\\ddots","\\top","\\ddagger","\\_","\\bigstar","\\emptyset","\\imath","\\jmath","\\sharp","\\flat","\\natural","\\diagdown","\\diagup","\\diamond","\\Diamond","\\Finv","\\Game","\\hslash","\\mho","\\prime","\\surd","\\wp","\\angle","\\measuredangle","\\sphericalangle","\\triangledown","\\vartriangle","\\blacklozenge","\\blacksquare","\\blacktriangle","\\blacktriangledown","\\backprime","\\circledS","\\circledR","\\digamma","\\eth","\\S","\\checkmark","\\maltese","\\grad","\\div","\\curl","\\laplacian","\\aleph","\\beth","\\daleth","\\gimel","k_B"];
const ARROWS = ["\\rightarrow","\\mapsto","\\Rightarrow","\\leftarrow","\\Leftarrow","\\leftrightarrow","\\Leftrightarrow","\\Longleftrightarrow","\\rightleftarrows","\\downarrow","\\Downarrow","\\uparrow","\\updownarrow","\\Updownarrow","\\Uparrow","\\longmapsto","\\longleftarrow","\\longrightarrow","\\longleftrightarrow","\\Longleftarrow","\\Longrightarrow","\\leftrightarrows","\\rightleftarrows","\\downdownarrows","\\upuparrows","\\leftleftarrows","\\rightrightarrows","\\nearrow","\\searrow","\\swarrow","\\nwarrow","\\rightleftharpoons","\\leftrightharpoons","\\rightharpoondown","\\leftharpoondown","\\rightharpoonup","\\leftharpoonup","\\downharpoonleft","\\downharpoonright","\\upharpoonleft","\\upharpoonright","\\circlearrowleft","\\circlearrowright","\\curvearrowleft","\\curvearrowright","\\dashleftarrow","\\dashrightarrow","\\leftarrowtail","\\rightarrowtail","\\rightsquigarrow","\\leftrightsquigarrow","\\Lleftarrow","\\Rrightarrow","\\looparrowleft","\\looparrowright","\\Lsh","\\Rsh","\\twoheadleftarrow","\\twoheadrightarrow","\\nLeftarrow","\\nRightarrow","\\nLeftrightarrow","\\nleftarrow","\\nrightarrow","\\nleftrightarrow"];
const ACCENTS = MathNodes.ACCENTS;

const ENVIRONMENT_NAMES = ["cases","pmatrix","bmatrix","Bmatrix","vmatrix","Vmatrix"];
const MULTILINES = ["\\begin{array}{}","rbrace"].concat(...ENVIRONMENT_NAMES.map(n=>`\\begin{${n}}`));

const BINARY_OPERATORS = ["\\times","\\cdot","\\circ","\\pm","\\mp","\\oplus","\\otimes","\\cap","\\cup","\\sqcap","\\sqcup","\\wedge","\\vee","\\amalg","\\ast","\\bigcirc","\\bigtriangledown","\\bigtriangleup","\\bullet","\\odot","\\ominus","\\oslash","\\star","\\triangleleft","\\triangleright","\\uplus","\\wr","\\barwedge","\\doublebarwedge","\\veebar","\\boxdot","\\boxminus","\\boxplus","\\boxtimes","\\Cap","\\Cup","\\circledast","\\circledcirc","\\circleddash","\\curlyvee","\\curlywedge","\\divideontimes","\\dotplus","\\intercal","\\leftthreetimes","\\rightthreetimes","\\ltimes","\\rtimes","\\smallsetminus"];
const RELATIONS = ["\\neq","\\equiv","\\not\\equiv","\\cong","\\ncong","\\sim","\\nsim","\\simeq","\\approx","\\propto","\\perp","\\parallel","\\nparallel","\\triangleq","\\stackrel{!}{=}","\\stackrel{?}{=}","\\asymp","\\bowtie","\\doteq","\\frown","\\smile","\\not\\simeq","\\approxeq","\\backsim","\\backsimeq","\\between","\\bumpeq","\\Bumpeq","\\circeq","\\doteqdot","\\eqcirc","\\fallingdotseq","\\risingdotseq","\\pitchfork","\\shortparallel","\\nshortparallel","\\smallfrown","\\smallsmile","\\thickapprox","\\thicksim","\\varpropto"];
const ORDER = ["\\leq","\\geq","\\ll","\\gg","\\subset","\\supset","\\subseteq","\\supseteq","\\in","\\ni","\\notin","\\lesssim","\\gtrsim","\\mid","\\nmid","\\nless","\\ngtr","\\nleq","\\ngeq","\\nsubseteq","\\nsupseteq","\\lll","\\ggg","\\lhd","\\rhd","\\triangleleft","\\triangleright","\\unlhd","\\unrhd","\\prec","\\succ","\\preceq","\\succeq","\\sqsubset","\\sqsupset","\\sqsubseteq","\\sqsupseteq","\\dashv","\\vdash","\\leqq","\\geqq","\\leqslant","\\geqslant","\\lessapprox","\\gtrapprox","\\lessdot","\\gtrdot","\\eqslantless","\\eqslantgtr","\\precsim","\\succsim","\\precapprox","\\succapprox","\\Subset","\\Supset","\\subseteqq","\\supseteqq","\\preccurlyeq","\\succcurlyeq","\\curlyeqprec","\\curlyeqsucc","\\blacktriangleleft","\\blacktriangleright","\\trianglelefteq","\\trianglerighteq","\\lessgtr","\\lesseqgtr","\\gtreqless","\\gtrless","\\models","\\Vdash","\\vDash","\\Vvdash","\\precnapprox","\\succnapprox","\\precnsim","\\succnsim","\\lnapprox","\\gnapprox","\\lnsim","\\gnsim","\\lneq","\\gneq","\\lneqq","\\gneqq","\\subsetneq","\\supsetneq","\\subsetneqq","\\supsetneqq"];
const CONSTRUCTS = ["\\lvert","\\lVert","\\lfloor","\\lceil","\\langle","\\sum","\\prod","\\int","\\dv","\\pdv","\\eval","\\bigcup","\\bigcap","\\bigoplus","\\bigotimes","\\bigwedge","\\bigvee","\\bigodot","\\biguplus","\\fdv","dvn","pdvn","dv2","pdv2","pdvmixed","\\iint","\\iiint","\\oint","\\iiiint","\\idotsint","\\xleftarrow","\\xrightarrow","inverse","transpose","updagger","\\ket","\\bra","\\braket","\\ketbra","\\mel**","\\stackrel{!}","\\stackrel{?}","\\boxed","\\binom","\\overbrace","\\underbrace","\\widetilde","\\widehat","\\overline","\\overrightarrow","\\overleftarrow","\\overleftrightarrow","\\underline","\\underrightarrow","\\underleftarrow","\\underleftrightarrow","\\ulcorner","\\llcorner","\\overset","\\underset","\\overunderset"];
const NAMED_FUNCTIONS = ["\\exp","\\log","\\ln","\\min","\\max","\\arg","\\lim","\\cos","\\sin","\\tan","\\arccos","\\arcsin","\\arctan","\\cosh","\\sinh","\\tanh","\\det","\\ker","\\inf","\\sup","\\deg","\\cot","\\sec","\\csc","\\dim","\\gcd","\\hom","\\lg","\\liminf","\\limsup","\\Pr","\\injlim","\\projlim","\\varinjlim","\\varprojlim","\\varliminf","\\varlimsup","\\Tr","\\tr","\\rank","\\erf","\\Res","\\pv","\\PV","\\Re","\\Im","\\bmod","\\pmod"];

const VERY_BIG_SYMBOLS = ["\\sum","\\prod","\\int","\\iint","\\iiint","\\oint","\\dv","\\pdv","dvn","pdvn","dv2","pdv2","\\bigcup","\\bigcap","\\bigoplus","\\bigotimes","\\overbrace","\\underbrace","\\bigwedge","\\bigvee","\\bigodot","\\biguplus","\\iiiint","\\idotsint","pdvmixed","\\fdv","\\braket","\\ketbra","\\mel**","\\eval","\\xrightarrow","\\xleftarrow","\\binom","\\overunderset"];

const reversedShortcuts = Object.fromEntries(Object.entries(MathKeyboard.SHORTCUTS).map(([key, value]) => [value, key]));
const getShortcut = (symbol) => reversedShortcuts[symbol] ? `${reversedShortcuts[symbol]} [Space]` : undefined;

export const VirtualKeyboard = ({ formulaEditorRef }) => {
    const { activeNode } = useActiveNode();
    const [isOpen,setOpen] = useState(true);
    return (
        <>
        {activeNode && ( //activeNode.getType() === "math"
        <div className="span2cols">
            <div className={"drawer-handle horizontal " + (isOpen?"down":"up")} onClick={()=>{setOpen(!isOpen)}} title="Toggle Virtual Keyboard"></div>
            {isOpen && (
                <MathJax>
                <div className="virtual-keyboard">
                    <FirstRow />
                    <Category title="Other delimiters & constructs" symbols={CONSTRUCTS} nKeysShown={15} keyClassName="larger-button"/>
                    <Category title="Binary operators" symbols={BINARY_OPERATORS} nKeysShown={14}/>
                    <Category title="Miscellaneous" symbols={MISC} nKeysShown={18}/>
                    <Category title="Binary 'equivalence' relations" symbols={RELATIONS} nKeysShown={16}/>
                    <Category title="Binary 'ordering' relations" symbols={ORDER} nKeysShown={17}/>
                    <Category title="Arrows" symbols={ARROWS} nKeysShown={15}/>
                    <Category title="Accents" symbols={ACCENTS} reference={formulaEditorRef}/>
                    <Category title="Greek letters" symbols={GREEK_LETTERS} className="wide-category"/>
                    <Category title="Functions & such" symbols={NAMED_FUNCTIONS} nKeysShown={16} className="wide-category"/>
                    <MultilineCategory reference={formulaEditorRef}/>
                </div>
                </MathJax>
            )}
        </div>
        )}
        </>
    );
};

const FirstRow = () => {
  const PLACEHOLDER_STRING = "\\class{math-placeholder}{\\square}";
  return (
    <div className="first-row">
      <h3>Common constructs</h3>
      <div className="key-row">
        <VirtualKey symbol="squared" tooltip={getShortcut("squared")} display={`${PLACEHOLDER_STRING}^2`} />
        <VirtualKey symbol="^" display={`A^${PLACEHOLDER_STRING}`} tooltip="Ctrl+u OR ^"  />
        <VirtualKey symbol="_" display={`A_${PLACEHOLDER_STRING}`} tooltip="Ctrl+d OR _"  />
        <SymbolVirtualKey symbol="\frac"  className="x-small-text"/>
        <SymbolVirtualKey symbol="\sqrt"  className="small-text"/>
        <VirtualKey symbol="nsqrt" tooltip={getShortcut("nsqrt")} display={MathNodes.getFormula(MathNodes.getNode("nsqrt",false,true))}   className="small-text"/>
        <VirtualKey symbol="\not" display={`\\not ${PLACEHOLDER_STRING}`} tooltip={getShortcut("\\not")}  />
        </div>
      <h3>Styles</h3>
      <div className="key-row">
        {["\\mathbf","\\mathcal","\\mathbb","\\mathfrak","\\mathsf","\\boldsymbol"].map((symbol)=> (
          <SymbolVirtualKey symbol={symbol}  />
        ))}
        <VirtualKey symbol="\text" display="\text{Tt}" tooltip={getShortcut("\\text")}  />
      </div>
    </div>
  );
}

const MultilineCategory =  () => {
  return (
  <div className="wide-category">
    <h3>Multiline environments</h3>
    <div className="key-row">
      {MULTILINES.map((symbol, index) => (
        <VirtualKey symbol={symbol} display={MathNodes.getFormula(MathNodes.getNode(symbol,false,true))} tooltip={getShortcut(symbol)} key={index} className="x-small-text larger-button"/>
      ))}
    </div>
    <div className="key-row">
      <VirtualKey symbol="\hline" display={`-`} tooltip={getShortcut("\\hline")}  />
      <CustomVirtualKey name="array-align-l" display={"| \\! \\leftarrow"} />
      <CustomVirtualKey name="array-align-c" display={"\\rightarrow \\!\\! |\\!\\! \\leftarrow"} />
      <CustomVirtualKey name="array-align-r" display={"\\rightarrow \\! |"} />
    </div>
    <h3>Delimiter size</h3>
    <div className="key-row">
      <CustomVirtualKey name="delimiter-size-auto" display={"\\text{auto}"} />
      <CustomVirtualKey name="delimiter-size-smaller" display={"-"} />
      <CustomVirtualKey name="delimiter-size-bigger" display={"+"} />
    </div>
  </div>);
}

const Category = ({title,symbols,nKeysShown,className,keyClassName}) => {
  const [showAll,setShowAll] = useState(false);

  return (<div className={className}>
    <h3>{title}</h3>
    <div className={"key-row "}>
      {symbols.map((symbol, index) => (
        <SymbolVirtualKey symbol={symbol}  key={index} className={(nKeysShown && index>=nKeysShown && !showAll ?"hidden":"") + " "+keyClassName+(VERY_BIG_SYMBOLS.includes(symbol)?" x-small-text":"")}/>
      ))}
    </div>
    {nKeysShown && <button className="drawer-handle" onMouseDown={(e) => e.preventDefault()} onClick={()=>{setShowAll(!showAll)}}>{showAll?"-":"+"}</button>}
  </div>)
}

const VirtualKey = ({symbol,display,tooltip,className}) => {
    const [editor] = useLexicalComposerContext();
    const tooltipId = symbol.replace(" ","__").replace("\\","--");// Necessary replacement to have a valid (but still unique) id
    return (
        <button onMouseDown={(e) => e.preventDefault()} data-tooltip-id={tooltipId} data-tooltip-content={tooltip} className={className+" key"} onClick={() => editor.dispatchCommand(ADD_MATH_SYMBOL_COMMAND,symbol)}>
                {`$$${display} $$`} 
        </button>
    );
}
//{tooltip && <Tooltip id={tooltipId} />}
const CustomVirtualKey = ({name,display,tooltip,className}) => {
  return (
      <button onMouseDown={(e) => e.preventDefault()} data-tooltip-id={name} data-tooltip-content={tooltip} className={className+" key"} onClick={() => reference.current?.customAction(name)}>
            {`$$${display} $$`} 
      </button>
  );
}//{tooltip && <Tooltip id={name} />}

const SymbolVirtualKey = ({symbol,className}) => {
  const formula = MathNodes.getFormula(MathNodes.getNode(symbol,false,true));
  return (
    <VirtualKey symbol={symbol} display={formula} tooltip={getShortcut(symbol)}  className={className}/>
  );
}