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

## Features
### Priority features
- Title "page" : author affiliations, date
- Tables
- Footnotes
- Working shortcuts and shortcuts indications (ex for section titles)
- Text with links
- Add warning when closing tab without saving
- Math : add [...), (...] and ability to add just the left delimiter alone if wanted.

### Simple tweaks
- Cursor over math elements should be a text cursor
- Math : clicking on the color button while having a selection should change the color of the selection
- Math : using the colored text menu should also work with math
- Consistant color order between toolbar and math keyboard

### Useful features
- Export to PDF through LaTeX compilation
- Support for different languages in code blocks (for syntax highlighting)
- Save/Open just for documentOptions (global styling)
- Paste images
- Custom headings font sizes (like main title)
- Colored text
- Math mode : multi-character selection
- Fast math mode : make it toggleable, and specify shortcuts in the virtual keyboard.
- Math : add up-down navigation in multiline elements
- Ability to make images (not just Figures) behave as a block, and be centered
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
- Page-by-page navigation

### Possible later features
- Cooperation
- Working with bibliography software
- Other document formats (slides,...)

## Other improvements (UI/UX, ...)
- In real width mode, show the edges of the page
- Improve PDF display resolution