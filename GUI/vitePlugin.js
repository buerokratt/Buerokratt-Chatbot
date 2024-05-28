
export function removeHiddenMenuItems(str) {
  const badJson = str.replace('export default [', '[').replace('];', ']');
  const correctJson = badJson.replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/g, '"$2": ');
  const json = removeHidden(JSON.parse(correctJson));
  const updatedJson = JSON.stringify(json);

  return 'export default ' + updatedJson + ';'
}

function removeHidden(menuItems) {
  if(!menuItems) return menuItems;
  const arr = menuItems?.filter(x => !x.hidden);
  for (const a of arr) {
    a.children = removeHidden(a.children);
  }
  return arr;
}
