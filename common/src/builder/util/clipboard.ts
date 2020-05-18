export const jsfClipboardBaseKey = 'jsf.clipboard';

export function jsfClipboardGet(key: string) {
  const sVal = (window as any).localStorage.getItem(`${ jsfClipboardBaseKey }:${ key }`);
  return JSON.parse(sVal).value;
}

export function jsfClipboardKeys(): string[] {
  const out = [];
  for (let i = 0, len = (window as any).localStorage.length; i < len; ++i) {
    const key = (window as any).localStorage.key(i);
    if (key.startsWith(jsfClipboardBaseKey + ':')) {
      out.push(key.substring((jsfClipboardBaseKey + ':').length));
    }
  }
  return out;
}

export function jsfClipboardClearAll() {
  jsfClipboardKeys().forEach(x => jsfClipboardClear(x));
}

export function jsfClipboardClear(key: string) {
  (window as any).localStorage.removeItem(`${ jsfClipboardBaseKey }:${ key }`);
}

export function jsfClipboardClearMany(keys: string[]) {
  for (const key of keys) {
    jsfClipboardClear(key);
  }
}
