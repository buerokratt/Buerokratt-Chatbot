export function stringToList(str, block) {
  var out = "";
  if (!str) return "";
  const parts = str.split(",");
  parts.map(function (prop, i) {
    out += block.fn({ value: `"${prop}"${i < parts.length - 1 ? "," : ""}` });
  });
  return out;
}

export function getInstant() {
  return new Date().toISOString();
}

export function lookup(configurationArray, key) {
  for (let i = 0; i < configurationArray.length; i++) {
    if (configurationArray[i].key === key) {
      return configurationArray[i].value;
    }
  }
  return "";
}
