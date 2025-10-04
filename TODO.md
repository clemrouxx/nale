# TODO list
## Bugs
- When adding a PDF image, it is mirrored about 20% of the time.
- Special characters from .bib files (like "{\'e}") are not taken into account. The parsing function is to be modified.
- When opening a file, the heading numberings don't appear correctly until the user clicks on the editor.
- Pressing Enter when at the end of a math node itself at the end of a bullet list item doesn't work as expected.
- Paragraph indentation seems to behave in LaTeX not as implemented in NaLE when the paragraphs are not in a section

## Features
### Priority features
- Title "page" : author affiliations, date
- Tables
- Footnotes
- Working shortcuts and shortcuts indications (ex for section titles)

### Simple tweaks
- Cursor over math elements should be a text cursor
- Change shortcuts for subscript and superscript to Ctrl+D and U

### Useful features
- Export to PDF through LaTeX compilation
- Support for different languages in code blocks (for syntax highlighting)
- Save/Open just for documentOptions (global styling)
- Paste images
- Custom headings font sizes (like main title)
- Colored text
- Colored terms in equations
- Math mode : multi-character selection
- Fast math mode : make it toggleable, and specify shortcuts in the virtual keyboard.

### Minor features
- Other bibliographic styles
- Custom style for the bibliography title (replace "References" with a horizontal separator for example)
- Choice for another font
- Other citation styles (ex : superscript)
- Drag-and-drop Figures or equations for quick references

### Possible later features
- Cooperation
- Working with bibliography software
- Other document formats (slides,...)

## Other improvements (UI/UX, ...)
- In real width mode, show the edges of the page
- Make scrollbar for the editing area look better (ex white bg)
- Make the options panel more understandable