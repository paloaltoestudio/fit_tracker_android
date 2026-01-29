import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TABS = [
  { key: 'home', label: 'Home', icon: 'home-outline', iconActive: 'home' },
  { key: 'weight', label: 'Weight', icon: 'scale-outline', iconActive: 'scale' },
  { key: 'body', label: 'Body', icon: 'body-outline', iconActive: 'body' },
  { key: 'workouts', label: 'Workouts', icon: 'barbell-outline', iconActive: 'barbell' },
  { key: 'profile', label: 'Profile', icon: 'person-outline', iconActive: 'person' },
];

export default function BottomTabBar({ activeTab, onTabPress }) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            activeOpacity={0.8}
            onPress={() => onTabPress(tab.key)}
          >
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              <Ionicons
                name={isActive ? tab.iconActive : tab.icon}
                size={24}
                color={isActive ? colors.primary : colors.mutedText}
              />
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const colors = {
  background: '#070B14', // hsl(222 47% 6%)
  card: '#0B1120', // hsl(222 47% 9%)
  border: '#1B2438', // hsl(222 47% 16%)
  text: '#EAF2FF',
  mutedText: '#7D8AA3', // hsl-ish muted
  primary: '#00FFD1', // hsl(174 100% 50%)
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(0, 255, 209, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 209, 0.25)',
  },
  label: {
    marginTop: 6,
    fontSize: 12,
    color: colors.mutedText,
  },
  labelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});

