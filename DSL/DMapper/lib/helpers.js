export function stringToList(str, block) {
  let out = "";
  if (!str) return "";
  const parts = str.split(",");
  parts.map(function (prop, i) {
    out += block.fn({ value: `"${prop}"${i < parts.length - 1 ? "," : ""}` });
  });
  return out;
}

export function getUuid() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

export function lookupConfigs(configurationArray, key) {
  for (const element of configurationArray) {
    if (element.key === key) {
      return element.value;
    }
  }
  return "";
}

export function extractServiceTriggerName(msg) {
  return msg.split(';')[0].replace('#', '').trim();
}

export function extractServiceTriggerParams(msg) {
  if(msg.endsWith(';'))
    msg = msg.substr(0, msg.length - 1);
  return msg.split(';').splice(1).map(p => p.trim());
}
