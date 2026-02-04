import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import WeightChart from '../components/WeightChart';
import { t } from '../i18n';

export default function HomeScreen({ onNavigate }) {
  const [weights, setWeights] = useState([]);
  const [muscleIndexRecords, setMuscleIndexRecords] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getWeights();
        const arr = Array.isArray(data) ? data : [];
        arr.sort((a, b) => new Date(a.date) - new Date(b.date));
        setWeights(arr);
      } catch (e) {
        console.error('Home weights load error:', e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getMetrics('muscle_index');
        const arr = Array.isArray(data) ? data : [];
        arr.sort((a, b) => new Date(a.date) - new Date(b.date));
        setMuscleIndexRecords(arr);
      } catch (e) {
        console.error('Home muscle index load error:', e);
      }
    })();
  }, []);

  const currentWeight = useMemo(() => {
    if (!weights.length) return null;
    return weights[weights.length - 1]?.weight ?? null;
  }, [weights]);

  const weightDelta = useMemo(() => {
    if (weights.length < 2) return null;
    const last = Number(weights[weights.length - 1]?.weight);
    const prev = Number(weights[weights.length - 2]?.weight);
    if (Number.isNaN(last) || Number.isNaN(prev)) return null;
    return last - prev;
  }, [weights]);

  const currentMuscleIndex = useMemo(() => {
    if (!muscleIndexRecords.length) return null;
    const last = muscleIndexRecords[muscleIndexRecords.length - 1];
    const idx = last?.value?.index;
    return typeof idx === 'number' ? idx : null;
  }, [muscleIndexRecords]);

  const muscleIndexDelta = useMemo(() => {
    if (muscleIndexRecords.length < 2) return null;
    const last = muscleIndexRecords[muscleIndexRecords.length - 1]?.value?.index;
    const prev = muscleIndexRecords[muscleIndexRecords.length - 2]?.value?.index;
    if (typeof last !== 'number' || typeof prev !== 'number') return null;
    return last - prev;
  }, [muscleIndexRecords]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>{t('home.welcomeBack')}</Text>
        <Text style={styles.heroTitle}>{t('home.heroTitle')}</Text>

        <View style={styles.grid2}>
          {/* Current weight card */}
          <View style={[styles.card, styles.cardHalf]}>
            <View style={styles.cardTopRow}>
              <View style={[styles.iconBadge, { backgroundColor: 'rgba(0,255,209,0.12)' }]}>
                <Ionicons name="scale-outline" size={22} color={colors.primary} />
              </View>
              <View style={[styles.pill, weightDelta != null && weightDelta < 0 ? styles.pillDown : styles.pillUp]}>
                <Ionicons
                  name={weightDelta != null && weightDelta < 0 ? 'arrow-down' : 'arrow-up'}
                  size={14}
                  color={weightDelta != null && weightDelta < 0 ? colors.destructive : colors.success}
                />
                <Text style={[styles.pillText, { color: weightDelta != null && weightDelta < 0 ? colors.destructive : colors.success }]}>
                  {weightDelta == null ? '—' : `${Math.abs(weightDelta).toFixed(1)}kg`}
                </Text>
              </View>
            </View>
            <Text style={styles.cardLabel}>{t('home.currentWeight')}</Text>
            <View style={styles.valueRow}>
              <Text style={styles.cardValue}>{currentWeight == null ? '—' : Number(currentWeight).toFixed(1)}</Text>
              <Text style={styles.cardUnit}>{t('home.kg')}</Text>
            </View>
          </View>

          {/* Muscle index card (from DB) */}
          <TouchableOpacity
            style={[styles.card, styles.cardHalf]}
            activeOpacity={0.8}
            onPress={() => onNavigate('body')}
          >
            <View style={styles.cardTopRow}>
              <View style={[styles.iconBadge, { backgroundColor: 'rgba(34,197,94,0.12)' }]}>
                <Ionicons name="pulse-outline" size={22} color={colors.success} />
              </View>
              {muscleIndexDelta != null && (
                <View style={[styles.pill, muscleIndexDelta >= 0 ? styles.pillUp : styles.pillDown]}>
                  <Ionicons
                    name={muscleIndexDelta >= 0 ? 'arrow-up' : 'arrow-down'}
                    size={14}
                    color={muscleIndexDelta >= 0 ? colors.success : colors.destructive}
                  />
                  <Text style={[styles.pillText, { color: muscleIndexDelta >= 0 ? colors.success : colors.destructive }]}>
                    {muscleIndexDelta >= 0 ? '+' : ''}{muscleIndexDelta.toFixed(1)}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.cardLabel}>{t('home.muscleIndex')}</Text>
            <View style={styles.valueRow}>
              <Text style={styles.cardValue}>{currentMuscleIndex == null ? '—' : Number(currentMuscleIndex).toFixed(1)}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Streak card */}
        <View style={[styles.card, styles.cardWide]}>
          <View style={styles.cardTopRow}>
            <View style={[styles.iconBadge, { backgroundColor: 'rgba(245,158,11,0.14)' }]}>
              <Ionicons name="flame-outline" size={22} color={colors.warning} />
            </View>
          </View>
          <Text style={styles.cardLabel}>{t('home.workoutStreak')}</Text>
          <View style={styles.valueRow}>
            <Text style={[styles.cardValue, { color: colors.warning }]}>12</Text>
            <Text style={styles.cardUnit}>{t('home.days')}</Text>
          </View>
          <Text style={styles.mutedSmall}>{t('home.keepPushing')}</Text>
        </View>

        {/* This week trainings */}
        <View style={[styles.card, styles.cardWide]}>
          <Text style={styles.sectionTitle}>{t('home.thisWeek')}</Text>
          <View style={styles.weekRow}>
            {[
              { d: 'M', done: true },
              { d: 'T', done: true },
              { d: 'W', done: true },
              { d: 'T', done: true },
              { d: 'F', done: false },
              { d: 'S', done: false },
              { d: 'S', done: false },
            ].map((x, idx) => (
              <View key={`${x.d}-${idx}`} style={styles.dayCol}>
                <View style={[styles.dayDot, x.done ? styles.dayDotDone : styles.dayDotEmpty]}>
                  {x.done && <Ionicons name="checkmark" size={18} color={colors.background} />}
                </View>
                <Text style={styles.dayLabel}>{x.d}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick actions */}
        <Text style={styles.quickTitle}>{t('home.quickActions')}</Text>
        <View style={styles.quickRow}>
          <TouchableOpacity
            style={styles.quickItem}
            activeOpacity={0.8}
            onPress={() => onNavigate('weight')}
          >
            <View style={[styles.quickIcon, { backgroundColor: 'rgba(0,255,209,0.10)' }]}>
              <Ionicons name="add" size={28} color={colors.primary} />
            </View>
            <Text style={styles.quickLabel}>{t('home.logWeight')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickItem}
            activeOpacity={0.8}
            onPress={() => Alert.alert(t('home.comingSoon'), t('home.comingSoonStats'))}
          >
            <View style={[styles.quickIcon, { backgroundColor: 'rgba(34,197,94,0.10)' }]}>
              <Ionicons name="trending-up" size={26} color={colors.success} />
            </View>
            <Text style={styles.quickLabel}>{t('home.viewStats')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickItem}
            activeOpacity={0.8}
            onPress={() => Alert.alert(t('home.comingSoon'), t('home.comingSoonGoal'))}
          >
            <View style={[styles.quickIcon, { backgroundColor: 'rgba(245,158,11,0.10)' }]}>
              <Ionicons name="disc-outline" size={26} color={colors.warning} />
            </View>
            <Text style={styles.quickLabel}>{t('home.setGoal')}</Text>
          </TouchableOpacity>
        </View>

        {/* Weight progress chart - same component as Weight page, dark theme */}
        <View style={styles.chartSection}>
          <WeightChart weightRecords={weights} variant="dark" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const colors = {
  background: '#070B14', // hsl(222 47% 6%)
  card: '#0B1120', // hsl(222 47% 9%)
  card2: '#091022',
  text: '#EAF2FF',
  mutedText: '#7D8AA3',
  primary: '#00FFD1', // hsl(174 100% 50%)
  success: '#22C55E',
  warning: '#F59E0B',
  destructive: '#EF4444',
  border: '#1B2438',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 22,
    paddingBottom: 140,
  },
  kicker: {
    color: colors.mutedText,
    fontSize: 16,
    marginTop: 8,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
    marginTop: 8,
  },
  grid2: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 22,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHalf: {
    flex: 1,
    minHeight: 140,
  },
  cardWide: {
    marginTop: 18,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconBadge: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 6,
    borderWidth: 1,
  },
  pillUp: {
    backgroundColor: 'rgba(34,197,94,0.10)',
    borderColor: 'rgba(34,197,94,0.18)',
  },
  pillDown: {
    backgroundColor: 'rgba(239,68,68,0.10)',
    borderColor: 'rgba(239,68,68,0.18)',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '700',
  },
  cardLabel: {
    color: colors.mutedText,
    fontSize: 14,
    marginBottom: 10,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  cardValue: {
    color: colors.text,
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: -1,
  },
  cardUnit: {
    color: colors.mutedText,
    fontSize: 20,
    paddingBottom: 6,
  },
  mutedSmall: {
    color: colors.mutedText,
    marginTop: 10,
    fontSize: 14,
  },
  sectionTitle: {
    color: colors.mutedText,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    columnGap: 10
  },
  dayCol: {
    alignItems: 'center',
    width: 20,
  },
  dayDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  dayDotDone: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  dayDotEmpty: {
    backgroundColor: '#111A2F',
    borderWidth: 1,
    borderColor: '#121C33',
  },
  dayLabel: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '600',
  },
  quickTitle: {
    marginTop: 22,
    marginBottom: 12,
    color: colors.mutedText,
    fontSize: 18,
    fontWeight: '600',
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  quickItem: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quickLabel: {
    color: colors.mutedText,
    fontSize: 14,
    textAlign: 'center',
  },
  chartSection: {
    marginTop: 22,
  },
});
