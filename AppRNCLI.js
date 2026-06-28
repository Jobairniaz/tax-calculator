/**
 * Copy this file's contents into App.tsx (or App.js) of your
 * React Native CLI project (e.g. TaxKoto/App.tsx).
 *
 * The only difference from the Expo version:
 *   - StatusBar is imported from 'react-native' (not 'expo-status-bar')
 *   - <StatusBar barStyle / backgroundColor> props instead of style="light"
 */

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

const TAX_FREE_LIMITS = {
  general: 375000,
  women_senior: 425000,
  challenged_third: 500000,
  freedom_fighter: 525000,
};

const MINIMUM_TAX = 5000;

function calculateSalaryExemption(grossSalary) {
  return Math.min(grossSalary / 3, 500000);
}

function calculateTax(taxableIncome, taxFreeLimit) {
  if (taxableIncome <= taxFreeLimit) {
    return { grossTax: 0, slabDetails: [] };
  }

  const slabs = [
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

function calculateRebate(taxableIncome, investment) {
  if (!investment || investment <= 0) return 0;
  return Math.min(taxableIncome * 0.03, investment * 0.15, 1000000);
}

function fmt(n) {
  if (n === undefined || n === null || isNaN(n)) return '0';
  return Math.round(n).toLocaleString('en-IN');
}

const CATEGORIES = [
  { key: 'general', label: 'General (Male < 65)' },
  { key: 'women_senior', label: 'Women / Senior (65+)' },
  { key: 'challenged_third', label: 'Physically Challenged / Third Gender' },
  { key: 'freedom_fighter', label: 'Gazetted Freedom Fighter' },
];

export default function App() {
  const [grossSalary, setGrossSalary] = useState('');
  const [investment, setInvestment] = useState('');
  const [ait, setAit] = useState('');
  const [category, setCategory] = useState('general');
  const [hasDisabledDependent, setHasDisabledDependent] = useState(false);
  const [isSalaried, setIsSalaried] = useState(true);
  const [result, setResult] = useState(null);
  const [showCategory, setShowCategory] = useState(false);

  function handleCalculate() {
    const gross = parseFloat(grossSalary.replace(/,/g, '')) || 0;
    const inv = parseFloat(investment.replace(/,/g, '')) || 0;
    const aitPaid = parseFloat(ait.replace(/,/g, '')) || 0;

    if (gross <= 0) {
      setResult({ error: 'Please enter a valid gross salary.' });
      return;
    }

    let taxFreeLimit = TAX_FREE_LIMITS[category];
    if (hasDisabledDependent) taxFreeLimit += 50000;

    const salaryExemption = isSalaried ? calculateSalaryExemption(gross) : 0;
    const taxableIncome = Math.max(0, gross - salaryExemption);

    const { grossTax, slabDetails } = calculateTax(taxableIncome, taxFreeLimit);

    const rebate = calculateRebate(taxableIncome, inv);
    const taxAfterRebate = Math.max(0, grossTax - rebate);
    const minimumTax = taxableIncome > taxFreeLimit ? MINIMUM_TAX : 0;
    const finalTax = Math.max(taxAfterRebate, minimumTax);
    const netTaxPayable = Math.max(0, finalTax - aitPaid);

    setResult({
      gross, salaryExemption, taxableIncome, taxFreeLimit,
      slabDetails, grossTax, rebate, taxAfterRebate,
      minimumTax, finalTax, aitPaid, netTaxPayable,
    });
  }

  function handleReset() {
    setGrossSalary('');
    setInvestment('');
    setAit('');
    setCategory('general');
    setHasDisabledDependent(false);
    setIsSalaried(true);
    setResult(null);
    setShowCategory(false);
  }

  return (
    <View style={styles.root}>
      {/* ← Key difference from Expo: barStyle + backgroundColor props */}
      <StatusBar barStyle="light-content" backgroundColor={GREEN} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>BD Income Tax Calculator</Text>
        <Text style={styles.headerSub}>FY 2025–26 · AY 2026–27</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Income Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Income Details</Text>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Salaried Income</Text>
            <Switch
              value={isSalaried}
              onValueChange={setIsSalaried}
              trackColor={{ false: '#ccc', true: GREEN }}
              thumbColor="#fff"
            />
          </View>
          {isSalaried && (
            <Text style={styles.hint}>
              Salary exemption = lower of (1/3 of gross) or BDT 5,00,000
            </Text>
          )}

          <Text style={styles.label}>Annual Gross Salary (BDT)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 1,200,000"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={grossSalary}
            onChangeText={setGrossSalary}
          />

          <Text style={styles.label}>Eligible Investment (BDT) — optional</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 100,000"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={investment}
            onChangeText={setInvestment}
          />

          <Text style={styles.label}>Advance Income Tax / TDS Paid (BDT) — optional</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 20,000"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={ait}
            onChangeText={setAit}
          />
        </View>

        {/* Taxpayer Category */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Taxpayer Category</Text>
          <TouchableOpacity
            style={styles.dropdownBtn}
            onPress={() => setShowCategory(!showCategory)}
            activeOpacity={0.8}
          >
            <Text style={styles.dropdownBtnText}>
              {CATEGORIES.find(c => c.key === category)?.label}
            </Text>
            <Text style={styles.dropdownArrow}>{showCategory ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {showCategory && (
            <View style={styles.dropdownList}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.dropdownItem,
                    category === cat.key && styles.dropdownItemActive,
                  ]}
                  onPress={() => { setCategory(cat.key); setShowCategory(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dropdownItemText, category === cat.key && styles.dropdownItemTextActive]}>
                    {cat.label}
                  </Text>
                  <Text style={styles.dropdownItemLimit}>
                    Free up to BDT {fmt(TAX_FREE_LIMITS[cat.key])}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Parent/Guardian of Disabled Person</Text>
              <Text style={styles.hint}>+BDT 50,000 additional tax-free limit</Text>
            </View>
            <Switch
              value={hasDisabledDependent}
              onValueChange={setHasDisabledDependent}
              trackColor={{ false: '#ccc', true: GREEN }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Buttons */}
        <TouchableOpacity style={styles.calcBtn} onPress={handleCalculate} activeOpacity={0.85}>
          <Text style={styles.calcBtnText}>Calculate Tax</Text>
        </TouchableOpacity>

        {/* Error */}
        {result?.error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{result.error}</Text>
          </View>
        )}

        {/* Results */}
        {result && !result.error && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Tax Calculation Summary</Text>

            <Row label="Gross Annual Salary" value={`BDT ${fmt(result.gross)}`} />
            {isSalaried && (
              <Row label="Salary Exemption" value={`− BDT ${fmt(result.salaryExemption)}`} muted />
            )}
            <Row label="Taxable Income" value={`BDT ${fmt(result.taxableIncome)}`} bold />
            <Row label="Tax-Free Limit" value={`BDT ${fmt(result.taxFreeLimit)}`} muted />

            <View style={styles.divider} />
            <Text style={styles.slabHeader}>Progressive Tax Breakdown</Text>

            {result.slabDetails.map((s, i) => (
              <View key={i} style={styles.slabRow}>
                <View style={styles.slabLeft}>
                  <Text style={styles.slabLabel}>{s.label}</Text>
                  <Text style={styles.slabRate}>@ {(s.rate * 100).toFixed(0)}%</Text>
                </View>
                <View style={styles.slabRight}>
                  <Text style={styles.slabAmount}>BDT {fmt(s.chargeable)}</Text>
                  <Text style={[styles.slabTax, s.tax === 0 && styles.zeroTax]}>
                    Tax: BDT {fmt(s.tax)}
                  </Text>
                </View>
              </View>
            ))}

            <View style={styles.divider} />
            <Row label="Gross Tax Payable" value={`BDT ${fmt(result.grossTax)}`} bold />
            {result.rebate > 0 && (
              <Row label="Investment Tax Rebate" value={`− BDT ${fmt(result.rebate)}`} green />
            )}
            <Row label="Tax After Rebate" value={`BDT ${fmt(result.taxAfterRebate)}`} />

            {result.taxableIncome > result.taxFreeLimit && (
              <View style={styles.minimumTaxBox}>
                <Text style={styles.minimumTaxText}>
                  Minimum tax applicable: BDT {fmt(result.minimumTax)}
                  {result.finalTax === result.minimumTax && result.taxAfterRebate < result.minimumTax
                    ? '  ← applied'
                    : ''}
                </Text>
              </View>
            )}

            {result.aitPaid > 0 && (
              <Row label="AIT / TDS Already Paid" value={`− BDT ${fmt(result.aitPaid)}`} green />
            )}

            <View style={styles.divider} />
            <View style={styles.netTaxRow}>
              <Text style={styles.netTaxLabel}>Net Tax Payable</Text>
              <Text style={[styles.netTaxValue, result.netTaxPayable === 0 && styles.zeroTax]}>
                BDT {fmt(result.netTaxPayable)}
              </Text>
            </View>
            {result.netTaxPayable === 0 && result.grossTax > 0 && (
              <Text style={styles.refundHint}>
                * Your AIT/TDS exceeds liability — possible refund of BDT {fmt(result.aitPaid - result.finalTax)}.
              </Text>
            )}
          </View>
        )}

        <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.8}>
          <Text style={styles.resetBtnText}>Reset</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          For reference only. Consult the NBR or a tax professional for official advice.
        </Text>
      </ScrollView>
    </View>
  );
}

function Row({ label, value, bold, muted, green }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, muted && styles.mutedText]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.boldText, muted && styles.mutedText, green && styles.greenText]}>
        {value}
      </Text>
    </View>
  );
}

const GREEN = '#006A4E';
const GREEN_LIGHT = '#e6f4ef';
const GOLD = '#F42A41';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f2f4f7' },
  header: {
    backgroundColor: GREEN,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '700', letterSpacing: 0.3 },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 3 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },

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
  hint: { fontSize: 11.5, color: '#888', marginTop: 3, fontStyle: 'italic' },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  toggleLabel: { fontSize: 14, color: '#333', flex: 1, paddingRight: 8 },

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

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
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

  netTaxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  netTaxLabel: { fontSize: 16, fontWeight: '700', color: '#1a1a2e' },
  netTaxValue: { fontSize: 18, fontWeight: '800', color: GOLD },

  refundHint: { fontSize: 12, color: '#27ae60', marginTop: 4, fontStyle: 'italic' },

  footer: {
    textAlign: 'center',
    fontSize: 11.5,
    color: '#aaa',
    marginTop: 6,
    fontStyle: 'italic',
  },
});
