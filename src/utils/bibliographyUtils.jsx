import { insertCitation } from "../nodes/CitationNode";

/**
 * Parse BibTeX string into an array of structured objects
 * @param {string} bibContent - The content of a .bib file as a string
 * @returns {Array} Array of objects representing bibliography entries
 */
function parseBibTeX(bibContent) {
    const entries = [];
    
    // Regular expression to identify each BibTeX entry
    // This matches from @ to the next @ or end of string
    const entryRegex = /@([^@]+)/g;
    
    // Match all entries in the BibTeX content
    let entryMatch;
    while ((entryMatch = entryRegex.exec(bibContent))) {
        const entryContent = entryMatch[1].trim();
        
        // Extract entry type and citation key
        const typeKeyMatch = entryContent.match(/^(\w+)\s*{\s*([^,]+),/);
        
        if (!typeKeyMatch) continue; // Skip if not properly formatted
        
        const entryType = typeKeyMatch[1];
        const key = typeKeyMatch[2].trim();
        
        // Create the basic entry object
        const entry = {
            entryType,
            key,
        };
        
        // Extract the content inside the curly braces
        const contentStart = entryContent.indexOf('{') + 1;
        const content = entryContent.substring(contentStart, entryContent.lastIndexOf('}'));
        
        // Parse fields within the entry
        let fieldContent = content.substring(content.indexOf(',') + 1).trim();
        
        // Regular expression to match fields (handle = or spaces)
        const fieldRegex = /(\w+)\s*=\s*[{"]([^}"]*)["}\s]*,?/g;
        
        let fieldMatch;
        while ((fieldMatch = fieldRegex.exec(fieldContent))) {
            const fieldName = fieldMatch[1].toLowerCase().trim();
            const fieldValue = fieldMatch[2].trim();
            // Special handling for author field
            if (fieldName === 'author') {
                entry[fieldName] = parseAuthors(fieldValue);
            } else {
                entry[fieldName] = fieldValue;
            }
        }
        
        entries.push(entry);
    }
    
    return entries;
}


/**
 * Parse author string into an array of structured author objects
 * @param {string} authorString - BibTeX author string (e.g., "Smith, John and Doe, Jane")
 * @returns {Array} Array of author objects with firstName, lastName properties
 */
function parseAuthors(authorString) {
    // Split by "and" to get individual authors
    const authors = authorString.split(/\s+and\s+/);
    
    return authors.map(author => {
        // Handle comma format: "LastName, FirstName"
        if (author.includes(',')) {
            const [lastName, firstName] = author.split(',').map(part => part.trim());
            return { lastName, firstName };
        } 
        // Handle FirstName LastName format
        else {
            const parts = author.trim().split(/\s+/);
            if (parts.length === 1) {
                return { lastName: parts[0], firstName: '' };
            } else {
                const lastName = parts.pop();
                const firstName = parts.join(' ');
                return { firstName, lastName };
            }
        }
    });
}

export async function addBiblioFromClipboard(editor,biblio,setBiblio){
    const clipboardText = await navigator.clipboard.readText();
    if (clipboardText) {
      const parsedEntries = parseBibTeX(clipboardText);
      //console.log(parsedEntries);
      setBiblio(biblio.concat(parsedEntries));
      if (parsedEntries.length===1){
        insertCitation(editor,parsedEntries[0].key);
      }
    }
}

/**
 * Format bibliography item for UI as authors (last names only) and title
 * @param {Object} bibItem - Bibliography item from parseBibTeX function
 * @returns {string} Formatted string with authors and title
 */
export function bibItemToUIString(bibItem) {
    // Handle missing author or title
    if (!bibItem.author || !bibItem.title) {
      return bibItem.key;
    }
    
    // Extract last names from author array
    const lastNames = bibItem.author.map(author => author.lastName).join(', ');
    
    // Format the output
    return `${lastNames}, "${bibItem.title}"`;
}

export function bibItemToHTML(bibItem) {
    //console.log(bibItem);

    // Handle invalid/incomplete entries
    if (!bibItem || !bibItem.author || !bibItem.title) {
      return <span className="citation-error">Incomplete citation data</span>;
    }
    
    // Format authors: Last, F.M., Last, F.M., & Last, F.M.
    const formattedAuthors = bibItem.author.map((author, index) => {
      const lastName = author.lastName || '';
      // Format first name as initials
      const firstInitials = author.firstName
        ? author.firstName
            .split(' ')
            .map(name => `${name.charAt(0)}.`)
            .join('')
        : '';
        
      return `${lastName}${firstInitials ? ', ' + firstInitials : ''}`;
    }).join(', ');
    
    // Add "and" before the last author if there are multiple authors
    const authorText = bibItem.author.length > 1 
      ? formattedAuthors.replace(/,([^,]*)$/, ', &$1')
      : formattedAuthors;
    
    // Format year
    const year = bibItem.year ? `(${bibItem.year})` : '';
    
    // Format title
    const title = bibItem.title ? bibItem.title : '';
    
    // Format journal name in italics
    const journal = bibItem.journal 
      ? <em>{bibItem.journal}</em>
      : null;
    
    // Format volume/issue
    const volume = bibItem.volume 
      ? <strong>{bibItem.volume}</strong>
      : null;
    
    const issue = bibItem.issue || bibItem.number
      ? `(${bibItem.issue || bibItem.number})`
      : null;
    
    // Format pages
    const pages = bibItem.pages
      ? `${bibItem.pages.replace('--', '–')}`
      : null;
    
    // Format DOI
    const doi = bibItem.doi
      ? <a href={`https://doi.org/${bibItem.doi}`} className="citation-doi">https://doi.org/{bibItem.doi}</a>
      : null;
    
    // Assemble the citation
    return (
      <div className="citation">
        <span className="citation-authors">{authorText}</span>{' '}
        <span className="citation-year">{year}</span>.{' '}
        <span className="citation-title">{title}</span>.{' '}
        {journal && <span className="citation-journal">{journal}</span>}
        {(volume || issue) && <span className="citation-volume">{volume}{issue}</span>}
        {pages && <span className="citation-pages">, {pages}</span>}
        {(journal || volume || issue || pages) && '.'}
        {doi && <span className="citation-doi">, {doi}</span>}
      </div>
    );
}

export function jsonToBib(jsonArray) {
  return jsonArray.map(entry => {
    const key = entry.key;
    const authors = entry.author
      .map(a => `${a.firstName} ${a.lastName}`)
      .join(" and ");

    // Build fields string dynamically excluding `key` and `author`
    const fields = Object.entries(entry)
      .filter(([k]) => k !== "key" && k !== "author")
      .map(([k, v]) => `  ${k} = {${v}}`)
      .join(",\n");

    return `@article{${key},
  author = {${authors}},
${fields}
}`;
  }).join('\n\n');
}