export function areIdentical(obj1,obj2){
    return JSON.stringify(obj1) === JSON.stringify(obj2);
}

const dynamicStylesMap = new Map();

export function setGlobalCSSRule(selector, rule) {
  let styleSheet = document.getElementById('dynamic-styles');

  if (!styleSheet) {
    const style = document.createElement('style');
    style.id = 'dynamic-styles';
    document.head.appendChild(style);
    styleSheet = style.sheet;
  } else {
    styleSheet = document.getElementById('dynamic-styles').sheet;
  }

  const index = dynamicStylesMap.get(selector);

  if (index !== undefined) {
    // Update existing rule
    styleSheet.deleteRule(index);
    styleSheet.insertRule(`${selector} { ${rule} }`, index);
  } else {
    // Add new rule
    const newIndex = styleSheet.cssRules.length;
    styleSheet.insertRule(`${selector} { ${rule} }`, newIndex);
    dynamicStylesMap.set(selector, newIndex);
  }
}
