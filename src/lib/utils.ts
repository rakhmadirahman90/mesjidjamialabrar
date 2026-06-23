export const parseNumber = (val: string | number): number => {
  if (typeof val === 'number') return val;
  const cleaned = val.replace(/\D/g, '');
  return parseInt(cleaned, 10) || 0;
};
