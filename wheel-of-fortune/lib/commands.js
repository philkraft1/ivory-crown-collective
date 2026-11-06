const SOLVES = ['/solve', '/aws-networking'];

function normalized(comment) {
  let text = String(comment || '').trim();
  if (text.startsWith('!')) text = `/${text.slice(1)}`;
  return text;
}

export function parseCommand(comment) {
  const text = normalized(comment);
  if (!text) return null;
  const lower = text.toLowerCase();

  if (lower === '/join' || lower.startsWith('/join ')) return { type: 'join' };
  if (lower === '/s' || lower === '/spin' || lower.startsWith('/s ') || lower.startsWith('/spin ')) return { type: 'spin' };

  if (/^\/(?:g|guess)(?:\b|[a-z])/i.test(text)) {
    const exact = text.match(/^\/(?:g|guess)\s*([a-z])$/i);
    if (exact) return { type: 'guess', letter: exact[1].toUpperCase() };
    const last = text.split(/\s+/).at(-1) || '';
    if (/^[a-z]$/i.test(last)) return { type: 'guess', letter: last.toUpperCase() };
    return { type: 'guess', letter: '' };
  }

  if (/^[a-z]$/i.test(text)) return { type: 'guess', letter: text.toUpperCase() };

  const solve = SOLVES.find((command) => lower === command || lower.startsWith(`${command} `) || lower.startsWith(`${command}:`));
  if (solve) {
    const phrase = text.slice(solve.length).replace(/^[\s:.-]+/, '').trim();
    return { type: 'solve', phrase };
  }

  return null;
}
