import React, { useState, useRef } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Switch,
  StatusBar,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import './src/i18n';
import {
  GREEN, TAX_FREE_LIMITS, MINIMUM_TAX, NEW_TAXPAYER_MINIMUM_TAX, DISABLED_DEPENDENT_ALLOWANCE,
} from './src/constants';
import {
  fmt, parse,
  calcSalaryExemption, calcTax, calcRebate,
  grossFromPeriods, DEFAULT_PERIODS,
} from './src/utils/taxCalc';
import styles from './src/styles';
import PeriodRow from './src/components/PeriodRow';
import ResultCard from './src/components/ResultCard';
import ShareModal from './src/components/ShareModal';

export default function App() {
  const { t, i18n } = useTranslation();

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
  const [disabledDependents, setDisabledDependents] = useState('');
  const [isNewTaxpayer, setIsNewTaxpayer] = useState(false);
  const [isSalaried, setIsSalaried] = useState(true);
  const [showCategory, setShowCategory] = useState(false);
  const [result, setResult] = useState(null);

  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [showWatermark, setShowWatermark] = useState(true);
  const resultCardRef = useRef(null);

  // ── Period management ──────────────────────────────────────────────────────

  function addPeriod() {
    setPeriods(prev => [...prev, { id: nextPeriodId, fromIdx: 0, toIdx: 11, amount: '', isMonthly: true }]);
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
    setOpenPicker(prev => prev?.id === id && prev?.field === field ? null : { id, field });
  }

  // ── Calculation ────────────────────────────────────────────────────────────

  function getGrossAnnual() {
    const bonuses = parse(performanceBonus) + parse(festivalBonus);
    if (inputMode === 'period') return grossFromPeriods(periods) + bonuses;
    const raw = parse(grossSalary);
    const salary = inputMode === 'monthly' ? raw * 12 : raw;
    return salary + bonuses;
  }

  function getTaxFreeLimit() {
    const dependents = Math.max(0, Math.floor(parse(disabledDependents)));
    return TAX_FREE_LIMITS[category] + dependents * DISABLED_DEPENDENT_ALLOWANCE;
  }

  function handleCalculate() {
    const gross = getGrossAnnual();
    const inv = parse(investment);
    const aitPaid = parse(ait);

    if (gross <= 0) {
      setResult({ errorKey: 'errorMsg' });
      return;
    }

    const taxFreeLimit = getTaxFreeLimit();
    const salaryExemption = isSalaried ? calcSalaryExemption(gross) : 0;
    const taxableIncome = Math.max(0, gross - salaryExemption);
    const { grossTax, slabDetails } = calcTax(taxableIncome, taxFreeLimit);
    const rebate = calcRebate(taxableIncome, inv);
    const taxAfterRebate = Math.max(0, grossTax - rebate);
    const applicableMinimum = isNewTaxpayer ? NEW_TAXPAYER_MINIMUM_TAX : MINIMUM_TAX;
    const minimumTax = taxableIncome > taxFreeLimit ? applicableMinimum : 0;
    const finalTax = Math.max(taxAfterRebate, minimumTax);
    const netTaxPayable = Math.max(0, finalTax - aitPaid);

    setResult({
      gross,
      salaryExemption,
      taxableIncome,
      taxFreeLimit,
      slabDetails,
      grossTax,
      rebate,
      taxAfterRebate,
      minimumTax,
      finalTax,
      aitPaid,
      netTaxPayable,
      perfBonus: parse(performanceBonus),
      festBonus: parse(festivalBonus),
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
    setDisabledDependents('');
    setIsNewTaxpayer(false);
    setIsSalaried(true);
    setShowCategory(false);
    setResult(null);
  }

  function toggleLang() {
    i18n.changeLanguage(i18n.language === 'en' ? 'bn' : 'en');
  }

  const periodGross = inputMode === 'period' ? grossFromPeriods(periods) : 0;
  const monthlyEquivalent = inputMode === 'monthly' ? parse(grossSalary) * 12 : 0;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={GREEN} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>{t('appTitle')}</Text>
          <TouchableOpacity style={styles.langBtn} onPress={toggleLang} activeOpacity={0.8}>
            <Text style={styles.langBtnText}>{t('langBtn')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        {/* ── Income Details ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('incomeDetails')}</Text>

          <View style={styles.modeTabs}>
            {[
              { key: 'annual', label: t('annual') },
              { key: 'monthly', label: t('monthly') },
              { key: 'period', label: t('byPeriod') },
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
            <Text style={styles.toggleLabel}>{t('salariedIncome')}</Text>
            <Switch value={isSalaried} onValueChange={setIsSalaried} trackColor={{ false: '#ccc', true: GREEN }} thumbColor="#fff" />
          </View>
          {isSalaried && <Text style={styles.hint}>{t('salariedHint')}</Text>}

          {inputMode !== 'period' && (
            <>
              <Text style={styles.label}>{inputMode === 'annual' ? t('annualGross') : t('monthlyGross')}</Text>
              <TextInput
                style={styles.input}
                placeholder={inputMode === 'annual' ? t('annualPlaceholder') : t('monthlyPlaceholder')}
                placeholderTextColor="#aaa"
                keyboardType="numeric"
                value={grossSalary}
                onChangeText={setGrossSalary}
              />
              {inputMode === 'monthly' && monthlyEquivalent > 0 && (
                <Text style={styles.convertHint}>{t('annualEquiv', { value: fmt(monthlyEquivalent) })}</Text>
              )}
            </>
          )}

          {inputMode === 'period' && (
            <>
              <Text style={styles.hint}>{t('periodHint')}</Text>
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
                />
              ))}
              <TouchableOpacity style={styles.addPeriodBtn} onPress={addPeriod} activeOpacity={0.75}>
                <Text style={styles.addPeriodBtnText}>{t('addPeriod')}</Text>
              </TouchableOpacity>
              {periodGross > 0 && (
                <View style={styles.periodTotalBox}>
                  <Text style={styles.periodTotalLabel}>{t('calcAnnualGross')}</Text>
                  <Text style={styles.periodTotalValue}>{t('currency', { value: fmt(periodGross) })}</Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* ── Annual Bonuses ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('annualBonuses')}</Text>
          <Text style={styles.label}>{t('perfBonus')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('bonusPlaceholder50')}
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={performanceBonus}
            onChangeText={v => { setPerformanceBonus(v); setResult(null); }}
          />
          <Text style={styles.label}>{t('festBonus')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('bonusPlaceholder100')}
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={festivalBonus}
            onChangeText={v => { setFestivalBonus(v); setResult(null); }}
          />
          {(parse(performanceBonus) > 0 || parse(festivalBonus) > 0) && (
            <View style={styles.bonusTotalBox}>
              <Text style={styles.bonusTotalLabel}>{t('totalBonuses')}</Text>
              <Text style={styles.bonusTotalValue}>
                {t('currency', { value: fmt(parse(performanceBonus) + parse(festivalBonus)) })}
              </Text>
            </View>
          )}
        </View>

        {/* ── Deductions ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('deductions')}</Text>
          <Text style={styles.label}>{t('investment')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('investPlaceholder')}
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={investment}
            onChangeText={setInvestment}
          />
          <Text style={styles.label}>{t('ait')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('aitPlaceholder')}
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={ait}
            onChangeText={setAit}
          />
        </View>

        {/* ── Taxpayer Category ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('taxpayerCat')}</Text>
          <TouchableOpacity style={styles.dropdownBtn} onPress={() => setShowCategory(!showCategory)} activeOpacity={0.8}>
            <Text style={styles.dropdownBtnText}>{t(`categories.${category}`)}</Text>
            <Text style={styles.dropdownArrow}>{showCategory ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {showCategory && (
            <View style={styles.dropdownList}>
              {Object.keys(TAX_FREE_LIMITS).map(key => (
                <TouchableOpacity
                  key={key}
                  style={[styles.dropdownItem, category === key && styles.dropdownItemActive]}
                  onPress={() => { setCategory(key); setShowCategory(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dropdownItemText, category === key && styles.dropdownItemTextActive]}>
                    {t(`categories.${key}`)}
                  </Text>
                  <Text style={styles.dropdownItemLimit}>{t('freeUpTo', { value: fmt(TAX_FREE_LIMITS[key]) })}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <Text style={styles.label}>{t('disabledDependent')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('disabledPlaceholder')}
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={disabledDependents}
            onChangeText={setDisabledDependents}
          />
          <Text style={styles.hint}>{t('disabledHint')}</Text>
          <View style={[styles.toggleRow, { marginTop: 12 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>{t('newTaxpayer')}</Text>
              <Text style={styles.hint}>{t('newTaxpayerHint')}</Text>
            </View>
            <Switch value={isNewTaxpayer} onValueChange={setIsNewTaxpayer} trackColor={{ false: '#ccc', true: GREEN }} thumbColor="#fff" />
          </View>
        </View>

        {/* ── Calculate ── */}
        <TouchableOpacity style={styles.calcBtn} onPress={handleCalculate} activeOpacity={0.85}>
          <Text style={styles.calcBtnText}>{t('calcBtn')}</Text>
        </TouchableOpacity>

        {/* ── Error ── */}
        {result?.errorKey && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{t(result.errorKey)}</Text>
          </View>
        )}

        {/* ── Results ── */}
        {result && !result.errorKey && (
          <ResultCard
            ref={resultCardRef}
            result={result}
            isSalaried={isSalaried}
            showWatermark={showWatermark}
            onSharePress={() => setShareModalVisible(true)}
          />
        )}

        <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.8}>
          <Text style={styles.resetBtnText}>{t('resetBtn')}</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>{t('footer')}</Text>
      </ScrollView>

      {/* ── Share Modal ── */}
      <ShareModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        result={result}
        isSalaried={isSalaried}
        cardRef={resultCardRef}
        showWatermark={showWatermark}
        onToggleWatermark={setShowWatermark}
      />
    </View>
  );
}
