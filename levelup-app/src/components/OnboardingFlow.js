import React, { useState, useEffect, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Switch,
  BackHandler
} from 'react-native';
import { useFitTrack } from '../context/FitTrackContext';
import {
  calcBMRAndTDEE,
  calcPersonalTargets,
  calcCapacityMetrics,
  cmToFtInParts,
  cmToFtIn,
  ftInToCm,
  kgToLbs,
  lbsToKg,
  getSmoothCurvePoints,
  getBmiNeedlePercent
} from '../utils/fitnessMath';
import WheelPicker from './WheelPicker';
import { styles } from '../styles/theme';

const TOTAL_STEPS = 20;

const AGE_ITEMS = Array.from({ length: 62 }, (_, i) => i + 14);
const CM_ITEMS = Array.from({ length: 81 }, (_, i) => i + 140);
const FT_ITEMS = [4, 5, 6, 7];
const IN_ITEMS = Array.from({ length: 12 }, (_, i) => i);
const KG_ITEMS = Array.from({ length: 121 }, (_, i) => i + 40);
const LBS_ITEMS = Array.from({ length: 265 }, (_, i) => i + 88);

const REFERRAL_BADGES = {
  TikTok: { glyph: '♪', color: '#0F172A' },
  Instagram: { glyph: '◎', color: '#E1306C' },
  Facebook: { glyph: 'f', color: '#1877F2' },
  YouTube: { glyph: '▶', color: '#FF0000' },
  Google: { glyph: 'G', color: '#4285F4' },
  'Friend or family': { glyph: '👥', color: '#0F172A' }
};

const FOCUS_ICONS = {
  'Full Body': '🧍',
  Chest: '🫁',
  Back: '🦴',
  Arms: '💪',
  Shoulders: '🏋️',
  Abs: '⚡',
  Legs: '🦵'
};

function RadioRow({ label, selected, onPress, subtext, rightContent, showLeftRadio = false }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.obOptionCard, selected && styles.obOptionCardSelected]}
    >
      {showLeftRadio ? (
        <View style={[styles.obRadioLeft, selected && styles.obRadioSelectedGreen]}>
          {selected ? <Text style={styles.obCheckText}>✓</Text> : null}
        </View>
      ) : null}

      <View style={{ flex: 1, paddingRight: 10 }}>
        <Text style={[styles.obOptionText, selected && styles.obOptionTextSelected]}>{label}</Text>
        {subtext ? <Text style={styles.obOptionSub}>{subtext}</Text> : null}
      </View>

      {rightContent || null}
    </TouchableOpacity>
  );
}

function PillToggle({ leftLabel, rightLabel, isRight, onToggle }) {
  return (
    <View style={styles.unitSwitchRow}>
      <Text style={[styles.unitLabel, !isRight && styles.unitLabelActive]}>{leftLabel}</Text>
      <TouchableOpacity activeOpacity={0.85} onPress={onToggle} style={styles.pillSwitchTrack}>
        <View
          style={[
            styles.pillSwitchThumb,
            { alignSelf: isRight ? 'flex-end' : 'flex-start' }
          ]}
        />
      </TouchableOpacity>
      <Text style={[styles.unitLabel, isRight && styles.unitLabelActive]}>{rightLabel}</Text>
    </View>
  );
}

export default function OnboardingFlow() {
  const {
    step,
    answers,
    updateAnswers,
    nextStep,
    prevStep,
    prepareOnboardingPlan,
    finishOnboarding
  } = useFitTrack();

  const [heightUnit, setHeightUnit] = useState('ft');
  const [weightUnit, setWeightUnit] = useState('kg');

  // Step 18 animated generation state
  const [genPct, setGenPct] = useState(0);
  // Step 20 typewriter welcome state
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (step > 1 && step <= 17) {
        prevStep();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [step, prevStep]);

  // Trigger AI plan preparation and animate progress on Step 18 (matches 6.jpeg)
  useEffect(() => {
    if (step !== 18) return;
    setGenPct(8);
    let cancelled = false;
    prepareOnboardingPlan();

    const interval = setInterval(() => {
      setGenPct((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(100, prev + 7);
      });
    }, 170);

    const advanceTimer = setTimeout(() => {
      if (!cancelled) nextStep();
    }, 2900);

    return () => {
      cancelled = true;
      clearInterval(interval);
      clearTimeout(advanceTimer);
    };
  }, [step, prepareOnboardingPlan, nextStep]);

  // Typewriter animation on Step 20 (matches 4.jpeg & 3.jpeg)
  useEffect(() => {
    if (step !== 20) return;
    const fullCopy =
      'Welcome to LevelUp!\n\nYour determination to level up in real life has been acknowledged.';
    let idx = 0;
    setTypedText('');
    const timer = setInterval(() => {
      idx += 2;
      setTypedText(fullCopy.slice(0, idx));
      if (idx >= fullCopy.length) {
        clearInterval(timer);
      }
    }, 28);
    return () => clearInterval(timer);
  }, [step]);

  const progressPct = Math.min(100, Math.round((Math.min(step, 16) / 16) * 100));
  const { feet, inches } = useMemo(() => cmToFtInParts(answers.heightCm), [answers.heightCm]);

  const statusMessages = [
    '[Calculating your ability...]',
    '[Analyzing fitness level...]',
    '[Calculating power output...]',
    '[Calibrating rank tiers...]',
    '[Building your custom plan...]'
  ];
  const currentStatusText = statusMessages[Math.min(4, Math.floor(genPct / 21))];

  // Step 18: Full-screen Generation Progress (matches 6.jpeg)
  if (step === 18) {
    const checklist = [
      { label: 'Physical Attributes', at: 18 },
      { label: 'Fitness Level', at: 38 },
      { label: 'Power Analysis', at: 58 },
      { label: 'Rank Calibration', at: 78 },
      { label: 'Workout Generation', at: 95 }
    ];

    return (
      <SafeAreaView style={styles.darkSafe}>
        <StatusBar barStyle="light-content" backgroundColor="#060D16" />
        <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'space-between', paddingVertical: 40 }}>
          <View style={{ alignItems: 'center', marginTop: 24 }}>
            <Text style={{ fontSize: 54, fontWeight: '800', color: '#FFFFFF' }}>{genPct}%</Text>
            <Text style={[styles.obTitle, { marginTop: 10, marginBottom: 18 }]}>
              We're creating a{'\n'}personal plan for you
            </Text>
            <View style={[styles.obProgressTrack, { width: '100%', height: 8 }]}>
              <View style={[styles.obProgressFill, { width: `${genPct}%` }]} />
            </View>
            <Text style={[styles.mutedLight, { marginTop: 20, fontSize: 15 }]}>
              {currentStatusText}
            </Text>
          </View>

          <View style={styles.darkCard}>
            <Text style={[styles.boldLight, { textAlign: 'center', fontSize: 18, marginBottom: 14 }]}>
              Status
            </Text>
            {checklist.map((item) => {
              const done = genPct >= item.at;
              return (
                <View key={item.label} style={[styles.rowBetween, { paddingVertical: 9 }]}>
                  <Text style={{ color: done ? '#FFFFFF' : '#94A3B8', fontSize: 16, fontWeight: '600' }}>
                    {item.label}
                  </Text>
                  <View style={[styles.obRadioLeft, { marginRight: 0 }, done && styles.obRadioSelectedGreen]}>
                    {done ? <Text style={styles.obCheckText}>✓</Text> : null}
                  </View>
                </View>
              );
            })}
          </View>

          <View style={{ alignItems: 'center' }}>
            <Text style={[styles.mutedLight, { textAlign: 'center', fontSize: 14 }]}>
              🌿 Over 100,000+ Programs Generated 🌿
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Step 20: LevelUp Branded Typewriter Welcome (matches 4.jpeg & 3.jpeg)
  if (step === 20) {
    return (
      <SafeAreaView style={styles.darkSafe}>
        <StatusBar barStyle="light-content" backgroundColor="#060D16" />
        <View
          style={{
            flex: 1,
            paddingHorizontal: 26,
            paddingTop: 32,
            paddingBottom: 34,
            justifyContent: 'space-between',
            backgroundColor: '#060D16'
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 34,
                fontWeight: '800',
                color: '#FFFFFF',
                letterSpacing: 1.5
              }}
            >
              LevelUp
            </Text>
          </View>

          <View
            style={{
              backgroundColor: 'rgba(14, 34, 62, 0.45)',
              borderRadius: 24,
              borderWidth: 1,
              borderColor: '#163156',
              padding: 24,
              minHeight: 190,
              justifyContent: 'center'
            }}
          >
            <Text style={{ color: '#F8FAFC', fontSize: 22, fontWeight: '700', lineHeight: 32 }}>
              {typedText}
            </Text>
          </View>

          <TouchableOpacity style={styles.obContinueBtn} onPress={finishOnboarding}>
            <Text style={styles.obContinueText}>Enter LevelUp</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const showTopProgressBar = step <= 16;

  return (
    <SafeAreaView style={styles.darkSafe}>
      <StatusBar barStyle="light-content" backgroundColor="#060D16" />
      {showTopProgressBar ? (
        <View style={styles.obHeader}>
          {step > 1 ? (
            <TouchableOpacity onPress={prevStep} style={styles.obBackBtn}>
              <Text style={styles.obBackText}>←</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 28 }} />
          )}
          <View style={styles.obProgressTrack}>
            <View style={[styles.obProgressFill, { width: `${progressPct}%` }]} />
          </View>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.obScrollBody} showsVerticalScrollIndicator={false}>
        {/* STEP 1 (1.jpeg): Gender */}
        {step === 1 && (
          <View>
            <Text style={styles.obTitle}>Choose your gender</Text>
            {[
              ['Male', '♂'],
              ['Female', '♀'],
              ['Other', '👤']
            ].map(([g, icon]) => (
              <RadioRow
                key={g}
                label={g}
                selected={answers.gender === g}
                onPress={() => updateAnswers({ gender: g })}
                rightContent={<Text style={styles.obIconGlyph}>{icon}</Text>}
              />
            ))}
          </View>
        )}

        {/* STEP 2 (26.jpeg): Motivation */}
        {step === 2 && (
          <View>
            <Text style={styles.obTitle}>What motivates you to{'\n'}work out?</Text>
            {['Health', 'Weight Loss', 'Appearance', 'Stress Relief', 'Social Support', 'Enjoyment'].map((m) => (
              <RadioRow
                key={m}
                label={m}
                showLeftRadio
                selected={answers.motivation === m}
                onPress={() => updateAnswers({ motivation: m })}
              />
            ))}
          </View>
        )}

        {/* STEP 3 (25.jpeg): Goal */}
        {step === 3 && (
          <View>
            <Text style={styles.obTitle}>Choose your goal</Text>
            {['Build Muscle', 'Lose Weight', 'Look Better', 'Stay In Shape'].map((g) => (
              <RadioRow
                key={g}
                label={g}
                selected={answers.goal === g}
                onPress={() => updateAnswers({ goal: g })}
              />
            ))}
          </View>
        )}

        {/* STEP 4 (24.jpeg): Referral source */}
        {step === 4 && (
          <View>
            <Text style={styles.obTitle}>Where did you hear about{'\n'}us?</Text>
            {['TikTok', 'Instagram', 'Facebook', 'YouTube', 'Google', 'Friend or family'].map((s) => {
              const badge = REFERRAL_BADGES[s] || { glyph: '•', color: '#0F172A' };
              return (
                <RadioRow
                  key={s}
                  label={s}
                  selected={answers.source === s}
                  onPress={() => updateAnswers({ source: s })}
                  rightContent={
                    <View style={styles.obRightBadge}>
                      <Text style={{ color: badge.color, fontWeight: '800', fontSize: 15 }}>
                        {badge.glyph}
                      </Text>
                    </View>
                  }
                />
              );
            })}
          </View>
        )}

        {/* STEP 5 (23.jpeg): Focus areas */}
        {step === 5 && (
          <View>
            <Text style={styles.obTitle}>Choose your focus areas</Text>
            {['Full Body', 'Chest', 'Back', 'Arms', 'Shoulders', 'Abs', 'Legs'].map((f) => {
              const selected = answers.focusAreas.includes(f);
              return (
                <RadioRow
                  key={f}
                  label={f}
                  showLeftRadio
                  selected={selected}
                  onPress={() => {
                    const updated = selected
                      ? answers.focusAreas.filter((item) => item !== f)
                      : [...answers.focusAreas, f];
                    updateAnswers({ focusAreas: updated.length ? updated : ['Full Body'] });
                  }}
                  rightContent={
                    <View style={styles.obRightMuscleBadge}>
                      <Text style={{ fontSize: 18 }}>{FOCUS_ICONS[f]}</Text>
                    </View>
                  }
                />
              );
            })}
          </View>
        )}

        {/* STEP 6 (22.jpeg): Fitness level */}
        {step === 6 && (
          <View>
            <Text style={styles.obTitle}>Choose your fitness level</Text>
            {[
              ['Beginner', "I'm new or have only tried it for a bit", '○'],
              ['Intermediate', "I've lifted weights before", '△'],
              ['Advanced', "I've been lifting weights for a while", '🔥']
            ].map(([lvl, sub, glyph]) => (
              <RadioRow
                key={lvl}
                label={lvl}
                subtext={sub}
                selected={answers.fitnessLevel === lvl}
                onPress={() => updateAnswers({ fitnessLevel: lvl })}
                rightContent={<Text style={styles.obIconGlyph}>{glyph}</Text>}
              />
            ))}
          </View>
        )}

        {/* STEP 7 (21.jpeg): Activity level */}
        {step === 7 && (
          <View>
            <Text style={styles.obTitle}>Choose your activity level</Text>
            {[
              ['Sedentary', 'Little to no exercise'],
              ['Lightly Active', 'Light exercise 1-3 days a week'],
              ['Moderately Active', 'Moderate exercise 4-6 days a week'],
              ['Very Active', 'Hard exercise every day']
            ].map(([act, sub]) => (
              <RadioRow
                key={act}
                label={act}
                subtext={sub}
                selected={answers.activityLevel === act}
                onPress={() => updateAnswers({ activityLevel: act })}
              />
            ))}
          </View>
        )}

        {/* STEP 8 (20.jpeg): Age wheel */}
        {step === 8 && (
          <View style={{ flex: 1, justifyContent: 'center', paddingTop: 40 }}>
            <Text style={styles.obTitle}>How old are you?</Text>
            <View style={{ marginTop: 26 }}>
              <WheelPicker
                items={AGE_ITEMS}
                selectedValue={answers.age}
                onValueChange={(val) => updateAnswers({ age: val })}
              />
            </View>
          </View>
        )}

        {/* STEP 9 (19.jpeg): Height dual/single wheel + cm/ft toggle */}
        {step === 9 && (
          <View style={{ flex: 1, justifyContent: 'center', paddingTop: 32 }}>
            <Text style={styles.obTitle}>How tall are you?</Text>
            <View style={{ marginTop: 20 }}>
              {heightUnit === 'ft' ? (
                <View style={{ flexDirection: 'row', gap: 14 }}>
                  <WheelPicker
                    width="48%"
                    items={FT_ITEMS}
                    selectedValue={feet}
                    formatLabel={(f) => `${f}'`}
                    onValueChange={(newFt) => {
                      const cm = ftInToCm(newFt, inches);
                      updateAnswers({ heightCm: cm, heightFt: cmToFtIn(cm) });
                    }}
                  />
                  <WheelPicker
                    width="48%"
                    items={IN_ITEMS}
                    selectedValue={inches}
                    formatLabel={(inc) => `${inc}"`}
                    onValueChange={(newIn) => {
                      const cm = ftInToCm(feet, newIn);
                      updateAnswers({ heightCm: cm, heightFt: cmToFtIn(cm) });
                    }}
                  />
                </View>
              ) : (
                <WheelPicker
                  items={CM_ITEMS}
                  selectedValue={answers.heightCm}
                  formatLabel={(cm) => `${cm} cm`}
                  onValueChange={(cm) => updateAnswers({ heightCm: cm, heightFt: cmToFtIn(cm) })}
                />
              )}
              <PillToggle
                leftLabel="cm"
                rightLabel="ft"
                isRight={heightUnit === 'ft'}
                onToggle={() => setHeightUnit((u) => (u === 'cm' ? 'ft' : 'cm'))}
              />
            </View>
          </View>
        )}

        {/* STEP 10 (18.jpeg): Current weight wheel + kg/lbs toggle */}
        {step === 10 && (
          <View style={{ flex: 1, justifyContent: 'center', paddingTop: 32 }}>
            <Text style={styles.obTitle}>What is your current weight?</Text>
            <View style={{ marginTop: 20 }}>
              {weightUnit === 'kg' ? (
                <WheelPicker
                  items={KG_ITEMS}
                  selectedValue={answers.weightKg}
                  formatLabel={(kg) => `${kg} kg`}
                  onValueChange={(kg) => updateAnswers({ weightKg: kg })}
                />
              ) : (
                <WheelPicker
                  items={LBS_ITEMS}
                  selectedValue={kgToLbs(answers.weightKg)}
                  formatLabel={(lbs) => `${lbs} lbs`}
                  onValueChange={(lbs) => updateAnswers({ weightKg: lbsToKg(lbs) })}
                />
              )}
              <PillToggle
                leftLabel="kg"
                rightLabel="lbs"
                isRight={weightUnit === 'lbs'}
                onToggle={() => setWeightUnit((u) => (u === 'kg' ? 'lbs' : 'kg'))}
              />
            </View>
          </View>
        )}

        {/* STEP 11 (17.jpeg): Target weight wheel + kg/lbs toggle */}
        {step === 11 && (
          <View style={{ flex: 1, justifyContent: 'center', paddingTop: 32 }}>
            <Text style={styles.obTitle}>What is your target weight?</Text>
            <View style={{ marginTop: 20 }}>
              {weightUnit === 'kg' ? (
                <WheelPicker
                  items={KG_ITEMS}
                  selectedValue={answers.targetWeightKg}
                  formatLabel={(kg) => `${kg} kg`}
                  onValueChange={(kg) => updateAnswers({ targetWeightKg: kg })}
                />
              ) : (
                <WheelPicker
                  items={LBS_ITEMS}
                  selectedValue={kgToLbs(answers.targetWeightKg)}
                  formatLabel={(lbs) => `${lbs} lbs`}
                  onValueChange={(lbs) => updateAnswers({ targetWeightKg: lbsToKg(lbs) })}
                />
              )}
              <PillToggle
                leftLabel="kg"
                rightLabel="lbs"
                isRight={weightUnit === 'lbs'}
                onToggle={() => setWeightUnit((u) => (u === 'kg' ? 'lbs' : 'kg'))}
              />
            </View>
          </View>
        )}

        {/* STEP 12 (16.jpeg): Health issues */}
        {step === 12 && (
          <View>
            <Text style={styles.obTitle}>Any health issues?</Text>
            {['None', 'Knee', 'Hip Joints', 'Back or Hernia', 'Arms and Shoulders', 'Cant Do Jumps'].map((hi) => (
              <RadioRow
                key={hi}
                label={hi}
                showLeftRadio
                selected={answers.healthIssue === hi}
                onPress={() => updateAnswers({ healthIssue: hi })}
              />
            ))}
          </View>
        )}

        {/* STEP 13 (15.jpeg): Equipment */}
        {step === 13 && (
          <View>
            <Text style={styles.obTitle}>What equipment do you have{'\n'}access to?</Text>
            {['None (Bodyweight)', 'Full gym', 'Barbells', 'Dumbbells', 'Kettlebells', 'Machines'].map((eq) => (
              <RadioRow
                key={eq}
                label={eq}
                showLeftRadio
                selected={answers.equipment === eq}
                onPress={() => updateAnswers({ equipment: eq })}
              />
            ))}
          </View>
        )}

        {/* STEP 14 (14.jpeg): Workout frequency slider */}
        {step === 14 && (
          <View style={{ flex: 1, justifyContent: 'center', paddingTop: 20 }}>
            <Text style={styles.obTitle}>How often would you like to{'\n'}work out?</Text>
            <Text style={styles.freqBigText}>{answers.workoutFrequency}x</Text>
            <Text style={styles.freqSubText}>{answers.workoutFrequency} workouts a week</Text>

            <View style={styles.sliderWrap}>
              <View style={styles.sliderTrack}>
                {[2, 3, 4, 5, 6].map((fq) => {
                  const active = answers.workoutFrequency === fq;
                  return (
                    <TouchableOpacity
                      key={fq}
                      onPress={() => updateAnswers({ workoutFrequency: fq })}
                      style={styles.sliderDotTouch}
                    >
                      <View style={active ? styles.sliderThumb : styles.sliderDot} />
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.mutedLight}>Less</Text>
                <Text style={styles.mutedLight}>More</Text>
              </View>
            </View>
          </View>
        )}

        {/* STEP 15 (13.jpeg): Workout days + Smart Reminders */}
        {step === 15 && (
          <View style={{ flex: 1, justifyContent: 'space-between' }}>
            <View>
              <Text style={styles.obTitle}>Set your workout days</Text>
              <View style={styles.dayGrid}>
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => {
                  const sel = answers.workoutDays.includes(day);
                  return (
                    <TouchableOpacity
                      key={day}
                      onPress={() => {
                        const updated = sel
                          ? answers.workoutDays.filter((d) => d !== day)
                          : [...answers.workoutDays, day];
                        updateAnswers({ workoutDays: updated.length ? updated : [day] });
                      }}
                      style={[styles.dayPill, sel && styles.dayPillSelected]}
                    >
                      <Text style={styles.dayPillText}>{day}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={{ marginTop: 48 }}>
              <View style={[styles.rowBetween, { marginBottom: 14 }]}>
                <View>
                  <Text style={styles.boldLight}>Reminder</Text>
                  <Text style={styles.mutedLight}>Helps to achieve a goal</Text>
                </View>
                <Switch
                  value={answers.reminders}
                  trackColor={{ false: '#1E293B', true: '#3B82F6' }}
                  thumbColor="#FFFFFF"
                  onValueChange={(val) => updateAnswers({ reminders: val })}
                />
              </View>

              <View style={styles.darkCard}>
                <Text style={[styles.boldLight, { marginBottom: 6 }]}>🕒  Smart Reminders</Text>
                <Text style={[styles.mutedLight, { lineHeight: 19 }]}>
                  90% of our users who use smart reminders reach their goals faster
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* STEP 16 (12.jpeg - 8.jpeg): Full Summary Preview + BMI + Macros + Goals + LevelUp Advice */}
        {step === 16 && (() => {
          const calc = calcBMRAndTDEE(answers);
          const targets = calcPersonalTargets(answers);
          const gaining = answers.targetWeightKg >= answers.weightKg;
          const curvePts = getSmoothCurvePoints(22, gaining);
          const needlePct = getBmiNeedlePercent(calc.bmiNum);
          const ticks = Array.from({ length: 36 }, (_, i) => {
            if (i < 9) return '#3B82F6';
            if (i < 22) return '#22C55E';
            return '#EAB308';
          });

          return (
            <View>
              <Text style={[styles.obTitle, { fontSize: 21, marginBottom: 14 }]}>
                Here's your summary preview. Tap{'\n'}continue to get your custom plan
              </Text>

              <Text style={styles.sectionLabel}>Summary</Text>

              {/* Smooth Progression Trajectory Card */}
              <View style={styles.darkCard}>
                <View style={styles.rowBetween}>
                  <Text style={styles.mutedLight}>Weight Trajectory</Text>
                  <Text style={styles.boldLight}>{answers.targetWeightKg} kg</Text>
                </View>
                <View style={styles.curveWrap}>
                  <View style={[styles.curveGridLine, { bottom: 16 }]} />
                  <View style={[styles.curveGridLine, { bottom: 48 }]} />
                  <View style={[styles.curveGridLine, { bottom: 80 }]} />
                  <View style={[styles.curveGridLine, { bottom: 112 }]} />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 110 }}>
                    {curvePts.map((pt, idx) => {
                      const ratio = idx / (curvePts.length - 1);
                      const dotColor = ratio < 0.35 ? '#F97316' : ratio < 0.7 ? '#A3E635' : '#22C55E';
                      return (
                        <View
                          key={idx}
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: 4,
                            backgroundColor: dotColor,
                            marginBottom: Math.round(12 + pt * 82)
                          }}
                        />
                      );
                    })}
                  </View>
                </View>
                <Text style={styles.boldLight}>{answers.weightKg} kg</Text>
              </View>

              {/* BMI Index Card */}
              <View style={styles.darkCard}>
                <Text style={styles.mutedLight}>BMI Index</Text>
                <View style={[styles.rowBetween, { marginTop: 4 }]}>
                  <Text style={styles.obHugeVal}>{calc.bmi}</Text>
                  <Text style={{ color: '#60A5FA', fontWeight: '700', fontSize: 15 }}>
                    {calc.bmiCategory}
                  </Text>
                </View>
                <View style={styles.bmiTickRow}>
                  {ticks.map((c, idx) => (
                    <View key={idx} style={[styles.bmiTick, { backgroundColor: c }]} />
                  ))}
                  <View style={[styles.bmiNeedle, { left: `${Math.min(96, Math.max(2, needlePct))}%` }]} />
                </View>
                <View style={styles.rowBetween}>
                  <Text style={styles.mutedLight}>Underweight</Text>
                  <Text style={styles.mutedLight}>Normal</Text>
                  <Text style={styles.mutedLight}>Overweight</Text>
                </View>
              </View>

              {/* Level / Activity / Areas Card */}
              <View style={styles.darkCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                  <Text style={[styles.obIconGlyph, { width: 32 }]}>△</Text>
                  <View>
                    <Text style={styles.mutedLight}>Fitness level</Text>
                    <Text style={styles.boldLight}>{answers.fitnessLevel}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                  <Text style={[styles.obIconGlyph, { width: 32 }]}>📶</Text>
                  <View>
                    <Text style={styles.mutedLight}>Activity level</Text>
                    <Text style={styles.boldLight}>{answers.activityLevel}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.obIconGlyph, { width: 32 }]}>🎯</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.mutedLight}>Target areas</Text>
                    <Text style={styles.boldLight}>{answers.focusAreas.join(', ')}</Text>
                  </View>
                </View>
              </View>

              {/* Macros Section */}
              <Text style={styles.sectionLabel}>Macros</Text>
              <View style={[styles.darkCard, { alignItems: 'center' }]}>
                <Text style={{ fontSize: 28, marginBottom: 6 }}>🔥</Text>
                <Text style={styles.mutedLight}>YOUR CALORIE GOAL</Text>
                <Text style={styles.obHugeVal}>{calc.targetCals.toLocaleString()} kcal</Text>
                <Text style={styles.mutedLight}>per day</Text>
              </View>

              <View style={styles.darkCard}>
                <View style={styles.rowBetween}>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ fontSize: 22, marginBottom: 4 }}>🥩</Text>
                    <Text style={styles.mutedLight}>PROTEIN</Text>
                    <Text style={[styles.boldLight, { fontSize: 20, marginVertical: 2 }]}>{calc.protein}g</Text>
                    <Text style={styles.mutedLight}>per day</Text>
                  </View>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ fontSize: 22, marginBottom: 4 }}>🍚</Text>
                    <Text style={styles.mutedLight}>CARBS</Text>
                    <Text style={[styles.boldLight, { fontSize: 20, marginVertical: 2 }]}>{calc.carbs}g</Text>
                    <Text style={styles.mutedLight}>per day</Text>
                  </View>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ fontSize: 22, marginBottom: 4 }}>🧈</Text>
                    <Text style={styles.mutedLight}>FAT</Text>
                    <Text style={[styles.boldLight, { fontSize: 20, marginVertical: 2 }]}>{calc.fat}g</Text>
                    <Text style={styles.mutedLight}>per day</Text>
                  </View>
                </View>
              </View>

              {/* Goals Section */}
              <Text style={styles.sectionLabel}>Goals</Text>
              <View style={[styles.darkCard, { alignItems: 'center' }]}>
                <Text style={{ fontSize: 26, marginBottom: 6 }}>💧</Text>
                <Text style={styles.mutedLight}>YOUR WATER GOAL</Text>
                <Text style={styles.obHugeVal}>{targets.waterCups} cups</Text>
                <Text style={styles.mutedLight}>per day</Text>
              </View>

              <View style={styles.rowBetween}>
                <View style={[styles.darkCard, { flex: 1, marginRight: 6, alignItems: 'center' }]}>
                  <Text style={{ fontSize: 24, marginBottom: 6 }}>⏳</Text>
                  <Text style={[styles.boldLight, { fontSize: 24 }]}>{targets.durationMin} min</Text>
                  <Text style={styles.mutedLight}>workout</Text>
                </View>
                <View style={[styles.darkCard, { flex: 1, marginLeft: 6, alignItems: 'center' }]}>
                  <Text style={{ fontSize: 24, marginBottom: 6 }}>⏱️</Text>
                  <Text style={[styles.boldLight, { fontSize: 24 }]}>{targets.restLabel}</Text>
                  <Text style={styles.mutedLight}>rest time</Text>
                </View>
              </View>

              <View style={[styles.darkCard, { alignItems: 'center' }]}>
                <Text style={{ fontSize: 26, marginBottom: 6 }}>📅</Text>
                <Text style={[styles.boldLight, { fontSize: 26 }]}>{answers.workoutFrequency} workouts</Text>
                <Text style={styles.mutedLight}>weekly goal</Text>
              </View>

              {/* Additional Recommendations */}
              <Text style={styles.sectionLabel}>Additional Recommendations</Text>
              <View style={[styles.darkCard, { alignItems: 'center' }]}>
                <Text style={{ fontSize: 26, marginBottom: 8 }}>🧪</Text>
                <Text style={[styles.boldLight, { fontSize: 22, marginBottom: 8 }]}>Supplements</Text>
                <Text style={[styles.mutedLight, { textAlign: 'center', lineHeight: 20 }]}>
                  Supplements can be beneficial in supporting your goals. Consider the following: Protein supplements, creatine monohydrate, BCAAs, beta-alanine.
                </Text>
              </View>

              <View style={[styles.darkCard, { alignItems: 'center' }]}>
                <Text style={{ fontSize: 26, marginBottom: 8 }}>📝</Text>
                <Text style={[styles.boldLight, { fontSize: 22, marginBottom: 8 }]}>The LevelUp Advice</Text>
                <Text style={[styles.mutedLight, { textAlign: 'center', lineHeight: 21 }]}>
                  To maximize your {answers.goal.toLowerCase()} goal, focus on compound exercises targeting {answers.focusAreas.join(', ')} with {answers.equipment}, prioritize progressive overload, hit your daily {calc.protein}g protein target, and allow sufficient rest for optimal recovery.
                </Text>
              </View>

              <Text style={[styles.mutedLight, { textAlign: 'center', fontSize: 12, marginTop: 4, marginBottom: 14 }]}>
                The information provided is for general reference only and should not substitute professional medical advice.
              </Text>
              <Text style={[styles.mutedLight, { fontWeight: '700', marginBottom: 4 }]}>Sources</Text>
              <Text style={[styles.mutedLight, { fontSize: 11 }]}>CDC - About Body Mass Index (BMI)</Text>
              <Text style={[styles.mutedLight, { fontSize: 11, marginBottom: 8 }]}>CDC - Adult BMI Categories</Text>
            </View>
          );
        })()}

        {/* STEP 17 (7.jpeg): All done! Workout Calendar Grid */}
        {step === 17 && (() => {
          const dayHeaders = [
            ['S', 'Sunday'],
            ['M', 'Monday'],
            ['T', 'Tuesday'],
            ['W', 'Wednesday'],
            ['T', 'Thursday'],
            ['F', 'Friday'],
            ['S', 'Saturday']
          ];
          const weeks = [0, 1, 2, 3];

          return (
            <View style={{ flex: 1, justifyContent: 'space-between', paddingTop: 26 }}>
              <View style={{ alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>All done!</Text>
                  <View style={[styles.obRadioLeft, styles.obRadioSelectedGreen, { marginRight: 0 }]}>
                    <Text style={styles.obCheckText}>✓</Text>
                  </View>
                </View>
                <Text style={styles.obTitle}>Time to generate your{'\n'}custom plan</Text>
              </View>

              <View style={{ marginVertical: 24, paddingHorizontal: 10 }}>
                <View style={styles.calGridRow}>
                  {dayHeaders.map(([abbr, full], idx) => (
                    <View key={`${full}-${idx}`} style={styles.calCell}>
                      <Text style={{ color: '#94A3B8', fontWeight: '700', fontSize: 13 }}>{abbr}</Text>
                    </View>
                  ))}
                </View>
                {weeks.map((wk) => (
                  <View key={wk} style={styles.calGridRow}>
                    {dayHeaders.map(([, full], dIdx) => {
                      const active = answers.workoutDays.includes(full);
                      return (
                        <View key={`${wk}-${dIdx}`} style={styles.calCell}>
                          {active ? (
                            <Text style={{ fontSize: 18 }}>🏋️</Text>
                          ) : (
                            <View style={styles.calRestDot} />
                          )}
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>
          );
        })()}

        {/* STEP 19 (5.jpeg): Analysis complete bar comparison */}
        {step === 19 && (() => {
          const capacity = calcCapacityMetrics(answers);
          return (
            <View style={{ flex: 1, justifyContent: 'center', paddingTop: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '700' }}>Analysis complete</Text>
                <View style={[styles.obRadioLeft, styles.obRadioSelectedGreen, { marginRight: 0 }]}>
                  <Text style={styles.obCheckText}>✓</Text>
                </View>
              </View>

              <View style={styles.analysisBarsRow}>
                <View style={styles.analysisBarCol}>
                  <View style={styles.analysisBarRed}>
                    <Text style={styles.analysisBarPct}>{capacity.userScore}%</Text>
                  </View>
                  <Text style={styles.analysisBarCaption}>You</Text>
                </View>
                <View style={styles.analysisBarCol}>
                  <View style={styles.analysisBarGray}>
                    <Text style={styles.analysisBarPct}>{capacity.avgScore}%</Text>
                  </View>
                  <Text style={styles.analysisBarCaption}>Average</Text>
                </View>
              </View>

              <Text style={{ color: '#E2E8F0', fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 24 }}>
                Based on our data,{' '}
                <Text style={{ color: '#EF4444', fontWeight: '700' }}>
                  you're wasting {capacity.gap}% more potential
                </Text>{' '}
                than the {capacity.peerLabel}.
              </Text>

              <View style={[styles.darkCard, { flexDirection: 'row', alignItems: 'center', gap: 14 }]}>
                <Text style={{ fontSize: 26 }}>🤸</Text>
                <Text style={{ color: '#E2E8F0', fontSize: 14, lineHeight: 20, flex: 1 }}>
                  You're only using {capacity.currentUsage}% of your physical capacity. Most people your age unlock at least 60%.
                </Text>
              </View>
            </View>
          );
        })()}
      </ScrollView>

      <View style={styles.obFooter}>
        <TouchableOpacity style={styles.obContinueBtn} onPress={nextStep}>
          <Text style={styles.obContinueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
