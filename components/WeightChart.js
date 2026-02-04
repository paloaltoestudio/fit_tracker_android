import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { t } from '../i18n';

const screenWidth = Dimensions.get('window').width;

const darkTheme = {
  background: '#0B1120',
  lines: '#cccccc',
  cardBorder: '#1B2438',
  text: '#EAF2FF',
  mutedText: '#7D8AA3',
  primary: '#00FFD1',
  success: '#22C55E',
  destructive: '#EF4444',
};

export default function WeightChart({ weightRecords, variant }) {
  const isDark = variant === 'dark';

  if (weightRecords.length === 0) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Text style={[styles.title, isDark && styles.titleDark]}>{t('weight.chartTitle')}</Text>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>{t('common.noData')}</Text>
          <Text style={[styles.emptySubtext, isDark && styles.emptySubtextDark]}>{t('weight.chartEmpty')}</Text>
        </View>
      </View>
    );
  }

  // Prepare data for the chart
  const labels = weightRecords.map((record) => {
    const date = new Date(record.date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });

  const data = weightRecords.map((record) => record.weight);

  const chartData = {
    labels: labels.length > 7 ? labels.slice(-7) : labels, // Show last 7 points if more than 7
    datasets: [
      {
        data: data.length > 7 ? data.slice(-7) : data,
        color: (opacity = 1) =>
          isDark ? `rgba(0, 255, 209, ${opacity})` : `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = isDark
    ? {
        backgroundColor: darkTheme.background,
        backgroundGradientFrom: darkTheme.background,
        backgroundGradientTo: darkTheme.background,
        decimalPlaces: 1,
        color: () => darkTheme.primary,
        labelColor: () => darkTheme.mutedText,
        style: { borderRadius: 16 },
        propsForDots: {
          r: '6',
          strokeWidth: '2',
          stroke: darkTheme.lines,
        },
        propsForBackgroundLines: {
          stroke: 'rgba(125, 138, 163, 0.35)',
          strokeWidth: 1,
        },
      }
    : {
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 1,
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        style: { borderRadius: 16 },
        propsForDots: {
          r: '6',
          strokeWidth: '2',
          stroke: '#4CAF50',
        },
        propsForBackgroundLines: {
          strokeDasharray: '',
          stroke: '#e0e0e0',
          strokeWidth: 1,
        },
      };

  // Calculate statistics
  // Note: weightRecords should be sorted ASC (oldest first) for proper graph display
  const weights = weightRecords.map((r) => r.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const avgWeight = (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1);
  
  // With ASC sorting: first item is oldest, last item is newest
  const firstWeight = weights[0]; // Oldest weight
  const latestWeight = weights[weights.length - 1]; // Newest weight
  const difference = (latestWeight - firstWeight).toFixed(1);

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Text style={[styles.title, isDark && styles.titleDark]}>{t('weight.chartTitle')}</Text>
      
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={[styles.chart, isDark && styles.chartDark]}
          yAxisSuffix=" kg"
          yAxisInterval={1}
        />
      </View>

      <View style={[styles.statsContainer, isDark && styles.statsContainerDark]}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>{t('common.current')}</Text>
          <Text style={[styles.statValue, isDark && styles.statValueDark]}>{latestWeight} {t('home.kg')}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>{t('common.average')}</Text>
          <Text style={[styles.statValue, isDark && styles.statValueDark]}>{avgWeight} {t('home.kg')}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>{t('common.min')}</Text>
          <Text style={[styles.statValue, isDark && styles.statValueDark]}>{minWeight} {t('home.kg')}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>{t('common.max')}</Text>
          <Text style={[styles.statValue, isDark && styles.statValueDark]}>{maxWeight} {t('home.kg')}</Text>
        </View>
      </View>

      {weightRecords.length > 1 && (
        <View style={[styles.differenceContainer, isDark && styles.differenceContainerDark]}>
          <Text style={[styles.differenceLabel, isDark && styles.differenceLabelDark]}>{t('common.totalChange')}:</Text>
          <Text
            style={[
              styles.differenceValue,
              parseFloat(difference) >= 0 ? (isDark ? styles.positiveDark : styles.positive) : (isDark ? styles.negativeDark : styles.negative),
            ]}
          >
            {difference > 0 ? '+' : ''}{difference} {t('home.kg')}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  differenceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  differenceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  differenceValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#f44336',
  },
  // Dark variant (matches Home theme)
  containerDark: {
    backgroundColor: darkTheme.background,
    borderWidth: 1,
    borderColor: darkTheme.cardBorder,
    borderRadius: 20,
  },
  titleDark: {
    color: darkTheme.text,
  },
  emptyTextDark: {
    color: darkTheme.mutedText,
  },
  emptySubtextDark: {
    color: darkTheme.mutedText,
  },
  chartDark: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsContainerDark: {
    borderTopColor: darkTheme.cardBorder,
  },
  statLabelDark: {
    color: darkTheme.mutedText,
  },
  statValueDark: {
    color: darkTheme.text,
  },
  differenceContainerDark: {
    borderTopColor: darkTheme.cardBorder,
  },
  differenceLabelDark: {
    color: darkTheme.text,
  },
  positiveDark: {
    color: darkTheme.success,
  },
  negativeDark: {
    color: darkTheme.destructive,
  },
});
