
import { DecoratorNode } from 'lexical';
import { SelectableComponent } from '../plugins/SelectableComponent';
import PageAnchor from '../ui/PageAnchor';

export class PageBreakNode extends DecoratorNode {
  static getType() {return 'pagebreak'}

  constructor(pageNumber,key) {
      super(key);
      this.__page_number = pageNumber ?? null;
  }

  static clone(node) {
    return new PageBreakNode(node.__page_number,node.__key);
  }

  __setPageNumber(pageNumber){ this.getWritable().__page_number = pageNumber }
  updatePageNumber(pageNumber){
    if (pageNumber !== this.__page_number) this.__setPageNumber(pageNumber);
  }

  createDOM() {
    const div = document.createElement('div');
    div.className = "editor-pagebreak";
    return div;
  }

  updateDOM() {
    return false;
  }

  decorate() {
    return (
      <>
        <SelectableComponent nodeKey={this.__key}></SelectableComponent>
        <PageAnchor pageNumber={this.__page_number}/>
      </>
    );
  }

  isInline() {
    return false;
  }

  isKeyboardSelectable() {
    return true;
  }

  toLatex() {return "\n\\newpage\n" }

  static importJSON(serializedNode) {
    return new PageBreakNode(serializedNode.__page_number);
  }
}

export function $createPageBreakNode(){
  return new PageBreakNode(null);
}
