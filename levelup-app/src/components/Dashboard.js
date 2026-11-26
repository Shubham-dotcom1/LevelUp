import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useFitTrack } from '../context/FitTrackContext';
import { DASHBOARD_TABS } from '../constants/fitnessData';
import { getRankInfo, calcLevelInfo } from '../utils/fitnessMath';
import { styles } from '../styles/theme';
import OverviewTab from './tabs/OverviewTab';
import WorkoutTab from './tabs/WorkoutTab';
import DietTab from './tabs/DietTab';
import CaloriesTab from './tabs/CaloriesTab';
import FriendsTab from './tabs/FriendsTab';
import ChatTab from './tabs/ChatTab';

export default function Dashboard() {
  const { answers, appData, activeTab, setActiveTab } = useFitTrack();
  const { current: rank } = getRankInfo(appData.streak);
  const levelInfo = calcLevelInfo(appData.xp);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#060D16" />
      <View style={styles.header}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={styles.title}>LevelUp</Text>
          <Text style={styles.subTitle}>
            {answers.gender}, {answers.age}y • {answers.goal} ({answers.weightKg}kg ➔ {answers.targetWeightKg}kg)
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.badge}>🔥 {appData.streak}d</Text>
          <Text style={[styles.badge, { backgroundColor: '#1E293B', borderColor: '#38BDF8' }]}>
            Lv.{levelInfo.level}
          </Text>
          <Text style={[styles.badge, { backgroundColor: '#1E3A8A', borderColor: '#3B82F6' }]}>{rank.name}</Text>
        </View>
      </View>

      <View style={styles.navWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.nav}>
          {DASHBOARD_TABS.map(([key, label]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setActiveTab(key)}
              style={[styles.navBtn, activeTab === key && styles.navBtnActive]}
            >
              <Text style={[styles.navText, activeTab === key && styles.navTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'workouts' && <WorkoutTab />}
          {activeTab === 'diet' && <DietTab />}
          {activeTab === 'calories' && <CaloriesTab />}
          {activeTab === 'friends' && <FriendsTab />}
          {activeTab === 'chat' && <ChatTab />}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
