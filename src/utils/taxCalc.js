export function fmt(n) {
  if (n === undefined || n === null || isNaN(n)) return '0';
  return Math.round(n).toLocaleString('en-IN');
}

export function parse(str) {
  return parseFloat((str || '').replace(/,/g, '')) || 0;
}

export function calcSalaryExemption(gross) {
  return Math.min(gross / 3, 500000);
}

export function calcTax(taxableIncome, taxFreeLimit) {
  if (taxableIncome <= taxFreeLimit) return { grossTax: 0, slabDetails: [] };

  const slabs = [
    { labelKey: 'slabs.first', limit: taxFreeLimit, rate: 0 },
    { labelKey: 'slabs.next3Lakh', limit: 300000, rate: 0.10 },
    { labelKey: 'slabs.next4Lakh', limit: 400000, rate: 0.15 },
    { labelKey: 'slabs.next5Lakh', limit: 500000, rate: 0.20 },
    { labelKey: 'slabs.next20Lakh', limit: 2000000, rate: 0.25 },
    { labelKey: 'slabs.remaining', limit: Infinity, rate: 0.30 },
  ];

  let remaining = taxableIncome;
  let grossTax = 0;
  const slabDetails = [];

  for (const slab of slabs) {
    if (remaining <= 0) break;
    const chargeable = slab.limit === Infinity ? remaining : Math.min(remaining, slab.limit);
    const tax = chargeable * slab.rate;
    slabDetails.push({ labelKey: slab.labelKey, limit: slab.limit, chargeable, rate: slab.rate, tax });
    grossTax += tax;
    remaining -= chargeable;
  }

  return { grossTax, slabDetails };
}

export function calcRebate(taxableIncome, investment) {
  if (!investment || investment <= 0) return 0;
  return Math.min(taxableIncome * 0.03, investment * 0.10, 750000);
}

export function grossFromPeriods(periods) {
  return periods.reduce((sum, p) => {
    const amt = parse(p.amount);
    const months = p.toIdx - p.fromIdx + 1;
    const monthly = p.isMonthly ? amt : amt / 12;
    return sum + monthly * months;
  }, 0);
}

export const DEFAULT_PERIODS = () => [
  { id: 1, fromIdx: 0, toIdx: 5, amount: '', isMonthly: true },
  { id: 2, fromIdx: 6, toIdx: 11, amount: '', isMonthly: true },
];
