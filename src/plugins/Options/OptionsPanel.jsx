import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useActiveNode } from "../../utils/lexicalUtils";
import { useDocumentOptions } from "./DocumentOptionsContext";
import { useDisplayOptions } from "../DisplayOptionsContext";
import { useState } from "react";

const OPTIONS_CATEGORY_PER_NODETYPE = {
    paragraph : "paragraphs",
    "numbered-heading":"headings",
}

export function AutoOptionsPanel() { // Automatically chooses the relevant options category to show
    const { activeNode, activeNodeParent } = useActiveNode();
    const [isOpen,setOpen] = useState(true);

    var category = "general";
    let useParentNode = false;
    if (activeNode){
        var nodeType = activeNode.getType();
        if (nodeType==="text"){
            useParentNode = true;
            nodeType = activeNodeParent.getType(); // Go up one node in this case
        }
        if (nodeType in OPTIONS_CATEGORY_PER_NODETYPE){
            category = OPTIONS_CATEGORY_PER_NODETYPE[nodeType];
        }
    }
    return (
        <div className="flex">
        {isOpen && (<div className="side-panel">
            {activeNode && 
            <>
                <h3>Node options ({nodeType})</h3>
                <NodeOptionsPanel node={useParentNode?activeNodeParent:activeNode}/>
            </>}
            <h3>Global options</h3>
            {category!=="general"&&<GlobalOptionsPanel category={category}/>}
            <GlobalOptionsPanel category={"general"}/>
        </div>)}
        <div className="vertical-handle" onClick={()=>{setOpen(!isOpen)}}></div>
        </div>
        
        
    );
}

export function GlobalOptionsPanel({category}) {
    const {documentOptions,setDocumentOptions} = useDocumentOptions();
    const {displayOptions} = useDisplayOptions();

    const setOption = (option,value) => {
        var newOptions = structuredClone(documentOptions);
        if (option.split("-")[1]){ // Suboption
            const [main_option,key] = option.split("-");
            newOptions[category][main_option][key] = value;
        }
        else{
            newOptions[category][option] = value;
        }
        setDocumentOptions(newOptions);
    }

    const handleInputChange = (event,option) => {
        if (!option) option = event.target.name;
        setOption(option,event.target.value);
    }

    const handleCheckboxChange = (event,option) => {
        if (!option) option = event.target.name;
        setOption(option,event.target.checked);
    }

    const handleRangeChange = (event,option) => {
        if (!option) option = event.target.name;
        setOption(option,Number(event.target.value));
    }

    var inner = (<></>);

    switch (category){
        case "general":
            inner =  (
                <>
                    <h4>General options</h4>
                    <div className="form-line">
                        <label htmlFor="fontSize">Font Size: </label>
                        <select 
                            name="fontSize"
                            value={documentOptions.general.fontSize}
                            onChange={handleInputChange}
                        >
                            <option value="10">10pt</option>
                            <option value="11">11pt</option>
                            <option value="12">12pt</option>
                        </select>
                    </div>
                    
                    {displayOptions.realPageWidth && (
                    <>
                        <div className="form-line">
                            <label htmlFor="margins-left">Left margin: </label>
                            <input type="range" name="margins-left" min="0" max="80" step="1" value={documentOptions.general.margins.left}
                                onChange={handleRangeChange}
                            />
                            <span>{documentOptions.general.margins.left} mm</span>
                        </div>

                        <div className="form-line">
                            <label htmlFor="margins-right">Right margin: </label>
                            <input type="range" name="margins-right" min="0" max="80" step="1" value={documentOptions.general.margins.right}
                                onChange={handleRangeChange}
                            />
                            <span>{documentOptions.general.margins.right} mm</span>
                        </div>
                    </>
                    )}
                    
                </>
            );
            break;
        case "paragraphs":
            inner = (
                <>
                <h4>Paragraph options</h4>
                <label htmlFor="indentFirst">
                    <input 
                    type="checkbox"
                    id="indentFirst"
                    name="indentFirst"
                    checked={documentOptions.paragraphs.indentFirst}
                    onChange={handleCheckboxChange}
                    />
                    Indent first paragraph
                </label>
                </>
            );
            break;
        case "headings":
            inner =  (
                <>
                    <h4>Headings options</h4>
                    <div>
                        <h5>Numbering styles</h5>
                        {["Section","Subsection","Subsubsection"].map((name, index) => (
                            <div key={index}>
                                <label htmlFor={`numberingStyles-${index+1}`}>{name}: </label>
                                <select 
                                    name={`numberingStyles-${index+1}`}
                                    value={documentOptions.headings.numberingStyles[index+1]}
                                    onChange={handleInputChange}
                                >
                                    <option value="a">1, 2, 3</option>
                                    <option value="Alph">A, B, C</option>
                                    <option value="alph">a, b, c</option>
                                    <option value="Roman">I, II, III</option>
                                    <option value="roman">i, ii, iii</option>
                                </select>
                            </div>
                        ))}
                    </div>
                    <div className="options-headings-numbering-templates">
                        <h5>Numbering templates</h5>
                        {["Section","Subsection","Subsubsection"].map((name, index) => (
                            <div>
                                <label htmlFor={`numberingTemplates-${index+1}`}>{name}: </label>
                                <input
                                type="text"
                                name={`numberingTemplates-${index+1}`}
                                value={documentOptions.headings.numberingTemplates[index+1]}
                                onChange={handleInputChange}
                                />
                          </div>
                        ))}
                    </div>
                </>
            );
            break;
    }
    return (<div className="options-panel">{inner}</div>);
}



function NodeOptionsPanel({node}) {
    const [editor] = useLexicalComposerContext();

    var inner = (<></>);

    switch (node.getType()){
        case "numbered-heading":
            inner = (
                <>
                <h4>Heading options</h4>
                <label htmlFor="isNumbered">
                    <input 
                    type="checkbox"
                    name="isNumbered"
                    id="isNumbered"
                    onChange={(event) => {
                        editor.update(()=>{
                            node.setIsNumbered(event.target.checked);
                        })
                    }}
                    checked={editor.read(()=>node.isNumbered())}
                    />
                    Include in numbering
                </label>
                </>
            );
            break;
        case "captioned-image":
            inner = (
                <>
                <h4>Figure options</h4>
                <div className="form-line">
                    <label>Relative width: </label>
                    <input type="range" min="1" max="100" step="1" value={parseInt(editor.read(() => node.getWidthString()))}
                        onChange={(e) => {
                        editor.update(()=>{
                            node.setWidthString(e.target.value+"%");
                        })
                    }}
                    />
                    <span>{editor.read(()=>node.getWidthString())}</span>
                </div>
                </>
            );
            break;
    }
    return (<div className="options-panel">{inner}</div>);
}