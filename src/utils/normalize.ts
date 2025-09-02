export const normalize = (s: string) => s?.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
