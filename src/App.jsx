import { LexicalComposer } from "@lexical/react/LexicalComposer";
import Editor from "./LexicalEditor";
import { initialConfig } from "./LexicalConfig";
import { DocumentOptionsProvider } from "./plugins/Options/DocumentOptionsContext";
import { ActionBar } from "./ActionBar";
import { EditorOptionsProvider } from "./plugins/EditorOptionsContext";
import { DocumentStructureProvider } from "./plugins/NumberingPlugin/DocumentStructureContext";
import { MathJaxContext } from "better-react-mathjax";
import { SaveProvider } from "./plugins/SaveLoadPlugin";
import { StatusProvider } from "./ui/StatusBar";

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
        <StatusProvider>
        <DocumentOptionsProvider>
        <DocumentStructureProvider>
        <EditorOptionsProvider>
        <SaveProvider>
        <MathJaxContext config={mathJaxConfig}>
          <ActionBar/>
          <Editor />
        </MathJaxContext>
        </SaveProvider>
        </EditorOptionsProvider>
        </DocumentStructureProvider>
        </DocumentOptionsProvider>
        </StatusProvider>
      </LexicalComposer>
    </div>
  );
}

export default App;
