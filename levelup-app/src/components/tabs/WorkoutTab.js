import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useFitTrack } from '../../context/FitTrackContext';
import { WORKOUT_ROUTINES, WORKOUT_LEVELS } from '../../constants/fitnessData';
import { parseRestSeconds, formatDuration } from '../../utils/fitnessMath';
import { styles } from '../../styles/theme';

export default function WorkoutTab() {
  const {
    answers,
    appData,
    aiPlan,
    loadingAiPlan,
    fetchFitTrackAiPlan,
    selectedRoutine,
    selectedLevel,
    setWorkoutOption,
    addStreak,
    completeLiveWorkout
  } = useFitTrack();

  const [viewMode, setViewMode] = useState(aiPlan?.workouts ? 'ai' : 'standard');
  const showAi = viewMode === 'ai' && Array.isArray(aiPlan?.workouts) && aiPlan.workouts.length > 0;

  // Interactive Live Workout Player State
  const [liveActive, setLiveActive] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [restSec, setRestSec] = useState(0);
  const [completedSetsMap, setCompletedSetsMap] = useState({});
  const [weightInputs, setWeightInputs] = useState({});
  const [lastCompletedBanner, setLastCompletedBanner] = useState('');

  const activeExercises = useMemo(() => {
    if (showAi) {
      return aiPlan.workouts.map((w) => ({
        exercise: w.exercise,
        sets: Math.max(1, Number(w.sets) || 3),
        reps: w.reps || '10-12 reps',
        rest: w.rest || '60s'
      }));
    }
    const lvl = WORKOUT_LEVELS[selectedLevel];
    return WORKOUT_ROUTINES[selectedRoutine].list.map((name) => ({
      exercise: name,
      sets: lvl.sets,
      reps: lvl.reps,
      rest: lvl.rest
    }));
  }, [showAi, aiPlan, selectedRoutine, selectedLevel]);

  // Elapsed workout timer
  useEffect(() => {
    if (!liveActive) return;
    const timer = setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [liveActive]);

  // Rest countdown timer
  useEffect(() => {
    if (!liveActive || restSec <= 0) return;
    const timer = setInterval(() => {
      setRestSec((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [liveActive, restSec]);

  const startLiveSession = () => {
    setCompletedSetsMap({});
    setElapsedSec(0);
    setRestSec(0);
    setLastCompletedBanner('');
    setLiveActive(true);
  };

  const toggleSet = (exIdx, setIdx, restStr) => {
    const key = `${exIdx}-${setIdx}`;
    const wasDone = Boolean(completedSetsMap[key]);
    const nextMap = { ...completedSetsMap, [key]: !wasDone };
    setCompletedSetsMap(nextMap);

    if (!wasDone) {
      setRestSec(parseRestSeconds(restStr));
    }
  };

  const totalSetsCount = activeExercises.reduce((sum, ex) => sum + ex.sets, 0);
  const doneSetsCount = Object.values(completedSetsMap).filter(Boolean).length;
  const completedExercisesCount = activeExercises.filter((ex, exIdx) =>
    Array.from({ length: ex.sets }, (_, sIdx) => Boolean(completedSetsMap[`${exIdx}-${sIdx}`])).every(Boolean)
  ).length;

  const handleFinishLiveSession = () => {
    const title = showAi
      ? `LevelUp AI (${answers.focusAreas.join(', ')})`
      : `${WORKOUT_ROUTINES[selectedRoutine].label} (${WORKOUT_LEVELS[selectedLevel].label})`;

    const xpEarned = 50 + doneSetsCount * 5;
    const entry = completeLiveWorkout({
      title,
      durationSec: elapsedSec,
      completedExercises: completedExercisesCount,
      completedSets: doneSetsCount,
      totalSets: totalSetsCount,
      xpEarned
    });

    setLiveActive(false);
    setRestSec(0);
    setLastCompletedBanner(
      `Workout saved! ${doneSetsCount}/${totalSetsCount} sets in ${formatDuration(entry.durationSec)} • +${xpEarned} XP & +1 Streak`
    );
  };

  return (
    <>
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Workout Plan ({answers.fitnessLevel})</Text>
          {!liveActive ? (
            <TouchableOpacity
              onPress={async () => {
                await fetchFitTrackAiPlan(answers);
                setViewMode('ai');
              }}
              disabled={loadingAiPlan}
              style={[styles.btnOutline, { paddingVertical: 4, paddingHorizontal: 10 }]}
            >
              <Text style={[styles.btnOutlineText, { fontSize: 11 }]}>
                {loadingAiPlan ? 'Generating...' : '⚡ Smart AI'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setLiveActive(false);
                setRestSec(0);
              }}
              style={[styles.btnOutline, { paddingVertical: 4, paddingHorizontal: 10 }]}
            >
              <Text style={[styles.btnOutlineText, { fontSize: 11, color: '#F87171' }]}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={[styles.muted, { marginBottom: 10 }]}>
          Tailored for Focus Areas ({answers.focusAreas.join(', ')}) with {answers.equipment}
          {answers.healthIssue !== 'None' ? ` • Safe for ${answers.healthIssue}` : ''}:
        </Text>

        {lastCompletedBanner ? (
          <View style={[styles.questRow, styles.questRowDone, { marginBottom: 10 }]}>
            <Text style={{ color: '#4ADE80', fontWeight: '700', fontSize: 12 }}>✓ {lastCompletedBanner}</Text>
          </View>
        ) : null}

        {!liveActive ? (
          <>
            <View style={styles.segmentWrap}>
              <TouchableOpacity
                style={[styles.segmentBtn, viewMode === 'ai' && styles.segmentBtnActive]}
                onPress={() => setViewMode('ai')}
              >
                <Text style={[styles.segmentText, viewMode === 'ai' && styles.segmentTextActive]}>
                  ✨ LevelUp AI Plan
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentBtn, viewMode === 'standard' && styles.segmentBtnActive]}
                onPress={() => setViewMode('standard')}
              >
                <Text style={[styles.segmentText, viewMode === 'standard' && styles.segmentTextActive]}>
                  📋 Standard Splits
                </Text>
              </TouchableOpacity>
            </View>

            {showAi ? (
              <View>
                <Text style={[styles.bold, { color: '#60A5FA', marginBottom: 6 }]}>
                  ✨ LevelUp AI Customized Routine:
                </Text>
                {aiPlan.workouts.map((w, idx) => (
                  <View key={`${w.exercise}-${idx}`} style={styles.listRow}>
                    <Text style={[styles.bold, { flex: 1 }]}>{w.exercise}</Text>
                    <Text style={styles.muted}>
                      {w.sets} sets × {w.reps} • Rest: {w.rest}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View>
                <Text style={[styles.bold, { marginBottom: 8 }]}>Routine Split:</Text>
                <View style={styles.chipWrap}>
                  {Object.entries(WORKOUT_ROUTINES).map(([k, v]) => (
                    <TouchableOpacity
                      key={k}
                      onPress={() => setWorkoutOption(k, undefined)}
                      style={[styles.chip, selectedRoutine === k && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, selectedRoutine === k && styles.chipTextActive]}>
                        {v.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.bold, { marginTop: 12, marginBottom: 6 }]}>Intensity Level:</Text>
                <View style={styles.chipWrap}>
                  {Object.entries(WORKOUT_LEVELS).map(([k, v]) => (
                    <TouchableOpacity
                      key={k}
                      onPress={() => setWorkoutOption(undefined, k)}
                      style={[styles.chip, selectedLevel === k && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, selectedLevel === k && styles.chipTextActive]}>
                        {v.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={{ marginTop: 12 }}>
                  {WORKOUT_ROUTINES[selectedRoutine].list.map((ex) => (
                    <View key={ex} style={styles.listRow}>
                      <Text style={[styles.bold, { flex: 1 }]}>{ex}</Text>
                      <Text style={styles.muted}>
                        {WORKOUT_LEVELS[selectedLevel].sets} sets × {WORKOUT_LEVELS[selectedLevel].reps} •{' '}
                        {WORKOUT_LEVELS[selectedLevel].rest}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.btn, { marginTop: 16, alignItems: 'center' }]}
              onPress={startLiveSession}
            >
              <Text style={styles.btnText}>▶ Start Live Workout Session</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnOutline, { marginTop: 8, alignItems: 'center' }]}
              onPress={() => addStreak(1)}
            >
              <Text style={styles.btnOutlineText}>Quick Complete Today's Workout (+1 Streak, +60 XP)</Text>
            </TouchableOpacity>
          </>
        ) : (
          /* LIVE WORKOUT TRACKER MODE */
          <View>
            <View style={styles.liveBanner}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.bold}>⏱️ Live Session Active</Text>
                  <Text style={styles.muted}>
                    Sets: {doneSetsCount} / {totalSetsCount} • Done: {completedExercisesCount} / {activeExercises.length}
                  </Text>
                </View>
                <Text style={[styles.bigNum, { color: '#60A5FA' }]}>{formatDuration(elapsedSec)}</Text>
              </View>
            </View>

            {restSec > 0 ? (
              <View style={styles.restBanner}>
                <View style={styles.rowBetween}>
                  <View>
                    <Text style={[styles.bold, { color: '#4ADE80' }]}>Rest Countdown</Text>
                    <Text style={styles.muted}>Recover before your next set</Text>
                  </View>
                  <Text style={[styles.bigNum, { color: '#4ADE80' }]}>{formatDuration(restSec)}</Text>
                </View>
                <View style={[styles.row, { marginTop: 10 }]}>
                  <TouchableOpacity
                    style={[styles.btnOutline, { paddingVertical: 5, paddingHorizontal: 10 }]}
                    onPress={() => setRestSec((s) => Math.max(0, s - 15))}
                  >
                    <Text style={styles.btnOutlineText}>-15s</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btnOutline, { paddingVertical: 5, paddingHorizontal: 10 }]}
                    onPress={() => setRestSec((s) => s + 15)}
                  >
                    <Text style={styles.btnOutlineText}>+15s</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, { paddingVertical: 5, paddingHorizontal: 12 }]}
                    onPress={() => setRestSec(0)}
                  >
                    <Text style={styles.btnText}>Skip Rest</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            {activeExercises.map((ex, exIdx) => (
              <View key={`${ex.exercise}-${exIdx}`} style={styles.exerciseLiveCard}>
                <View style={[styles.rowBetween, { marginBottom: 8 }]}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.bold}>{ex.exercise}</Text>
                    <Text style={styles.muted}>
                      {ex.sets} sets × {ex.reps} • Rest {ex.rest}
                    </Text>
                  </View>
                  <TextInput
                    style={styles.weightMiniInput}
                    value={weightInputs[exIdx] || ''}
                    onChangeText={(val) => setWeightInputs((prev) => ({ ...prev, [exIdx]: val }))}
                    keyboardType="numeric"
                    placeholder="kg"
                    placeholderTextColor="#64748B"
                  />
                </View>
                <View style={styles.chipWrap}>
                  {Array.from({ length: ex.sets }, (_, setIdx) => {
                    const checked = Boolean(completedSetsMap[`${exIdx}-${setIdx}`]);
                    return (
                      <TouchableOpacity
                        key={setIdx}
                        onPress={() => toggleSet(exIdx, setIdx, ex.rest)}
                        style={[styles.setPill, checked && styles.setPillDone]}
                      >
                        <Text style={{ color: checked ? '#4ADE80' : '#CBD5E1', fontSize: 12, fontWeight: '700' }}>
                          {checked ? `✓ Set ${setIdx + 1}` : `Set ${setIdx + 1}`}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.btn, { marginTop: 10, alignItems: 'center' }]}
              onPress={handleFinishLiveSession}
            >
              <Text style={styles.btnText}>
                Finish & Claim +{50 + doneSetsCount * 5} XP (+1 Streak)
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Recent Completed Workout Sessions */}
      {Array.isArray(appData.workoutHistory) && appData.workoutHistory.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Workout History</Text>
          {appData.workoutHistory.slice(0, 5).map((item) => (
            <View key={item.id} style={styles.listRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bold}>{item.title}</Text>
                <Text style={styles.muted}>
                  {item.date} • {formatDuration(item.durationSec)} • {item.completedSets}/{item.totalSets} sets
                </Text>
              </View>
              <Text style={[styles.pill, styles.pillGreen]}>+{item.xpEarned} XP</Text>
            </View>
          ))}
        </View>
      ) : null}
    </>
  );
}
