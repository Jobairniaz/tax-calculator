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

export function calcTax(taxableIncome, taxFreeLimit, lang) {
  if (taxableIncome <= taxFreeLimit) return { grossTax: 0, slabDetails: [] };

  const slabs = lang === 'bn'
    ? [
        { label: `প্রথম ${fmt(taxFreeLimit)} টাকা`, limit: taxFreeLimit, rate: 0 },
        { label: 'পরবর্তী ৩,০০,০০০ টাকা', limit: 300000, rate: 0.10 },
        { label: 'পরবর্তী ৪,০০,০০০ টাকা', limit: 400000, rate: 0.15 },
        { label: 'পরবর্তী ৫,০০,০০০ টাকা', limit: 500000, rate: 0.20 },
        { label: 'পরবর্তী ২০,০০,০০০ টাকা', limit: 2000000, rate: 0.25 },
        { label: 'অবশিষ্ট অংশ', limit: Infinity, rate: 0.30 },
      ]
    : [
        { label: `First BDT ${fmt(taxFreeLimit)}`, limit: taxFreeLimit, rate: 0 },
        { label: 'Next BDT 3,00,000', limit: 300000, rate: 0.10 },
        { label: 'Next BDT 4,00,000', limit: 400000, rate: 0.15 },
        { label: 'Next BDT 5,00,000', limit: 500000, rate: 0.20 },
        { label: 'Next BDT 20,00,000', limit: 2000000, rate: 0.25 },
        { label: 'Remaining Balance', limit: Infinity, rate: 0.30 },
      ];

  let remaining = taxableIncome;
  let grossTax = 0;
  const slabDetails = [];

  for (const slab of slabs) {
    if (remaining <= 0) break;
    const chargeable = slab.limit === Infinity ? remaining : Math.min(remaining, slab.limit);
    const tax = chargeable * slab.rate;
    slabDetails.push({ label: slab.label, chargeable, rate: slab.rate, tax });
    grossTax += tax;
    remaining -= chargeable;
  }

  return { grossTax, slabDetails };
}

export function calcRebate(taxableIncome, investment) {
  if (!investment || investment <= 0) return 0;
  return Math.min(taxableIncome * 0.03, investment * 0.15, 1000000);
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
