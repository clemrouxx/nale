import { act } from "react";
import { useActiveNode } from "../../utils/lexicalUtils";
import { useDocumentOptions } from "./DocumentOptionsContext";

const OPTIONS_CATEGORY_PER_NODETYPE = {
    paragraph : "paragraphs",
}

export function AutoOptionsPanel() { // Automatically chooses the relevant options category to show
    const { activeNode, activeNodeParent } = useActiveNode();
    var category = "global";
    if (activeNode){
        var nodeType = activeNode.getType();
        if (nodeType==="text") nodeType = activeNodeParent.getType(); // Go up one node in this case
        if (nodeType in OPTIONS_CATEGORY_PER_NODETYPE){
            category = OPTIONS_CATEGORY_PER_NODETYPE[nodeType];
        }
    }
    return (<OptionsPanel category={category}/>);
}

export function OptionsPanel({category}) {
    const {documentOptions,setDocumentOptions} = useDocumentOptions();

    const setOption = (option,value) => {
        setDocumentOptions({
            ...documentOptions,
            [category]: {
              ...documentOptions[category],
              [option]: value,
            }
        });
    }

    const handleSelectChange = (event,option) => {
        if (!option) option = event.target.name;
        setOption(option,event.target.value);
    }

    const handleCheckboxChange = (event,option) => {
        if (!option) option = event.target.name;
        setOption(option,event.target.checked);
    }

    switch (category){
        case "global":
            return (
                <div>
                  <label htmlFor="fontSize">Font Size: </label>
                  <select 
                    name="fontSize"
                    value={documentOptions.global.fontSize}
                    onChange={handleSelectChange}
                  >
                    <option value="10">10pt</option>
                    <option value="11">11pt</option>
                    <option value="12">12pt</option>
                  </select>
                </div>
            );
        case "paragraphs":
            return (
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
            );
    }
}