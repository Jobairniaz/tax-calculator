import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { parse, fmt } from '../utils/taxCalc';
import { GREEN } from '../constants';
import styles from '../styles';

export default function PeriodRow({ period, idx, openPicker, onTogglePicker, onUpdate, onRemove, canRemove }) {
  const { t } = useTranslation();
  const fyMonths = t('fyMonths', { returnObjects: true });
  const isFromOpen = openPicker?.id === period.id && openPicker?.field === 'from';
  const isToOpen = openPicker?.id === period.id && openPicker?.field === 'to';
  const numMonths = period.toIdx - period.fromIdx + 1;
  const amt = parse(period.amount);
  const monthlyAmt = period.isMonthly ? amt : amt / 12;
  const subtotal = monthlyAmt * numMonths;

  return (
    <View style={styles.periodCard}>
      <View style={styles.periodHeader}>
        <Text style={styles.periodLabel}>{t('periodLabel', { value: idx + 1 })}</Text>
        <View style={styles.periodHeaderRight}>
          {numMonths > 0 && (
            <View style={styles.periodBadge}>
              <Text style={styles.periodBadgeText}>{t('months', { value: numMonths })}</Text>
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
          <Text style={styles.periodDateLabel}>{t('from')}</Text>
          <TouchableOpacity
            style={[styles.monthBtn, isFromOpen && styles.monthBtnActive]}
            onPress={() => onTogglePicker(period.id, 'from')}
            activeOpacity={0.8}
          >
            <Text style={[styles.monthBtnText, isFromOpen && styles.monthBtnTextActive]}>
              {fyMonths[period.fromIdx]}
            </Text>
            <Text style={styles.monthBtnArrow}>{isFromOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.periodDateSep}>
          <Text style={styles.periodDateArrow}>→</Text>
        </View>

        <View style={styles.periodDateCol}>
          <Text style={styles.periodDateLabel}>{t('to')}</Text>
          <TouchableOpacity
            style={[styles.monthBtn, isToOpen && styles.monthBtnActive]}
            onPress={() => onTogglePicker(period.id, 'to')}
            activeOpacity={0.8}
          >
            <Text style={[styles.monthBtnText, isToOpen && styles.monthBtnTextActive]}>
              {fyMonths[period.toIdx]}
            </Text>
            <Text style={styles.monthBtnArrow}>{isToOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isFromOpen && (
        <ScrollView style={styles.monthPickerScroll} nestedScrollEnabled showsVerticalScrollIndicator={false}>
          {fyMonths.map((m, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.monthPickerItem, period.fromIdx === i && styles.monthPickerItemActive]}
              onPress={() => {
                onUpdate(period.id, { fromIdx: i, toIdx: Math.max(i, period.toIdx) });
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
          {fyMonths.map((m, i) => (
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
          placeholder={t('salaryAmountPlaceholder')}
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
              {t('perMonth')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodModeBtn, !period.isMonthly && styles.periodModeBtnActive]}
            onPress={() => onUpdate(period.id, { isMonthly: false })}
            activeOpacity={0.7}
          >
            <Text style={[styles.periodModeBtnText, !period.isMonthly && styles.periodModeBtnTextActive]}>
              {t('perYear')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {subtotal > 0 && (
        <Text style={styles.periodSubtotal}>
          {t('subtotal', { value: fmt(subtotal) })}
        </Text>
      )}
    </View>
  );
}
