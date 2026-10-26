import type { Userscript } from '../types';

export function matchUrl(pattern: string, url: string): boolean {
  if (pattern === '*') return true;
  try {
    const escaped = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*');
    const regex = new RegExp(`^${escaped}$`, 'i');
    return regex.test(url);
  } catch {
    return false;
  }
}

export function executeUserscript(script: Userscript, currentUrl: string = window.location.href): { success: boolean; log: string } {
  if (!script.enabled) {
    return { success: false, log: 'Script is disabled.' };
  }

  const matches = script.match.some(pattern => matchUrl(pattern, currentUrl));
  if (!matches && script.match.length > 0) {
    return { success: false, log: `URL ${currentUrl} does not match script patterns.` };
  }

  try {
    const GM_getValue = (key: string, defaultValue?: any) => {
      try {
        const val = localStorage.getItem(`gm_${script.id}_${key}`);
        return val !== null ? JSON.parse(val) : defaultValue;
      } catch {
        return defaultValue;
      }
    };

    const GM_setValue = (key: string, value: any) => {
      try {
        localStorage.setItem(`gm_${script.id}_${key}`, JSON.stringify(value));
      } catch (e) {
        console.error('GM_setValue error:', e);
      }
    };

    const GM_deleteValue = (key: string) => {
      localStorage.removeItem(`gm_${script.id}_${key}`);
    };

    const GM_notification = (details: { title?: string; text?: string }) => {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(details.title || script.name, { body: details.text });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification(details.title || script.name, { body: details.text });
            }
          });
        }
      }
    };

    const wrappedCode = `
      (function(GM_getValue, GM_setValue, GM_deleteValue, GM_notification) {
        ${script.code}
      })(GM_getValue, GM_setValue, GM_deleteValue, GM_notification);
    `;

    const fn = new Function('GM_getValue', 'GM_setValue', 'GM_deleteValue', 'GM_notification', wrappedCode);
    fn(GM_getValue, GM_setValue, GM_deleteValue, GM_notification);

    return { success: true, log: `Executed successfully at ${new Date().toLocaleTimeString()}` };
  } catch (err: any) {
    return { success: false, log: `Execution error: ${err?.message || err}` };
  }
}
