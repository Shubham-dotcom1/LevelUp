import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useFitTrack } from '../../context/FitTrackContext';
import { MILESTONES } from '../../constants/fitnessData';
import {
  calcBMRAndTDEE,
  calcPersonalTargets,
  calcLevelInfo,
  calcFitnessAttributes,
  getRankInfo
} from '../../utils/fitnessMath';
import { styles } from '../../styles/theme';

export default function OverviewTab() {
  const {
    answers,
    appData,
    loadingAiPlan,
    fetchFitTrackAiPlan,
    resetOnboarding,
    addStreak,
    resetStreak,
    adjustWater
  } = useFitTrack();

  const loggedCals = appData.foodLog.reduce((s, f) => s + f.cal, 0);
  const loggedProt = appData.foodLog.reduce((s, f) => s + f.prot, 0);
  const { current: rank, next: nextRank, pct: rankPct } = getRankInfo(appData.streak);
  const calc = calcBMRAndTDEE(answers);
  const targets = calcPersonalTargets(answers);
  const waterTargetCups = Math.ceil(Number(targets.waterCups) || 10);
  const levelInfo = calcLevelInfo(appData.xp);
  const attributes = calcFitnessAttributes(answers, appData);

  const dailyQuests = [
    {
      title: "Complete Today's Workout",
      progress: `${appData.todayWorkoutDone ? 1 : 0} / 1`,
      done: Boolean(appData.todayWorkoutDone),
      xp: '+60 XP'
    },
    {
      title: 'Log at least 2 Meals / Foods',
      progress: `${Math.min(2, appData.foodLog.length)} / 2`,
      done: appData.foodLog.length >= 2,
      xp: '+20 XP'
    },
    {
      title: `Hydration Goal (${waterTargetCups} cups)`,
      progress: `${appData.waterCups} / ${waterTargetCups}`,
      done: appData.waterCups >= waterTargetCups,
      xp: '+5 XP/cup'
    }
  ];

  return (
    <>
      {/* Level, XP & Consistency Rank Card */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardSub}>Level & Consistency Rank</Text>
          <Text style={[styles.pill, styles.pillBlue]}>
            Lv. {levelInfo.level} • {levelInfo.xp} XP
          </Text>
        </View>
        <Text style={styles.bigNum}>
          {rank.name} • {appData.streak} Days Streak
        </Text>

        <View style={{ marginTop: 10 }}>
          <View style={styles.rowBetween}>
            <Text style={styles.muted}>XP to Level {levelInfo.level + 1}</Text>
            <Text style={styles.muted}>
              {levelInfo.levelXp} / {levelInfo.nextLevelXp} XP
            </Text>
          </View>
          <View style={[styles.barWrap, { marginVertical: 6 }]}>
            <View style={[styles.barFill, { width: `${levelInfo.pct}%`, backgroundColor: '#A855F7' }]} />
          </View>
        </View>

        <View style={{ marginTop: 4 }}>
          <View style={styles.rowBetween}>
            <Text style={styles.muted}>Rank Progress</Text>
            <Text style={styles.muted}>
              {nextRank ? `Next: ${nextRank.name} (${nextRank.min}d)` : 'Max Rank Reached!'}
            </Text>
          </View>
          <View style={[styles.barWrap, { marginVertical: 6 }]}>
            <View style={[styles.barFill, { width: `${rankPct}%` }]} />
          </View>
        </View>

        <Text style={[styles.muted, { marginTop: 2 }]}>
          Today's Intake: {loggedCals} / {appData.targetCalories} kcal ({loggedProt}g Protein)
        </Text>
      </View>

      {/* Daily Quests & Water Tracker */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Daily Quests & Hydration</Text>
        {dailyQuests.map((q) => (
          <View key={q.title} style={[styles.questRow, q.done && styles.questRowDone]}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.bold}>
                {q.done ? '✓ ' : '○ '}
                {q.title}
              </Text>
              <Text style={styles.muted}>Progress: {q.progress}</Text>
            </View>
            <Text style={[styles.pill, q.done ? styles.pillGreen : styles.pillGray]}>{q.xp}</Text>
          </View>
        ))}

        <View style={styles.waterControls}>
          <View>
            <Text style={styles.bold}>💧 Water Tracker</Text>
            <Text style={styles.muted}>
              {appData.waterCups} / {waterTargetCups} cups today
            </Text>
          </View>
          <View style={styles.row}>
            <TouchableOpacity style={styles.waterCircleBtn} onPress={() => adjustWater(-1)}>
              <Text style={styles.bold}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.waterCircleBtn, { backgroundColor: '#2563EB' }]}
              onPress={() => adjustWater(1)}
            >
              <Text style={[styles.bold, { color: '#FFFFFF' }]}>+1</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Core Fitness Attributes */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Performance Attributes</Text>
        {attributes.map((attr) => (
          <View key={attr.key} style={styles.statRow}>
            <View style={styles.rowBetween}>
              <Text style={styles.bold}>{attr.label}</Text>
              <Text style={styles.muted}>{attr.value} / 100</Text>
            </View>
            <View style={styles.statTrack}>
              <View
                style={[
                  styles.statFill,
                  { width: `${attr.value}%`, backgroundColor: attr.color }
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Onboarding Profile Summary */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Onboarding Profile</Text>
        <Text style={styles.muted}>
          Level: {answers.fitnessLevel} | Focus: {answers.focusAreas.join(', ')}
        </Text>
        <Text style={styles.muted}>
          Activity: {answers.activityLevel} | Health: {answers.healthIssue}
        </Text>
        <Text style={styles.muted}>
          Equipment: {answers.equipment} | Schedule: {answers.workoutFrequency}x / week ({answers.workoutDays.map((d) => d.slice(0, 3)).join(', ')})
        </Text>
        <Text style={styles.muted}>
          Height: {answers.heightCm} cm ({answers.heightFt}) | Weight: {answers.weightKg} kg ➔ Target: {answers.targetWeightKg} kg
        </Text>
        <Text style={styles.muted}>
          Daily Macro Targets: {calc.protein}g P • {calc.carbs}g C • {calc.fat}g F
        </Text>

        <TouchableOpacity
          onPress={() => fetchFitTrackAiPlan(answers)}
          disabled={loadingAiPlan}
          style={[styles.btn, { marginTop: 10, alignItems: 'center' }, loadingAiPlan && { opacity: 0.65 }]}
        >
          <Text style={styles.btnText}>
            {loadingAiPlan ? 'Generating LevelUp AI Plan...' : '⚡ Re-generate Workout & Diet Plan (Smart AI)'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={resetOnboarding} style={[styles.btnOutline, { marginTop: 8, alignItems: 'center' }]}>
          <Text style={styles.btnOutlineText}>Re-run Onboarding Setup</Text>
        </TouchableOpacity>
      </View>

      {/* Live Presentation Controls */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Live Presentation Controls</Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.btn} onPress={() => addStreak(1)}>
            <Text style={styles.btnText}>+1 Day</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnOutline} onPress={() => addStreak(5)}>
            <Text style={styles.btnOutlineText}>+5 Days</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnOutline} onPress={resetStreak}>
            <Text style={styles.btnOutlineText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Consistency Milestones */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Consistency Milestones</Text>
        {MILESTONES.map((m) => {
          const unlocked = appData.streak >= m.days;
          return (
            <View key={m.title} style={[styles.listRow, unlocked && styles.unlockedRow]}>
              <View>
                <Text style={styles.bold}>{m.title}</Text>
                <Text style={styles.muted}>{m.days} Days Streak</Text>
              </View>
              <Text style={[styles.pill, unlocked ? styles.pillGreen : styles.pillGray]}>
                {unlocked ? 'Unlocked' : 'Locked'}
              </Text>
            </View>
          );
        })}
      </View>
    </>
  );
}
