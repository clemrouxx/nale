import { LexicalComposer } from "@lexical/react/LexicalComposer";
import Editor from "./LexicalEditor";
import { initialConfig } from "./LexicalConfig";
import { DocumentOptionsProvider } from "./plugins/Options/DocumentOptionsContext";
import { ActionBar } from "./ActionBar";
import { DisplayOptionsProvider } from "./plugins/DisplayOptionsContext";
import { DocumentStructureProvider } from "./plugins/NumberingPlugin/DocumentStructureContext";
import { MathJaxContext } from "better-react-mathjax";
import { SaveProvider } from "./plugins/SaveLoadPlugin";

const mathJaxConfig = {
  loader: { load: ["[tex]/html","[tex]/ams","[tex]/physics",'[tex]/boldsymbol'] },
  tex: {
    packages: { 
      "[+]": ["html","ams","physics","boldsymbol"] 
    },
    inlineMath: [
      ["$", "$"],
    ],
    displayMath: [
      ["$$", "$$"],
    ],
  },
  options: {
    enableMenu : false,
  },
};

function App() {
  return (
    <div className="App">
      <LexicalComposer initialConfig={initialConfig}>
        <DocumentOptionsProvider>
        <DocumentStructureProvider>
        <DisplayOptionsProvider>
        <SaveProvider>
        <MathJaxContext config={mathJaxConfig}>
          <ActionBar/>
          <Editor />
        </MathJaxContext>
        </SaveProvider>
        </DisplayOptionsProvider>
        </DocumentStructureProvider>
        </DocumentOptionsProvider>
      </LexicalComposer>
    </div>
  );
}

export default App;
