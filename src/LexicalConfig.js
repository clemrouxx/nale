import theme from './LexicalTheme';
import {HeadingNode, QuoteNode} from '@lexical/rich-text';
import {ListNode, ListItemNode} from '@lexical/list';
import {CodeNode} from '@lexical/code';
import {LinkNode} from '@lexical/link';
import {HorizontalRuleNode} from '@lexical/react/LexicalHorizontalRuleNode';
import { LatexNode } from "./plugins/LatexExportPlugin/LatexNode";
import { NumberedHeadingNode } from "./plugins/NumberedHeadingPlugin/NumberedHeadingNode";

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error) {
    console.error(error);
}

export const initialConfig = {
    namespace: 'nale',
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
        LatexNode,
        NumberedHeadingNode,
    ],
};