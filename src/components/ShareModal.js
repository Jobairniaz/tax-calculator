import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  StyleSheet,
  Share,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { GREEN, GREEN_LIGHT } from '../constants';
import { fmt } from '../utils/taxCalc';

export default function ShareModal({ visible, onClose, result, isSalaried, cardRef, showWatermark, onToggleWatermark }) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);

  async function handleShareImage() {
    if (!cardRef?.current) return;
    setBusy(true);
    try {
      const uri = await captureRef(cardRef, { format: 'png', quality: 1 });
      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: t('shareTitle'),
          UTI: 'public.png',
        });
      }
    } catch (_) {
      // silently fail — user cancelled or device doesn't support sharing
    } finally {
      setBusy(false);
      onClose();
    }
  }

  async function handleShareText() {
    setBusy(true);
    try {
      const text = buildShareText(result, isSalaried, t, showWatermark);
      await Share.share({ message: text, title: t('shareTitle') });
    } catch (_) {
      // silently fail — user cancelled
    } finally {
      setBusy(false);
      onClose();
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={modalStyles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={modalStyles.sheet}>
        <View style={modalStyles.handle} />
        <Text style={modalStyles.title}>{t('shareResult')}</Text>

        {/* Watermark toggle */}
        <View style={modalStyles.toggleRow}>
          <Text style={modalStyles.toggleLabel}>{t('includeWatermark')}</Text>
          <Switch
            value={showWatermark}
            onValueChange={onToggleWatermark}
            trackColor={{ false: '#ccc', true: GREEN }}
            thumbColor="#fff"
          />
        </View>

        {busy ? (
          <View style={modalStyles.busyRow}>
            <ActivityIndicator color={GREEN} />
            <Text style={modalStyles.busyText}>{t('sharing')}</Text>
          </View>
        ) : (
          <View style={modalStyles.btnGroup}>
            <TouchableOpacity style={modalStyles.primaryBtn} onPress={handleShareImage} activeOpacity={0.85}>
              <Text style={modalStyles.primaryBtnIcon}>🖼</Text>
              <Text style={modalStyles.primaryBtnText}>{t('shareAsImage')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={modalStyles.secondaryBtn} onPress={handleShareText} activeOpacity={0.85}>
              <Text style={modalStyles.secondaryBtnIcon}>📋</Text>
              <Text style={modalStyles.secondaryBtnText}>{t('shareAsText')}</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
          <Text style={modalStyles.cancelBtnText}>✕</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

function buildShareText(result, isSalaried, t, showWatermark) {
  const c = value => t('currency', { value });
  const dc = value => t('deductCurrency', { value });
  const lines = [
    `📊 ${t('shareTitle')}`,
    `${'─'.repeat(36)}`,
    `${t('grossAnnual')}: ${c(fmt(result.gross))}`,
  ];

  if (result.perfBonus > 0) lines.push(`${t('perfBonusRow').trim()}: ${c(fmt(result.perfBonus))}`);
  if (result.festBonus > 0) lines.push(`${t('festBonusRow').trim()}: ${c(fmt(result.festBonus))}`);
  if (isSalaried) lines.push(`${t('salaryExemption')}: ${dc(fmt(result.salaryExemption))}`);

  lines.push(
    `${t('taxableIncome')}: ${c(fmt(result.taxableIncome))}`,
    `${t('taxFreeLimit')}: ${c(fmt(result.taxFreeLimit))}`,
    `${'─'.repeat(36)}`,
    `📈 ${t('slabHeader')}`,
  );

  for (const s of result.slabDetails) {
    if (s.rate > 0) {
      lines.push(`  ${t(s.labelKey, { value: fmt(s.limit) })} @ ${(s.rate * 100).toFixed(0)}%: ${c(fmt(s.tax))}`);
    }
  }

  lines.push(
    `${'─'.repeat(36)}`,
    `${t('grossTax')}: ${c(fmt(result.grossTax))}`,
  );

  if (result.rebate > 0) lines.push(`${t('rebate')}: ${dc(fmt(result.rebate))}`);
  if (result.aitPaid > 0) lines.push(`${t('aitPaid')}: ${dc(fmt(result.aitPaid))}`);

  lines.push(
    `${'─'.repeat(36)}`,
    `💰 ${t('netTax')}: ${c(fmt(result.netTaxPayable))}`,
  );

  if (showWatermark) {
    lines.push(``, `— Tax Koto · BD Income Tax Calculator`);
  }

  return lines.join('\n');
}

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
    marginBottom: 18,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: GREEN_LIGHT,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  toggleLabel: { fontSize: 13.5, color: '#1a1a2e', flex: 1, paddingRight: 8 },
  btnGroup: { gap: 10 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  primaryBtnIcon: { fontSize: 18 },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f2f5',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  secondaryBtnIcon: { fontSize: 18 },
  secondaryBtnText: { color: '#1a1a2e', fontSize: 15, fontWeight: '600' },
  busyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 20,
  },
  busyText: { fontSize: 15, color: GREEN },
  cancelBtn: {
    alignSelf: 'center',
    marginTop: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f2f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: { fontSize: 14, color: '#666', fontWeight: '700' },
});
