import { LexicalComposer } from "@lexical/react/LexicalComposer";
import Editor from "./LexicalEditor";
import { initialConfig } from "./LexicalConfig";
import { DocumentOptionsProvider } from "./plugins/Options/DocumentOptionsContext";
import { ActionBar } from "./ActionBar";
import { DisplayOptionsProvider } from "./plugins/DisplayOptionsContext";

function App() {
  return (
    <div className="App">
      <LexicalComposer initialConfig={initialConfig}>
        <DocumentOptionsProvider>
        <DisplayOptionsProvider>
          <ActionBar/>
          <Editor />
        </DisplayOptionsProvider>
        </DocumentOptionsProvider>
      </LexicalComposer>
    </div>
  );
}

export default App;
