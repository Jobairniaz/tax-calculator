import React from 'react';
import { View, Text } from 'react-native';
import styles from '../styles';

export default function Row({ label, value, bold, muted, green }) {
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
