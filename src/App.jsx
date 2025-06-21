import { LexicalComposer } from "@lexical/react/LexicalComposer";
import Editor from "./LexicalEditor";
import { initialConfig } from "./LexicalConfig";
import { DocumentOptionsProvider } from "./plugins/Options/DocumentOptionsContext";
import { ActionBar } from "./ActionBar";
import { DisplayOptionsProvider } from "./plugins/DisplayOptionsContext";
import { DocumentStructureProvider } from "./plugins/NumberingPlugin/DocumentStructureContext";
import { MathJaxContext } from "better-react-mathjax";

function App() {
  return (
    <div className="App">
      <LexicalComposer initialConfig={initialConfig}>
        <DocumentOptionsProvider>
        <DocumentStructureProvider>
        <DisplayOptionsProvider>
        <MathJaxContext>
          <ActionBar/>
          <Editor />
        </MathJaxContext>
        </DisplayOptionsProvider>
        </DocumentStructureProvider>
        </DocumentOptionsProvider>
      </LexicalComposer>
    </div>
  );
}

export default App;
