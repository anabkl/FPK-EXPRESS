function debounce(func, wait) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => func(...a), wait); };
}
function fuzzyMatch(q, t) {
  q = q.toLowerCase(); t = t.toLowerCase();
  if (t.includes(q)) return 1;
  let s = 0, qi = 0, ti = 0;
  while (qi < q.length && ti < t.length) {
    if (q[qi] === t[ti]) { s++; qi++; ti++; }
    else if (qi > 0 && t[ti] === q[qi-1]) { s += 0.8; qi++; ti++; }
    else { ti++; }
  }
  if (t.startsWith(q)) s += 0.5;
  return Math.min(s / q.length, 1);
}
module.exports = { debounce, fuzzyMatch };