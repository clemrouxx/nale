import { useActiveNode } from "../../utils/lexicalUtils";
import { useDocumentOptions } from "./DocumentOptionsContext";

const OPTIONS_CATEGORY_PER_NODETYPE = {
    paragraph : "paragraphs",
    "numbered-heading":"headings",
}

export function AutoOptionsPanel() { // Automatically chooses the relevant options category to show
    const { activeNode, activeNodeParent } = useActiveNode();
    var category = "general";
    if (activeNode){
        var nodeType = activeNode.getType();
        if (nodeType==="text") nodeType = activeNodeParent.getType(); // Go up one node in this case
        if (nodeType in OPTIONS_CATEGORY_PER_NODETYPE){
            category = OPTIONS_CATEGORY_PER_NODETYPE[nodeType];
        }
    }
    return (
        <div className="side-panel">
            {nodeType}
            <h3>Global options</h3>
            {category!=="general"&&<OptionsPanel category={category}/>}
            <OptionsPanel category={"general"}/>
        </div>
    );
}

export function OptionsPanel({category}) {
    const {documentOptions,setDocumentOptions} = useDocumentOptions();

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

    var inner = (<></>);

    switch (category){
        case "general":
            inner =  (
                <>
                    <h4>General options</h4>
                    <div>
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