import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useFitTrack } from '../../context/FitTrackContext';
import { PRESET_FOODS } from '../../constants/fitnessData';
import { calcBMRAndTDEE } from '../../utils/fitnessMath';
import { styles } from '../../styles/theme';

export default function CaloriesTab() {
  const { answers, appData, logFoodItem, removeFoodItem } = useFitTrack();
  const [customFood, setCustomFood] = useState('');
  const [customCal, setCustomCal] = useState('');
  const [customProt, setCustomProt] = useState('');
  const [formError, setFormError] = useState('');

  const loggedCals = appData.foodLog.reduce((s, f) => s + f.cal, 0);
  const loggedProt = appData.foodLog.reduce((s, f) => s + f.prot, 0);
  const calPct = Math.min(100, Math.round((loggedCals / Math.max(1, appData.targetCalories)) * 100));
  const calc = calcBMRAndTDEE(answers);

  const handleAddCustom = () => {
    const trimmedName = customFood.trim();
    const calNum = Number(customCal);
    const protNum = Number(customProt) || 0;

    if (!trimmedName) {
      setFormError('Please enter a food name.');
      return;
    }
    if (!calNum || calNum <= 0) {
      setFormError('Please enter valid calories (> 0).');
      return;
    }

    setFormError('');
    logFoodItem({ name: trimmedName, cal: Math.round(calNum), prot: Math.max(0, Math.round(protNum)) });
    setCustomFood('');
    setCustomCal('');
    setCustomProt('');
  };

  return (
    <>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Real Calorie Target (BMR/TDEE Formula)</Text>
        <Text style={styles.muted}>
          Age: {answers.age} | Height: {answers.heightCm}cm | Weight: {answers.weightKg}kg | BMR: {calc.bmr}
        </Text>
        <Text style={[styles.bold, { marginTop: 6, fontSize: 16 }]}>
          Target: {appData.targetCalories} kcal / day
        </Text>
        <Text style={[styles.muted, { marginTop: 2 }]}>
          Macros Goal: {calc.protein}g Protein • {calc.carbs}g Carbs • {calc.fat}g Fat
        </Text>
        <View style={styles.barWrap}>
          <View style={[styles.barFill, { width: `${calPct}%` }]} />
        </View>
        <Text style={styles.muted}>
          {loggedCals} / {appData.targetCalories} kcal ({calPct}%) • {loggedProt}g / {calc.protein}g Protein
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Food Calorie Calculator & Daily Log</Text>
        <Text style={[styles.muted, { marginBottom: 8 }]}>Tap quick preset or enter custom food:</Text>
        <View style={styles.chipWrap}>
          {PRESET_FOODS.map((f) => (
            <TouchableOpacity key={f.name} style={styles.chip} onPress={() => logFoodItem(f)}>
              <Text style={styles.chipText}>+ {f.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.inputRow, { marginTop: 12 }]}>
          <TextInput
            style={[styles.input, { flex: 2 }]}
            value={customFood}
            onChangeText={setCustomFood}
            placeholder="Custom food name"
            placeholderTextColor="#a1a1aa"
          />
          <TextInput
            style={styles.input}
            value={customCal}
            onChangeText={setCustomCal}
            keyboardType="numeric"
            placeholder="Kcal"
            placeholderTextColor="#a1a1aa"
          />
          <TextInput
            style={styles.input}
            value={customProt}
            onChangeText={setCustomProt}
            keyboardType="numeric"
            placeholder="Prot"
            placeholderTextColor="#a1a1aa"
          />
        </View>
        {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

        <TouchableOpacity style={[styles.btnOutline, { marginTop: 8, alignItems: 'center' }]} onPress={handleAddCustom}>
          <Text style={styles.btnOutlineText}>Add Custom Food Item</Text>
        </TouchableOpacity>

        <Text style={[styles.bold, { marginTop: 14 }]}>
          Today's Logged: {loggedCals} / {appData.targetCalories} kcal ({loggedProt}g Protein)
        </Text>
        {appData.foodLog.length === 0 ? (
          <Text style={[styles.muted, { marginTop: 6, fontStyle: 'italic' }]}>
            No food logged today yet. Add items above.
          </Text>
        ) : (
          appData.foodLog.map((f, i) => (
            <View key={`${f.name}-${i}`} style={styles.listRow}>
              <Text style={{ flex: 1, color: '#F1F5F9', fontSize: 13 }}>
                {f.name} ({f.cal} kcal, {f.prot}g P)
              </Text>
              <TouchableOpacity onPress={() => removeFoodItem(i)}>
                <Text style={{ color: '#F87171', fontWeight: '600', fontSize: 12 }}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </>
  );
}
