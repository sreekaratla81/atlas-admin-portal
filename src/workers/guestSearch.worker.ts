/// <reference lib="webworker" />
export type Req = { q: string, data: { id:string; name:string; phone?:string; email?:string; _n:string }[] };
export type Res = { results: Req['data'] };
const normalize = (s:string)=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

self.onmessage = (e:MessageEvent<Req>) => {
  const { q, data } = e.data;
  const s = normalize(q.trim());
  if (s.length < 2) { (self as any).postMessage({ results: [] } as Res); return; }

  const tokens = s.split(/\s+/).filter(Boolean);
  const scored = [];
  for (const g of data) {
    const hay = g._n;
    let score = 0;
    for (const t of tokens) {
      if (!hay.includes(t)) { score = -1; break; }
      if (hay.startsWith(t)) score += 3;
      else if (/\b/.test(hay)) score += 2;
      else score += 1;
      if (g.phone && g.phone.includes(t)) score += 4;
    }
    if (score >= 0) scored.push({ g, score });
  }
  scored.sort((a,b)=>b.score-a.score);
  (self as any).postMessage({ results: scored.slice(0,50).map(x=>x.g) } as Res);
};
export default null as any;
