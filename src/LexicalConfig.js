import theme from './LexicalTheme';
import {HeadingNode, QuoteNode} from '@lexical/rich-text';
import {ListNode, ListItemNode} from '@lexical/list';
import {CodeNode} from '@lexical/code';
import {LinkNode} from '@lexical/link';
import {HorizontalRuleNode} from '@lexical/react/LexicalHorizontalRuleNode';
import { LatexNode } from "./plugins/LatexExportPlugin/LatexNode";
import { ReferenceNode } from './nodes/ReferenceNode';
import { CitationNode } from './nodes/CitationNode';
import { BibliographyNode } from './nodes/BibliographyNode';
import { CaptionedImageNode, SimpleImageNode } from './nodes/ImageNodes';
import { FigureNode } from './nodes/FigureNode';
import { CaptionNode } from './nodes/CaptionNode';
import { NumberedHeadingNode } from './nodes/NumberedHeadingNode';
import { MathNode } from './nodes/MathNode';
import { TitleNode } from './nodes/TitleNode';
import { AbstractNode } from './nodes/AbstractNode';
import { AuthorListNode, AuthorNode } from './nodes/AuthorNodes';
import { AffiliationListNode, AffiliationNode } from './nodes/AffiliationNodes';
import { PageBreakNode } from './nodes/PageBreakNode';
import { TableOfContentsNode } from './nodes/TableOfContentsNode';
import { SkipNode } from './nodes/SkipNode';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { TableFloatNode } from './nodes/TableFloatNode';
import { TablePlusNode } from './nodes/TablePlusNode';
import { FootnoteNode } from './nodes/FootnoteNode';

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
        CodeNode,
        LinkNode,
        LatexNode,
        NumberedHeadingNode,
        ReferenceNode,
        CitationNode,
        BibliographyNode,
        SimpleImageNode,
        FigureNode,
        CaptionNode,
        CaptionedImageNode,
        MathNode,
        TitleNode,
        AbstractNode,
        AuthorNode,
        AuthorListNode,
        AffiliationNode,
        AffiliationListNode,
        PageBreakNode,
        SkipNode,
        TableOfContentsNode,
        TablePlusNode,
        TableNode,
        TableCellNode,
        TableRowNode,
        TableFloatNode,
        FootnoteNode
    ],
};