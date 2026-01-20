import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function WeightChart({ weightRecords }) {
  if (weightRecords.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Weight Chart</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No data to display</Text>
          <Text style={styles.emptySubtext}>Add weight records to see the chart</Text>
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
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
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
  const weights = weightRecords.map((r) => r.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const avgWeight = (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1);
  const latestWeight = weights[weights.length - 1];
  const firstWeight = weights[0];
  const difference = (latestWeight - firstWeight).toFixed(1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weight Chart</Text>
      
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          yAxisSuffix=" kg"
          yAxisInterval={1}
        />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Current</Text>
          <Text style={styles.statValue}>{latestWeight} kg</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Average</Text>
          <Text style={styles.statValue}>{avgWeight} kg</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Min</Text>
          <Text style={styles.statValue}>{minWeight} kg</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Max</Text>
          <Text style={styles.statValue}>{maxWeight} kg</Text>
        </View>
      </View>

      {weightRecords.length > 1 && (
        <View style={styles.differenceContainer}>
          <Text style={styles.differenceLabel}>Total Change:</Text>
          <Text
            style={[
              styles.differenceValue,
              parseFloat(difference) >= 0 ? styles.positive : styles.negative,
            ]}
          >
            {difference > 0 ? '+' : ''}{difference} kg
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
});
