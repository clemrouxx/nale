import { 
    TableNode,
  $createTableCellNode, 
  $createTableRowNode
} from '@lexical/table';

export class TablePlusNode extends TableNode {
  __columnAlignments;

  constructor(key) {
    super(key);
    this.__columnAlignments = {};
  }

  static getType() {
    return 'table-plus';
  }

  static clone(node) {
    const newNode = new TablePlusNode(node.__key);
    newNode.__columnAlignments = { ...node.__columnAlignments };
    return newNode;
  }

  getColumnAlignment(columnIndex) {
    const self = this.getLatest();
    return self.__columnAlignments[columnIndex] || 'left';
  }

  setColumnAlignment(columnIndex, alignment) {
    const self = this.getWritable();
    self.__columnAlignments[columnIndex] = alignment;
  }

  getColumnCount() {
    const self = this.getLatest();
    const firstRow = self.getFirstChild(); // Get first TableRowNode
    
    if (!firstRow) {
      return 0;
    }
    
    return firstRow.getChildrenSize(); // Number of cells in first row
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      columnAlignments: this.__columnAlignments,
      type: 'table-plus',
      version: 1,
    };
  }

  static importJSON(serializedNode) {
    const node = $createTablePlusNode();
    node.__columnAlignments = serializedNode.columnAlignments || {};
    return node;
  }

  toLatex(childrenstring){
    return `  \\begin{tabular}{|${'l|'.repeat(this.getColumnCount())}}
    ${childrenstring}
    \\end{tablular}
    `
  }
}

export function $createTablePlusNode(){
    return new TablePlusNode();
}

export function $createTablePlusNodeWithDimensions(rowCount,columnCount) {
  const tableNode = $createTablePlusNode();
  for (let iRow = 0; iRow < rowCount; iRow++) {
    const tableRowNode = $createTableRowNode();

    for (let iColumn = 0; iColumn < columnCount; iColumn++) {
      const tableCellNode = $createTableCellNode(false);
      tableRowNode.append(tableCellNode);
    }
    tableNode.append(tableRowNode);
  }
  return tableNode;
}