import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Switch,
  Platform,
  StatusBar,
} from 'react-native';

// ─── Constants ────────────────────────────────────────────────────────────────

const GREEN = '#006A4E';
const GREEN_LIGHT = '#e6f4ef';
const GOLD = '#F42A41';
const MINIMUM_TAX = 5000;

const TAX_FREE_LIMITS = {
  general: 375000,
  women_senior: 425000,
  challenged_third: 500000,
  freedom_fighter: 525000,
};

// ─── Translations ─────────────────────────────────────────────────────────────

const T = {
  en: {
    appTitle: 'BD Income Tax Calculator',
    langBtn: 'বাংলা',
    incomeDetails: 'Income Details',
    annual: 'Annual',
    monthly: 'Monthly',
    byPeriod: 'By Period',
    salariedIncome: 'Salaried Income',
    salariedHint: 'Exemption = lower of (1/3 of annual gross) or BDT 5,00,000',
    annualGross: 'Annual Gross Salary (BDT)',
    monthlyGross: 'Monthly Gross Salary (BDT)',
    annualPlaceholder: 'e.g. 1,200,000',
    monthlyPlaceholder: 'e.g. 100,000',
    annualEquiv: (v) => `Annual equivalent: BDT ${v}`,
    periodHint: 'Split FY 2025–26 (Jul 2025 – Jun 2026) into salary periods',
    addPeriod: '+ Add Period',
    calcAnnualGross: 'Calculated Annual Gross',
    annualBonuses: 'Annual Bonuses — optional',
    perfBonus: 'Performance Bonus (BDT)',
    festBonus: 'Festival Bonus (BDT)',
    bonusPlaceholder50: 'e.g. 50,000',
    bonusPlaceholder100: 'e.g. 100,000',
    totalBonuses: 'Total Bonuses',
    deductions: 'Deductions & Credits',
    investment: 'Eligible Investment (BDT) — optional',
    ait: 'Advance Income Tax / TDS Paid (BDT) — optional',
    investPlaceholder: 'e.g. 100,000',
    aitPlaceholder: 'e.g. 20,000',
    taxpayerCat: 'Taxpayer Category',
    disabledDependent: 'Parent/Guardian of Disabled Person',
    disabledHint: '+BDT 50,000 additional tax-free limit',
    calcBtn: 'Calculate Tax',
    resetBtn: 'Reset',
    errorMsg: 'Please enter a valid salary amount.',
    resultTitle: 'Tax Calculation Summary',
    grossAnnual: 'Gross Annual Salary',
    perfBonusRow: '  · Performance Bonus',
    festBonusRow: '  · Festival Bonus',
    salaryExemption: 'Salary Exemption',
    taxableIncome: 'Taxable Income',
    taxFreeLimit: 'Tax-Free Limit',
    slabHeader: 'Progressive Tax Breakdown',
    grossTax: 'Gross Tax Payable',
    rebate: 'Investment Tax Rebate',
    taxAfterRebate: 'Tax After Rebate',
    minTax: (v, applied) => `Minimum tax applicable: BDT ${v}${applied ? '  ← applied' : ''}`,
    aitPaid: 'AIT / TDS Already Paid',
    netTax: 'Net Tax Payable',
    refundHint: (v) => `* AIT/TDS exceeds liability — possible refund of BDT ${v}.`,
    footer: 'For reference only. Consult the NBR or a tax professional for official advice.',
    currency: (v) => `BDT ${v}`,
    deductCurrency: (v) => `− BDT ${v}`,
    slabTax: (v) => `Tax: BDT ${v}`,
    subtotal: (v) => `Subtotal for this period: BDT ${v}`,
    periodLabel: (n) => `Period ${n}`,
    months: (n) => `${n} mo`,
    from: 'FROM',
    to: 'TO',
    perMonth: '/mo',
    perYear: '/yr',
    salaryAmountPlaceholder: 'Salary amount (BDT)',
    freeUpTo: (v) => `Free up to BDT ${v}`,
    categories: [
      { key: 'general', label: 'General (Male < 65)' },
      { key: 'women_senior', label: 'Women / Senior (65+)' },
      { key: 'challenged_third', label: 'Physically Challenged / Third Gender' },
      { key: 'freedom_fighter', label: 'Gazetted Freedom Fighter' },
    ],
    fyMonths: [
      'Jul 2025', 'Aug 2025', 'Sep 2025', 'Oct 2025', 'Nov 2025', 'Dec 2025',
      'Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026',
    ],
  },
  bn: {
    appTitle: 'বাংলাদেশ আয়কর ক্যালকুলেটর',
    langBtn: 'English',
    incomeDetails: 'আয়ের বিবরণ',
    annual: 'বার্ষিক',
    monthly: 'মাসিক',
    byPeriod: 'মেয়াদ অনুযায়ী',
    salariedIncome: 'বেতনভোগী আয়',
    salariedHint: 'ছাড় = বার্ষিক মোট বেতনের ১/৩ বা ৫,০০,০০০ টাকা — যেটি কম',
    annualGross: 'বার্ষিক মোট বেতন (টাকা)',
    monthlyGross: 'মাসিক মোট বেতন (টাকা)',
    annualPlaceholder: 'যেমন: ১২,০০,০০০',
    monthlyPlaceholder: 'যেমন: ১,০০,০০০',
    annualEquiv: (v) => `বার্ষিক সমতুল্য: ${v} টাকা`,
    periodHint: 'অর্থবছর ২০২৫-২৬ (জুলাই ২০২৫ – জুন ২০২৬) কে বেতন মেয়াদে ভাগ করুন',
    addPeriod: '+ মেয়াদ যোগ করুন',
    calcAnnualGross: 'গণনাকৃত বার্ষিক মোট বেতন',
    annualBonuses: 'বার্ষিক বোনাস — ঐচ্ছিক',
    perfBonus: 'পারফরম্যান্স বোনাস (টাকা)',
    festBonus: 'উৎসব বোনাস (টাকা)',
    bonusPlaceholder50: 'যেমন: ৫০,০০০',
    bonusPlaceholder100: 'যেমন: ১,০০,০০০',
    totalBonuses: 'মোট বোনাস',
    deductions: 'ছাড় ও কর্তন',
    investment: 'যোগ্য বিনিয়োগ (টাকা) — ঐচ্ছিক',
    ait: 'অগ্রিম আয়কর / উৎসে কর্তিত কর (টাকা) — ঐচ্ছিক',
    investPlaceholder: 'যেমন: ১,০০,০০০',
    aitPlaceholder: 'যেমন: ২০,০০০',
    taxpayerCat: 'করদাতার শ্রেণী',
    disabledDependent: 'প্রতিবন্ধী ব্যক্তির পিতামাতা/অভিভাবক',
    disabledHint: '+৫০,০০০ টাকা অতিরিক্ত করমুক্ত সীমা',
    calcBtn: 'কর হিসাব করুন',
    resetBtn: 'পুনরায় শুরু করুন',
    errorMsg: 'অনুগ্রহ করে সঠিক বেতনের পরিমাণ লিখুন।',
    resultTitle: 'কর গণনার সারসংক্ষেপ',
    grossAnnual: 'মোট বার্ষিক বেতন',
    perfBonusRow: '  · পারফরম্যান্স বোনাস',
    festBonusRow: '  · উৎসব বোনাস',
    salaryExemption: 'বেতন ছাড়',
    taxableIncome: 'করযোগ্য আয়',
    taxFreeLimit: 'করমুক্ত সীমা',
    slabHeader: 'ধাপভিত্তিক কর বিভাজন',
    grossTax: 'মোট প্রদেয় কর',
    rebate: 'বিনিয়োগ কর রেয়াত',
    taxAfterRebate: 'রেয়াতের পরে কর',
    minTax: (v, applied) => `ন্যূনতম কর প্রযোজ্য: ${v} টাকা${applied ? '  ← প্রযোজ্য হয়েছে' : ''}`,
    aitPaid: 'পূর্বে পরিশোধিত অগ্রিম/উৎসে কর',
    netTax: 'নিট প্রদেয় কর',
    refundHint: (v) => `* অগ্রিম/উৎসে কর দায়ের বেশি — সম্ভাব্য ফেরত: ${v} টাকা।`,
    footer: 'শুধুমাত্র তথ্যের জন্য। সরকারি পরামর্শের জন্য জাতীয় রাজস্ব বোর্ড বা কর বিশেষজ্ঞের সাথে যোগাযোগ করুন।',
    currency: (v) => `${v} টাকা`,
    deductCurrency: (v) => `− ${v} টাকা`,
    slabTax: (v) => `কর: ${v} টাকা`,
    subtotal: (v) => `এই মেয়াদের মোট: ${v} টাকা`,
    periodLabel: (n) => `মেয়াদ ${n}`,
    months: (n) => `${n} মাস`,
    from: 'থেকে',
    to: 'পর্যন্ত',
    perMonth: '/মাস',
    perYear: '/বছর',
    salaryAmountPlaceholder: 'বেতনের পরিমাণ (টাকা)',
    freeUpTo: (v) => `${v} টাকা পর্যন্ত করমুক্ত`,
    categories: [
      { key: 'general', label: 'সাধারণ (পুরুষ < ৬৫)' },
      { key: 'women_senior', label: 'মহিলা / প্রবীণ (৬৫+)' },
      { key: 'challenged_third', label: 'শারীরিক প্রতিবন্ধী / তৃতীয় লিঙ্গ' },
      { key: 'freedom_fighter', label: 'গেজেটভুক্ত মুক্তিযোদ্ধা' },
    ],
    fyMonths: [
      'জুলাই ২০২৫', 'আগস্ট ২০২৫', 'সেপ্টেম্বর ২০২৫', 'অক্টোবর ২০২৫', 'নভেম্বর ২০২৫', 'ডিসেম্বর ২০২৫',
      'জানুয়ারি ২০২৬', 'ফেব্রুয়ারি ২০২৬', 'মার্চ ২০২৬', 'এপ্রিল ২০২৬', 'মে ২০২৬', 'জুন ২০২৬',
    ],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n) {
  if (n === undefined || n === null || isNaN(n)) return '0';
  return Math.round(n).toLocaleString('en-IN');
}

function parse(str) {
  return parseFloat((str || '').replace(/,/g, '')) || 0;
}

function calcSalaryExemption(gross) {
  return Math.min(gross / 3, 500000);
}

function calcTax(taxableIncome, taxFreeLimit, lang) {
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

function calcRebate(taxableIncome, investment) {
  if (!investment || investment <= 0) return 0;
  return Math.min(taxableIncome * 0.03, investment * 0.15, 1000000);
}

function grossFromPeriods(periods) {
  return periods.reduce((sum, p) => {
    const amt = parse(p.amount);
    const months = p.toIdx - p.fromIdx + 1;
    const monthly = p.isMonthly ? amt : amt / 12;
    return sum + monthly * months;
  }, 0);
}

const DEFAULT_PERIODS = () => [
  { id: 1, fromIdx: 0, toIdx: 5, amount: '', isMonthly: true },
  { id: 2, fromIdx: 6, toIdx: 11, amount: '', isMonthly: true },
];

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [lang, setLang] = useState('en');
  const t = T[lang];

  const [inputMode, setInputMode] = useState('annual');
  const [grossSalary, setGrossSalary] = useState('');
  const [periods, setPeriods] = useState(DEFAULT_PERIODS());
  const [nextPeriodId, setNextPeriodId] = useState(3);
  const [openPicker, setOpenPicker] = useState(null);

  const [performanceBonus, setPerformanceBonus] = useState('');
  const [festivalBonus, setFestivalBonus] = useState('');

  const [investment, setInvestment] = useState('');
  const [ait, setAit] = useState('');
  const [category, setCategory] = useState('general');
  const [hasDisabledDependent, setHasDisabledDependent] = useState(false);
  const [isSalaried, setIsSalaried] = useState(true);
  const [showCategory, setShowCategory] = useState(false);
  const [result, setResult] = useState(null);

  function addPeriod() {
    setPeriods(prev => [
      ...prev,
      { id: nextPeriodId, fromIdx: 0, toIdx: 11, amount: '', isMonthly: true },
    ]);
    setNextPeriodId(n => n + 1);
  }

  function removePeriod(id) {
    setPeriods(prev => prev.filter(p => p.id !== id));
    if (openPicker?.id === id) setOpenPicker(null);
  }

  function updatePeriod(id, updates) {
    setPeriods(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }

  function togglePicker(id, field) {
    setOpenPicker(prev =>
      prev?.id === id && prev?.field === field ? null : { id, field }
    );
  }

  function getGrossAnnual() {
    const bonuses = parse(performanceBonus) + parse(festivalBonus);
    if (inputMode === 'period') return grossFromPeriods(periods) + bonuses;
    const raw = parse(grossSalary);
    const salary = inputMode === 'monthly' ? raw * 12 : raw;
    return salary + bonuses;
  }

  function handleCalculate() {
    const gross = getGrossAnnual();
    const inv = parse(investment);
    const aitPaid = parse(ait);

    if (gross <= 0) {
      setResult({ error: t.errorMsg });
      return;
    }

    let taxFreeLimit = TAX_FREE_LIMITS[category];
    if (hasDisabledDependent) taxFreeLimit += 50000;

    const salaryExemption = isSalaried ? calcSalaryExemption(gross) : 0;
    const taxableIncome = Math.max(0, gross - salaryExemption);
    const { grossTax, slabDetails } = calcTax(taxableIncome, taxFreeLimit, lang);
    const rebate = calcRebate(taxableIncome, inv);
    const taxAfterRebate = Math.max(0, grossTax - rebate);
    const minimumTax = taxableIncome > taxFreeLimit ? MINIMUM_TAX : 0;
    const finalTax = Math.max(taxAfterRebate, minimumTax);
    const netTaxPayable = Math.max(0, finalTax - aitPaid);

    const perfBonus = parse(performanceBonus);
    const festBonus = parse(festivalBonus);

    setResult({
      gross, salaryExemption, taxableIncome, taxFreeLimit,
      slabDetails, grossTax, rebate, taxAfterRebate,
      minimumTax, finalTax, aitPaid, netTaxPayable,
      perfBonus, festBonus,
    });
  }

  function handleReset() {
    setInputMode('annual');
    setGrossSalary('');
    setPeriods(DEFAULT_PERIODS());
    setNextPeriodId(3);
    setOpenPicker(null);
    setPerformanceBonus('');
    setFestivalBonus('');
    setInvestment('');
    setAit('');
    setCategory('general');
    setHasDisabledDependent(false);
    setIsSalaried(true);
    setShowCategory(false);
    setResult(null);
  }

  function toggleLang() {
    const next = lang === 'en' ? 'bn' : 'en';
    setLang(next);
    // Rebuild slab labels on next calculate
    if (result && !result.error) {
      let taxFreeLimit = TAX_FREE_LIMITS[category];
      if (hasDisabledDependent) taxFreeLimit += 50000;
      const salaryExemption = isSalaried ? calcSalaryExemption(result.gross) : 0;
      const taxableIncome = Math.max(0, result.gross - salaryExemption);
      const { grossTax, slabDetails } = calcTax(taxableIncome, taxFreeLimit, next);
      setResult(prev => ({ ...prev, slabDetails, grossTax }));
    }
  }

  const periodGross = inputMode === 'period' ? grossFromPeriods(periods) : 0;
  const monthlyEquivalent = inputMode === 'monthly' ? parse(grossSalary) * 12 : 0;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={GREEN} />

      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>{t.appTitle}</Text>
          <TouchableOpacity style={styles.langBtn} onPress={toggleLang} activeOpacity={0.8}>
            <Text style={styles.langBtnText}>{t.langBtn}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Income Details ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t.incomeDetails}</Text>

          <View style={styles.modeTabs}>
            {[
              { key: 'annual', label: t.annual },
              { key: 'monthly', label: t.monthly },
              { key: 'period', label: t.byPeriod },
            ].map(m => (
              <TouchableOpacity
                key={m.key}
                style={[styles.modeTab, inputMode === m.key && styles.modeTabActive]}
                onPress={() => { setInputMode(m.key); setResult(null); setOpenPicker(null); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.modeTabText, inputMode === m.key && styles.modeTabTextActive]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{t.salariedIncome}</Text>
            <Switch
              value={isSalaried}
              onValueChange={setIsSalaried}
              trackColor={{ false: '#ccc', true: GREEN }}
              thumbColor="#fff"
            />
          </View>
          {isSalaried && (
            <Text style={styles.hint}>{t.salariedHint}</Text>
          )}

          {inputMode !== 'period' && (
            <>
              <Text style={styles.label}>
                {inputMode === 'annual' ? t.annualGross : t.monthlyGross}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={inputMode === 'annual' ? t.annualPlaceholder : t.monthlyPlaceholder}
                placeholderTextColor="#aaa"
                keyboardType="numeric"
                value={grossSalary}
                onChangeText={setGrossSalary}
              />
              {inputMode === 'monthly' && monthlyEquivalent > 0 && (
                <Text style={styles.convertHint}>
                  {t.annualEquiv(fmt(monthlyEquivalent))}
                </Text>
              )}
            </>
          )}

          {inputMode === 'period' && (
            <>
              <Text style={styles.hint}>{t.periodHint}</Text>

              {periods.map((period, idx) => (
                <PeriodRow
                  key={period.id}
                  period={period}
                  idx={idx}
                  openPicker={openPicker}
                  onTogglePicker={togglePicker}
                  onUpdate={updatePeriod}
                  onRemove={removePeriod}
                  canRemove={periods.length > 1}
                  t={t}
                />
              ))}

              <TouchableOpacity style={styles.addPeriodBtn} onPress={addPeriod} activeOpacity={0.75}>
                <Text style={styles.addPeriodBtnText}>{t.addPeriod}</Text>
              </TouchableOpacity>

              {periodGross > 0 && (
                <View style={styles.periodTotalBox}>
                  <Text style={styles.periodTotalLabel}>{t.calcAnnualGross}</Text>
                  <Text style={styles.periodTotalValue}>{t.currency(fmt(periodGross))}</Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* ── Annual Bonuses ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t.annualBonuses}</Text>

          <Text style={styles.label}>{t.perfBonus}</Text>
          <TextInput
            style={styles.input}
            placeholder={t.bonusPlaceholder50}
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={performanceBonus}
            onChangeText={v => { setPerformanceBonus(v); setResult(null); }}
          />

          <Text style={styles.label}>{t.festBonus}</Text>
          <TextInput
            style={styles.input}
            placeholder={t.bonusPlaceholder100}
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={festivalBonus}
            onChangeText={v => { setFestivalBonus(v); setResult(null); }}
          />

          {(parse(performanceBonus) > 0 || parse(festivalBonus) > 0) && (
            <View style={styles.bonusTotalBox}>
              <Text style={styles.bonusTotalLabel}>{t.totalBonuses}</Text>
              <Text style={styles.bonusTotalValue}>
                {t.currency(fmt(parse(performanceBonus) + parse(festivalBonus)))}
              </Text>
            </View>
          )}
        </View>

        {/* ── Deductions ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t.deductions}</Text>

          <Text style={styles.label}>{t.investment}</Text>
          <TextInput
            style={styles.input}
            placeholder={t.investPlaceholder}
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={investment}
            onChangeText={setInvestment}
          />

          <Text style={styles.label}>{t.ait}</Text>
          <TextInput
            style={styles.input}
            placeholder={t.aitPlaceholder}
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={ait}
            onChangeText={setAit}
          />
        </View>

        {/* ── Taxpayer Category ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t.taxpayerCat}</Text>

          <TouchableOpacity
            style={styles.dropdownBtn}
            onPress={() => setShowCategory(!showCategory)}
            activeOpacity={0.8}
          >
            <Text style={styles.dropdownBtnText}>
              {t.categories.find(c => c.key === category)?.label}
            </Text>
            <Text style={styles.dropdownArrow}>{showCategory ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showCategory && (
            <View style={styles.dropdownList}>
              {t.categories.map(cat => (
                <TouchableOpacity
                  key={cat.key}
                  style={[styles.dropdownItem, category === cat.key && styles.dropdownItemActive]}
                  onPress={() => { setCategory(cat.key); setShowCategory(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dropdownItemText, category === cat.key && styles.dropdownItemTextActive]}>
                    {cat.label}
                  </Text>
                  <Text style={styles.dropdownItemLimit}>
                    {t.freeUpTo(fmt(TAX_FREE_LIMITS[cat.key]))}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={[styles.toggleRow, { marginTop: 12 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>{t.disabledDependent}</Text>
              <Text style={styles.hint}>{t.disabledHint}</Text>
            </View>
            <Switch
              value={hasDisabledDependent}
              onValueChange={setHasDisabledDependent}
              trackColor={{ false: '#ccc', true: GREEN }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* ── Calculate ── */}
        <TouchableOpacity style={styles.calcBtn} onPress={handleCalculate} activeOpacity={0.85}>
          <Text style={styles.calcBtnText}>{t.calcBtn}</Text>
        </TouchableOpacity>

        {/* ── Error ── */}
        {result?.error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{result.error}</Text>
          </View>
        )}

        {/* ── Results ── */}
        {result && !result.error && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t.resultTitle}</Text>

            <Row label={t.grossAnnual} value={t.currency(fmt(result.gross))} />
            {result.perfBonus > 0 && (
              <Row label={t.perfBonusRow} value={t.currency(fmt(result.perfBonus))} muted />
            )}
            {result.festBonus > 0 && (
              <Row label={t.festBonusRow} value={t.currency(fmt(result.festBonus))} muted />
            )}
            {isSalaried && (
              <Row label={t.salaryExemption} value={t.deductCurrency(fmt(result.salaryExemption))} muted />
            )}
            <Row label={t.taxableIncome} value={t.currency(fmt(result.taxableIncome))} bold />
            <Row label={t.taxFreeLimit} value={t.currency(fmt(result.taxFreeLimit))} muted />

            <View style={styles.divider} />
            <Text style={styles.slabHeader}>{t.slabHeader}</Text>

            {result.slabDetails.map((s, i) => (
              <View key={i} style={styles.slabRow}>
                <View style={styles.slabLeft}>
                  <Text style={styles.slabLabel}>{s.label}</Text>
                  <Text style={styles.slabRate}>@ {(s.rate * 100).toFixed(0)}%</Text>
                </View>
                <View style={styles.slabRight}>
                  <Text style={styles.slabAmount}>{t.currency(fmt(s.chargeable))}</Text>
                  <Text style={[styles.slabTax, s.tax === 0 && styles.zeroTax]}>
                    {t.slabTax(fmt(s.tax))}
                  </Text>
                </View>
              </View>
            ))}

            <View style={styles.divider} />
            <Row label={t.grossTax} value={t.currency(fmt(result.grossTax))} bold />

            {result.rebate > 0 && (
              <Row label={t.rebate} value={t.deductCurrency(fmt(result.rebate))} green />
            )}
            <Row label={t.taxAfterRebate} value={t.currency(fmt(result.taxAfterRebate))} />

            {result.taxableIncome > result.taxFreeLimit && (
              <View style={styles.minimumTaxBox}>
                <Text style={styles.minimumTaxText}>
                  {t.minTax(
                    fmt(result.minimumTax),
                    result.finalTax === result.minimumTax && result.taxAfterRebate < result.minimumTax
                  )}
                </Text>
              </View>
            )}

            {result.aitPaid > 0 && (
              <Row label={t.aitPaid} value={t.deductCurrency(fmt(result.aitPaid))} green />
            )}

            <View style={styles.divider} />
            <View style={styles.netTaxRow}>
              <Text style={styles.netTaxLabel}>{t.netTax}</Text>
              <Text style={[styles.netTaxValue, result.netTaxPayable === 0 && styles.zeroTax]}>
                {t.currency(fmt(result.netTaxPayable))}
              </Text>
            </View>

            {result.netTaxPayable === 0 && result.grossTax > 0 && (
              <Text style={styles.refundHint}>
                {t.refundHint(fmt(result.aitPaid - result.finalTax))}
              </Text>
            )}
          </View>
        )}

        <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.8}>
          <Text style={styles.resetBtnText}>{t.resetBtn}</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>{t.footer}</Text>
      </ScrollView>
    </View>
  );
}

// ─── PeriodRow ────────────────────────────────────────────────────────────────

function PeriodRow({ period, idx, openPicker, onTogglePicker, onUpdate, onRemove, canRemove, t }) {
  const isFromOpen = openPicker?.id === period.id && openPicker?.field === 'from';
  const isToOpen = openPicker?.id === period.id && openPicker?.field === 'to';
  const numMonths = period.toIdx - period.fromIdx + 1;
  const amt = parse(period.amount);
  const monthlyAmt = period.isMonthly ? amt : amt / 12;
  const subtotal = monthlyAmt * numMonths;

  return (
    <View style={styles.periodCard}>
      <View style={styles.periodHeader}>
        <Text style={styles.periodLabel}>{t.periodLabel(idx + 1)}</Text>
        <View style={styles.periodHeaderRight}>
          {numMonths > 0 && (
            <View style={styles.periodBadge}>
              <Text style={styles.periodBadgeText}>{t.months(numMonths)}</Text>
            </View>
          )}
          {canRemove && (
            <TouchableOpacity
              onPress={() => onRemove(period.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.periodRemoveBtn}
            >
              <Text style={styles.periodRemove}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.periodDateRow}>
        <View style={styles.periodDateCol}>
          <Text style={styles.periodDateLabel}>{t.from}</Text>
          <TouchableOpacity
            style={[styles.monthBtn, isFromOpen && styles.monthBtnActive]}
            onPress={() => onTogglePicker(period.id, 'from')}
            activeOpacity={0.8}
          >
            <Text style={[styles.monthBtnText, isFromOpen && styles.monthBtnTextActive]}>
              {t.fyMonths[period.fromIdx]}
            </Text>
            <Text style={styles.monthBtnArrow}>{isFromOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.periodDateSep}>
          <Text style={styles.periodDateArrow}>→</Text>
        </View>

        <View style={styles.periodDateCol}>
          <Text style={styles.periodDateLabel}>{t.to}</Text>
          <TouchableOpacity
            style={[styles.monthBtn, isToOpen && styles.monthBtnActive]}
            onPress={() => onTogglePicker(period.id, 'to')}
            activeOpacity={0.8}
          >
            <Text style={[styles.monthBtnText, isToOpen && styles.monthBtnTextActive]}>
              {t.fyMonths[period.toIdx]}
            </Text>
            <Text style={styles.monthBtnArrow}>{isToOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isFromOpen && (
        <ScrollView style={styles.monthPickerScroll} nestedScrollEnabled showsVerticalScrollIndicator={false}>
          {t.fyMonths.map((m, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.monthPickerItem, period.fromIdx === i && styles.monthPickerItemActive]}
              onPress={() => {
                onUpdate(period.id, {
                  fromIdx: i,
                  toIdx: Math.max(i, period.toIdx),
                });
                onTogglePicker(period.id, 'from');
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.monthPickerItemText, period.fromIdx === i && styles.monthPickerItemTextActive]}>
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {isToOpen && (
        <ScrollView style={styles.monthPickerScroll} nestedScrollEnabled showsVerticalScrollIndicator={false}>
          {t.fyMonths.map((m, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.monthPickerItem,
                period.toIdx === i && styles.monthPickerItemActive,
                i < period.fromIdx && styles.monthPickerItemDisabled,
              ]}
              onPress={() => {
                if (i < period.fromIdx) return;
                onUpdate(period.id, { toIdx: i });
                onTogglePicker(period.id, 'to');
              }}
              activeOpacity={i < period.fromIdx ? 1 : 0.7}
            >
              <Text style={[
                styles.monthPickerItemText,
                period.toIdx === i && styles.monthPickerItemTextActive,
                i < period.fromIdx && styles.monthPickerItemTextDisabled,
              ]}>
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={styles.periodAmountRow}>
        <TextInput
          style={[styles.input, styles.periodAmountInput]}
          placeholder={t.salaryAmountPlaceholder}
          placeholderTextColor="#aaa"
          keyboardType="numeric"
          value={period.amount}
          onChangeText={v => onUpdate(period.id, { amount: v })}
        />
        <View style={styles.periodModeToggle}>
          <TouchableOpacity
            style={[styles.periodModeBtn, period.isMonthly && styles.periodModeBtnActive]}
            onPress={() => onUpdate(period.id, { isMonthly: true })}
            activeOpacity={0.7}
          >
            <Text style={[styles.periodModeBtnText, period.isMonthly && styles.periodModeBtnTextActive]}>
              {t.perMonth}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodModeBtn, !period.isMonthly && styles.periodModeBtnActive]}
            onPress={() => onUpdate(period.id, { isMonthly: false })}
            activeOpacity={0.7}
          >
            <Text style={[styles.periodModeBtnText, !period.isMonthly && styles.periodModeBtnTextActive]}>
              {t.perYear}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {subtotal > 0 && (
        <Text style={styles.periodSubtotal}>
          {t.subtotal(fmt(subtotal))}
        </Text>
      )}
    </View>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function Row({ label, value, bold, muted, green }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, muted && styles.mutedText]}>{label}</Text>
      <Text style={[
        styles.rowValue,
        bold && styles.boldText,
        muted && styles.mutedText,
        green && styles.greenText,
      ]}>
        {value}
      </Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f2f4f7' },

  header: {
    backgroundColor: GREEN,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700', letterSpacing: 0.3, flex: 1, paddingRight: 10 },
  langBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  langBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 48 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: GREEN, marginBottom: 12 },

  modeTabs: {
    flexDirection: 'row',
    backgroundColor: '#f0f2f5',
    borderRadius: 10,
    padding: 3,
    marginBottom: 14,
  },
  modeTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  modeTabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modeTabText: { fontSize: 13, color: '#888', fontWeight: '500' },
  modeTabTextActive: { color: GREEN, fontWeight: '700' },

  label: { fontSize: 13, color: '#555', marginBottom: 5, marginTop: 10 },
  input: {
    borderWidth: 1.5,
    borderColor: '#dde1e7',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 9,
    fontSize: 15,
    color: '#1a1a2e',
    backgroundColor: '#fafbfc',
  },
  hint: { fontSize: 11.5, color: '#888', marginTop: 4, fontStyle: 'italic' },
  convertHint: { fontSize: 12, color: GREEN, marginTop: 6, fontStyle: 'italic' },

  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  toggleLabel: { fontSize: 14, color: '#333', flex: 1, paddingRight: 8 },

  periodCard: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    backgroundColor: '#fafbfc',
  },
  periodHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  periodHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  periodLabel: { fontSize: 13, fontWeight: '700', color: GREEN },
  periodBadge: {
    backgroundColor: GREEN_LIGHT,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  periodBadgeText: { fontSize: 11, color: GREEN, fontWeight: '600' },
  periodRemoveBtn: { padding: 2 },
  periodRemove: { fontSize: 14, color: '#e74c3c', fontWeight: '700' },

  periodDateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  periodDateCol: { flex: 1 },
  periodDateSep: { paddingHorizontal: 8, alignItems: 'center' },
  periodDateArrow: { fontSize: 16, color: '#aaa' },
  periodDateLabel: { fontSize: 10, color: '#999', fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },

  monthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#dde1e7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  monthBtnActive: { borderColor: GREEN, backgroundColor: GREEN_LIGHT },
  monthBtnText: { fontSize: 12.5, color: '#1a1a2e', flex: 1 },
  monthBtnTextActive: { color: GREEN, fontWeight: '600' },
  monthBtnArrow: { fontSize: 9, color: '#999', marginLeft: 4 },

  monthPickerScroll: {
    maxHeight: 180,
    borderWidth: 1.5,
    borderColor: '#dde1e7',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  monthPickerItem: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  monthPickerItemActive: { backgroundColor: GREEN_LIGHT },
  monthPickerItemDisabled: { opacity: 0.3 },
  monthPickerItemText: { fontSize: 13, color: '#333' },
  monthPickerItemTextActive: { color: GREEN, fontWeight: '600' },
  monthPickerItemTextDisabled: { color: '#bbb' },

  periodAmountRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  periodAmountInput: { flex: 1, marginTop: 0 },
  periodModeToggle: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#dde1e7',
    borderRadius: 8,
    overflow: 'hidden',
  },
  periodModeBtn: { paddingHorizontal: 11, paddingVertical: Platform.OS === 'ios' ? 12 : 9, backgroundColor: '#fafbfc' },
  periodModeBtnActive: { backgroundColor: GREEN },
  periodModeBtnText: { fontSize: 12, color: '#888', fontWeight: '700' },
  periodModeBtnTextActive: { color: '#fff' },

  periodSubtotal: { fontSize: 12, color: '#27ae60', marginTop: 8, fontWeight: '500' },

  addPeriodBtn: {
    borderWidth: 1.5,
    borderColor: GREEN,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 12,
  },
  addPeriodBtnText: { color: GREEN, fontSize: 13, fontWeight: '700' },

  bonusTotalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 12,
  },
  bonusTotalLabel: { fontSize: 13, color: '#2563eb', fontWeight: '600' },
  bonusTotalValue: { fontSize: 15, color: '#2563eb', fontWeight: '700' },

  periodTotalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: GREEN_LIGHT,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 12,
  },
  periodTotalLabel: { fontSize: 13, color: GREEN, fontWeight: '600' },
  periodTotalValue: { fontSize: 15, color: GREEN, fontWeight: '700' },

  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#dde1e7',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fafbfc',
  },
  dropdownBtnText: { fontSize: 14, color: '#1a1a2e', flex: 1 },
  dropdownArrow: { fontSize: 12, color: '#888', marginLeft: 8 },
  dropdownList: {
    borderWidth: 1.5,
    borderColor: '#dde1e7',
    borderRadius: 10,
    marginTop: 6,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#fafbfc',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemActive: { backgroundColor: GREEN_LIGHT },
  dropdownItemText: { fontSize: 13.5, color: '#333' },
  dropdownItemTextActive: { color: GREEN, fontWeight: '600' },
  dropdownItemLimit: { fontSize: 11.5, color: '#888', marginTop: 1 },

  calcBtn: {
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  calcBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },

  resetBtn: {
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 14,
    backgroundColor: '#fff',
  },
  resetBtnText: { color: '#666', fontSize: 14, fontWeight: '600' },

  errorBox: {
    backgroundColor: '#fff0f0',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f5c6c6',
  },
  errorText: { color: '#c0392b', fontSize: 14 },

  divider: { height: 1, backgroundColor: '#eee', marginVertical: 12 },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
  rowLabel: { fontSize: 13.5, color: '#444', flex: 1, paddingRight: 8 },
  rowValue: { fontSize: 13.5, color: '#222', fontWeight: '500' },
  boldText: { fontWeight: '700', fontSize: 14 },
  mutedText: { color: '#888' },
  greenText: { color: '#27ae60' },

  slabHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  slabRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  slabLeft: { flex: 1 },
  slabRight: { alignItems: 'flex-end' },
  slabLabel: { fontSize: 13, color: '#333' },
  slabRate: { fontSize: 11.5, color: '#888', marginTop: 1 },
  slabAmount: { fontSize: 12.5, color: '#555' },
  slabTax: { fontSize: 13, color: '#1a1a2e', fontWeight: '600', marginTop: 1 },
  zeroTax: { color: '#27ae60' },

  minimumTaxBox: {
    backgroundColor: '#fff8e6',
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#ffe0a0',
  },
  minimumTaxText: { fontSize: 12.5, color: '#a0660a' },

  netTaxRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  netTaxLabel: { fontSize: 16, fontWeight: '700', color: '#1a1a2e' },
  netTaxValue: { fontSize: 18, fontWeight: '800', color: GOLD },

  refundHint: { fontSize: 12, color: '#27ae60', marginTop: 4, fontStyle: 'italic' },

  footer: { textAlign: 'center', fontSize: 11.5, color: '#aaa', marginTop: 6, fontStyle: 'italic' },
});
