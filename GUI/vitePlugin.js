export function removeHiddenMenuItems(str) {
  const badJson = str.replace('export default [', '[').replace('];', ']');
  const correctJson = badJson.replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/g, '"$2": ');

 const isHiddenFeaturesEnabled = 
    process.env.REACT_APP_ENABLE_HIDDEN_FEATURES?.toLowerCase().trim() == 'true' ||
    process.env.REACT_APP_ENABLE_HIDDEN_FEATURES?.toLowerCase().trim() == '1';

  const json = removeHidden(JSON.parse(correctJson), isHiddenFeaturesEnabled);
  
  const updatedJson = JSON.stringify(json);

  return 'export default ' + updatedJson + ';'
}

function removeHidden(menuItems, isHiddenFeaturesEnabled) {
  if(!menuItems) return menuItems;
  const arr = menuItems
    ?.filter(x => !x.hidden)
    ?.filter(x => isHiddenFeaturesEnabled || x.hiddenMode !== "production");
  for (const a of arr) {
    a.children = removeHidden(a.children, isHiddenFeaturesEnabled);
  }
  return arr;
}
