import { LexicalComposer } from "@lexical/react/LexicalComposer";
import Editor from "./LexicalEditor";
import theme from './LexicalTheme';
import {HeadingNode, QuoteNode} from '@lexical/rich-text';
import {ListNode, ListItemNode} from '@lexical/list';
import {CodeNode} from '@lexical/code';
import {LinkNode} from '@lexical/link';
import {HorizontalRuleNode} from '@lexical/react/LexicalHorizontalRuleNode';

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error) {
  console.error(error);
}


function App() {
  const initialConfig = {
      namespace: 'MyEditor',
      theme,
      onError,
      nodes: [
        HeadingNode,
        QuoteNode,
        ListNode,
        ListItemNode,
        HorizontalRuleNode,
        CodeNode,
        LinkNode,
      ],
    };

  return (
    <div className="App">
      <h1>My Lexical Editor</h1>
      <LexicalComposer initialConfig={initialConfig}>
        <Editor />
      </LexicalComposer>
    </div>
  );
}

export default App;
