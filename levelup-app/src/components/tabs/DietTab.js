import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useFitTrack } from '../../context/FitTrackContext';
import { DEFAULT_DIETS } from '../../constants/fitnessData';
import { styles } from '../../styles/theme';

export default function DietTab() {
  const {
    answers,
    appData,
    aiPlan,
    loadingAiPlan,
    fetchFitTrackAiPlan,
    selectedDietGoal,
    selectedDietType,
    setDietOption,
    logFoodItem
  } = useFitTrack();

  const [viewMode, setViewMode] = useState(aiPlan?.diet ? 'ai' : 'preset');
  const [loggedFeedback, setLoggedFeedback] = useState('');
  const showAi = viewMode === 'ai' && Array.isArray(aiPlan?.diet) && aiPlan.diet.length > 0;

  const handleLogMeal = (mealObj) => {
    const shortItems = mealObj.items.length > 18 ? `${mealObj.items.substring(0, 18)}...` : mealObj.items;
    logFoodItem({ name: `${mealObj.meal}: ${shortItems}`, cal: mealObj.cal, prot: mealObj.prot });
    setLoggedFeedback(`Added ${mealObj.meal} (${mealObj.cal} kcal) to today's log.`);
  };

  return (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Text style={styles.cardTitle}>Diet Plan ({answers.goal})</Text>
        <TouchableOpacity
          onPress={async () => {
            await fetchFitTrackAiPlan(answers, selectedDietType);
            setViewMode('ai');
          }}
          disabled={loadingAiPlan}
          style={[styles.btnOutline, { paddingVertical: 4, paddingHorizontal: 8 }]}
        >
          <Text style={[styles.btnOutlineText, { fontSize: 11 }]}>
            {loadingAiPlan ? 'Generating...' : '⚡ Smart AI'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.muted, { marginBottom: 10 }]}>
        Calorie Target: {appData.targetCalories} kcal / day ({answers.weightKg}kg ➔ {answers.targetWeightKg}kg)
      </Text>

      <View style={[styles.chipWrap, { marginBottom: 10 }]}>
        {[['veg', 'Vegetarian'], ['nonveg', 'Non-Veg']].map(([k, l]) => (
          <TouchableOpacity
            key={k}
            onPress={() => setDietOption(undefined, k)}
            style={[styles.chip, selectedDietType === k && styles.chipActive]}
          >
            <Text style={[styles.chipText, selectedDietType === k && styles.chipTextActive]}>
              {l}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.segmentWrap}>
        <TouchableOpacity
          style={[styles.segmentBtn, viewMode === 'ai' && styles.segmentBtnActive]}
          onPress={() => setViewMode('ai')}
        >
          <Text style={[styles.segmentText, viewMode === 'ai' && styles.segmentTextActive]}>
            ✨ AI Meal Plan
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, viewMode === 'preset' && styles.segmentBtnActive]}
          onPress={() => setViewMode('preset')}
        >
          <Text style={[styles.segmentText, viewMode === 'preset' && styles.segmentTextActive]}>
            🥗 Preset Plans
          </Text>
        </TouchableOpacity>
      </View>

      {loggedFeedback ? (
        <Text style={[styles.pill, styles.pillGreen, { marginBottom: 8 }]}>{loggedFeedback}</Text>
      ) : null}

      {showAi ? (
        <View>
          <Text style={[styles.bold, { color: '#60A5FA', marginBottom: 6 }]}>
            ✨ LevelUp AI Personalized Meal Plan:
          </Text>
          {aiPlan.diet.map((m, idx) => (
            <View key={`${m.meal}-${idx}`} style={styles.listRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bold}>{m.meal}</Text>
                <Text style={styles.muted}>{m.items}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.bold}>
                  {m.cal} kcal / {m.prot}g P
                </Text>
                <TouchableOpacity
                  onPress={() => handleLogMeal(m)}
                  style={[styles.btnOutline, { paddingVertical: 4, paddingHorizontal: 10, marginTop: 4 }]}
                >
                  <Text style={{ fontSize: 11, color: '#60A5FA', fontWeight: '700' }}>+ Log Meal</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {aiPlan.advice ? (
            <View style={styles.tipBox}>
              <Text style={[styles.bold, { color: '#93C5FD', fontSize: 13 }]}>💡 AI Coach Tip:</Text>
              <Text style={{ fontSize: 12, color: '#E2E8F0', marginTop: 3, lineHeight: 18 }}>{aiPlan.advice}</Text>
            </View>
          ) : null}
        </View>
      ) : (
        <View>
          <Text style={[styles.bold, { marginBottom: 8 }]}>Goal Category:</Text>
          <View style={styles.chipWrap}>
            {[['loss', 'Weight Loss'], ['maintain', 'Maintain'], ['gain', 'Muscle Gain']].map(([k, l]) => (
              <TouchableOpacity
                key={k}
                onPress={() => setDietOption(k, undefined)}
                style={[styles.chip, selectedDietGoal === k && styles.chipActive]}
              >
                <Text style={[styles.chipText, selectedDietGoal === k && styles.chipTextActive]}>
                  {l}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ marginTop: 12 }}>
            {DEFAULT_DIETS[selectedDietGoal][selectedDietType].map((m, idx) => (
              <View key={`${m.meal}-${idx}`} style={styles.listRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bold}>{m.meal}</Text>
                  <Text style={styles.muted}>{m.items}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.bold}>
                    {m.cal} kcal / {m.prot}g P
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleLogMeal(m)}
                    style={[styles.btnOutline, { paddingVertical: 4, paddingHorizontal: 10, marginTop: 4 }]}
                  >
                    <Text style={{ fontSize: 11, color: '#60A5FA', fontWeight: '700' }}>+ Log Meal</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
