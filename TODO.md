# TODO list
## Bugs
- When adding a PDF image, it is mirrored about 20% of the time.
- Special characters from .bib files (like "{\'e}") are not taken into account. The parsing function is to be modified.
- When opening a file, the heading numberings don't appear correctly until the user clicks on the editor.
- Pressing Enter when at the end of a math node itself at the end of a bullet list item doesn't work as expected.
- Paragraph indentation seems to behave in LaTeX not as implemented in NaLE when the paragraphds are not in a section
- Math-latex : The "cases" environment in latex only supports one "&" per line (i.e. only two columns). This is not implemented, leading to faulty latex export.
- Arrays lead faulty latex export due to lack of aligment parameters
- Math : in inline math mode, the elements on fractions apppear to be left-aligned instead of centered.
- Math : Adding \hline does not work, or leads to math display error
- Math : Color does not work as expected in multiple ways (with cursor deletion, with selection)
- Latex export : \bigskip not working as expected
- Latex export : leading space of colored text not always respected. (change for "\ " ?)
- Text both italic and bold only appears as bold.
- Math : can't use 2 (different) underscripts in a row, throws MathJax error.
- Compilation : Empty (default) files fail to compile.
- Page title : Authors can be wrongly added above a preexisting abstract
- Display : size of images in Figures is not calculated correctly.
- Tables : prevent deleting last row or column. (or maybe it should delete the float ?)
- Tables : Make the cell selection visible.

## Features
### Priority features
- Title "page" : author affiliations, date
- Tables
- Footnotes
- Text with links
- Add warning when closing tab without saving
- Math : add [...), (...] and ability to add just the left delimiter alone if wanted.
- Ability to make images (not just Figures) behave as a block, and be centered
- Tables : internal references, export...

### Simple tweaks
- Math : using the colored text menu should also work with math
- Consistant color order between toolbar and math keyboard
- Title page : Authors node should be selectable.
- Editor : the editor should remember the user preferences for the math keyboard (visible by default or not)

### Useful features
- Show "Saving..." while saving. (via some sort of status bar probably; useful for compilation as well)
- Support for different languages in code blocks (for syntax highlighting)
- Save/Open just for documentOptions (global styling)
- Custom headings font sizes (like main title)
- Math mode : multi-character selection
- Fast math mode : make it toggleable, and specify shortcuts in the virtual keyboard.
- Math : add up-down navigation in multiline elements
- Add multiline enumerations
- Math-latex : add some line breaks when logical

### Minor features
- Other bibliographic styles
- Custom style for the bibliography title (replace "References" with a horizontal separator for example)
- Choice for another font
- Other citation styles (ex : superscript)
- Drag-and-drop Figures or equations for quick references
- Latex export : maybe do not add unused labels
- Math-latex : unseless spaces (especially at the edges of the math expression)

### Possible later features
- Cooperation
- Working with bibliography software
- Other document formats (slides,...)

## Other improvements (UI/UX, ...)
- In real width mode, show the edges of the page
- Improve PDF display resolution