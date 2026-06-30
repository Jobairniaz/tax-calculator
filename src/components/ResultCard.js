import React, { forwardRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Row from './Row';
import { fmt } from '../utils/taxCalc';
import { GREEN, GOLD } from '../constants';
import styles from '../styles';

const ResultCard = forwardRef(function ResultCard({ result, isSalaried, t, showWatermark, onSharePress }, ref) {
  return (
    <View>
      {/* This View is captured by captureRef for image sharing */}
      <View ref={ref} collapsable={false} style={styles.card}>
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

        {showWatermark && <Watermark />}
      </View>

      {/* Share button lives outside the captured ref so it doesn't appear in the image */}
      <TouchableOpacity style={cardStyles.shareBtn} onPress={onSharePress} activeOpacity={0.85}>
        <Text style={cardStyles.shareBtnIcon}>↑</Text>
        <Text style={cardStyles.shareBtnText}>{t.shareResult}</Text>
      </TouchableOpacity>
    </View>
  );
});

function Watermark() {
  return (
    <View style={cardStyles.watermark}>
      <View style={cardStyles.watermarkDot} />
      <Text style={cardStyles.watermarkText}>Tax Koto</Text>
      <Text style={cardStyles.watermarkSub}> · BD Income Tax Calculator</Text>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GREEN,
    borderRadius: 10,
    paddingVertical: 11,
    marginTop: 10,
    marginBottom: 4,
    gap: 6,
  },
  shareBtnIcon: { color: '#fff', fontSize: 15, fontWeight: '700' },
  shareBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  watermark: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  watermarkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GREEN,
    marginRight: 6,
  },
  watermarkText: { fontSize: 12, fontWeight: '800', color: GREEN, letterSpacing: 0.3 },
  watermarkSub: { fontSize: 11, color: '#888' },
});

export default ResultCard;
