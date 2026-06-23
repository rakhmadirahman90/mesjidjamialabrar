export const parseNumber = (val: string | number | undefined | null): number => {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  const cleaned = val.replace(/\D/g, '');
  return parseInt(cleaned, 10) || 0;
};
