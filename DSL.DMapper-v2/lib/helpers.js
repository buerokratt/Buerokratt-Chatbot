export function stringToList(str, block) {
  var out = "";
  if (!str) return "";
  const parts = str.split(",");
  parts.map(function (prop, i) {
    out += block.fn({ value: `"${prop}"${i < parts.length - 1 ? "," : ""}` });
  });
  return out;
}
