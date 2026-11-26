import { RANKS } from '../constants/fitnessData';

/**
 * Returns local calendar date key (YYYY-MM-DD) for daily resets.
 */
export function getTodayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function cmToFtInParts(cm) {
  const totalInches = Math.round(cm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return { feet, inches };
}

export function cmToFtIn(cm) {
  const { feet, inches } = cmToFtInParts(cm);
  return `${feet}' ${inches}"`;
}

export function ftInToCm(feet, inches) {
  return Math.round((feet * 12 + inches) * 2.54);
}

export function kgToLbs(kg) {
  return Math.round(kg * 2.20462);
}

export function lbsToKg(lbs) {
  return Math.round(lbs / 2.20462);
}

export function getRankInfo(streak) {
  let current = RANKS[0];
  let next = RANKS[1];
  for (let i = 0; i < RANKS.length; i++) {
    if (streak >= RANKS[i].min) {
      current = RANKS[i];
      next = RANKS[i + 1] || null;
    }
  }
  const pct = next
    ? Math.min(100, Math.round(((streak - current.min) / (next.min - current.min)) * 100))
    : 100;
  return { current, next, pct };
}

/**
 * Dynamic BMR & TDEE calculations via Mifflin-St Jeor equation.
 */
export function calcBMRAndTDEE(answers) {
  const age = Number(answers?.age) || 20;
  const w = Number(answers?.weightKg) || 70;
  const h = Number(answers?.heightCm) || 175;
  const gender = answers?.gender || 'Male';

  const bmr =
    gender === 'Male'
      ? 10 * w + 6.25 * h - 5 * age + 5
      : 10 * w + 6.25 * h - 5 * age - 161;

  let actMultiplier = 1.2;
  if (answers?.activityLevel?.includes('Light')) actMultiplier = 1.375;
  if (answers?.activityLevel?.includes('Moderate')) actMultiplier = 1.55;
  if (answers?.activityLevel?.includes('Very')) actMultiplier = 1.725;

  const tdee = Math.round(bmr * actMultiplier);
  let adj = 0;
  if (answers?.goal === 'Lose Weight') adj = -400;
  if (answers?.goal === 'Build Muscle') adj = 350;
  const targetCals = Math.max(1200, tdee + adj);

  const bmiNum = w / ((h / 100) * (h / 100));
  const bmi = bmiNum.toFixed(1);
  const bmiCategory =
    bmiNum < 18.5
      ? "You're Underweight"
      : bmiNum < 25
        ? 'Normal Weight'
        : bmiNum < 30
          ? "You're Overweight"
          : 'Obese Range';

  const protein = Math.round(w * 2.2);
  const fat = Math.round((targetCals * 0.25) / 9);
  const carbs = Math.max(0, Math.round((targetCals - protein * 4 - fat * 9) / 4));

  return {
    bmr: Math.round(bmr),
    tdee,
    targetCals,
    bmi,
    bmiNum,
    bmiCategory,
    protein,
    carbs,
    fat
  };
}

/**
 * Smooth S-curve normalized heights (0..1) for weight progression summary chart.
 */
export function getSmoothCurvePoints(count = 20, gaining = true) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const smooth = t * t * (3 - 2 * t);
    pts.push(gaining ? smooth : 1 - smooth);
  }
  return pts;
}

/**
 * Normalized 0..100 position for the BMI spectrum needle across 14..34 BMI scale.
 */
export function getBmiNeedlePercent(bmiNum) {
  const clamped = Math.max(14, Math.min(34, Number(bmiNum) || 22));
  return Math.round(((clamped - 14) / 20) * 100);
}

/**
 * Compute personalized hydration, session duration, and rest interval targets.
 */
export function calcPersonalTargets(answers) {
  const weightKg = Number(answers?.weightKg) || 70;
  const freq = Number(answers?.workoutFrequency) || 4;
  const extraWorkoutWater = freq >= 5 ? 0.4 : 0.25;
  const liters = Math.round((weightKg * 0.035 + extraWorkoutWater) * 10) / 10;
  const cups = (Math.round((liters * 4) * 2) / 2).toFixed(1);

  const durationMin =
    answers?.fitnessLevel === 'Advanced'
      ? 60
      : answers?.fitnessLevel === 'Intermediate'
        ? 50
        : 45;

  const restLabel =
    answers?.goal === 'Build Muscle'
      ? '1.5 min'
      : answers?.goal === 'Lose Weight'
        ? '45 sec'
        : '60 sec';

  return {
    waterCups: cups,
    waterLiters: liters.toFixed(1),
    durationMin,
    restLabel
  };
}

/**
 * Compute capacity analysis headline & peer comparison label matching user gender.
 */
export function calcCapacityMetrics(answers) {
  const freqBonus = Math.min(18, (Number(answers?.workoutFrequency) || 4) * 3);
  const levelBonus =
    answers?.fitnessLevel === 'Advanced'
      ? 14
      : answers?.fitnessLevel === 'Intermediate'
        ? 9
        : 5;
  const userScore = Math.min(88, 55 + freqBonus + levelBonus);
  const avgScore = 41;
  const gap = userScore - avgScore;
  const currentUsage = Math.max(18, 100 - userScore);

  const peerLabel =
    answers?.gender === 'Female'
      ? 'average 16 to 24 year old female'
      : answers?.gender === 'Other'
        ? 'average 16 to 24 year old adult'
        : 'average 16 to 24 year old male';

  return { userScore, avgScore, gap, currentUsage, peerLabel };
}

/**
 * Compute LevelUp RPG level and XP progress (150 XP per level).
 */
export function calcLevelInfo(xp = 0) {
  const safeXp = Math.max(0, Number(xp) || 0);
  const xpPerLevel = 150;
  const level = Math.floor(safeXp / xpPerLevel) + 1;
  const levelXp = safeXp % xpPerLevel;
  const pct = Math.min(100, Math.round((levelXp / xpPerLevel) * 100));
  return { level, xp: safeXp, levelXp, nextLevelXp: xpPerLevel, pct };
}

/**
 * Compute clean fitness attribute scores (0-100) from real training & nutrition activity.
 */
export function calcFitnessAttributes(answers, appData) {
  const workouts = Number(appData?.totalWorkouts) || 0;
  const streak = Number(appData?.streak) || 0;
  const foodLogs = Array.isArray(appData?.foodLog) ? appData.foodLog.length : 0;
  const friendsSnapped = Array.isArray(appData?.friends)
    ? appData.friends.filter((f) => f.snapped).length
    : 0;
  const waterCups = Number(appData?.waterCups) || 0;

  const baseLvl =
    answers?.fitnessLevel === 'Advanced'
      ? 35
      : answers?.fitnessLevel === 'Intermediate'
        ? 25
        : 15;

  const strength = Math.min(100, baseLvl + workouts * 5);
  const endurance = Math.min(100, 15 + workouts * 4 + Math.round(waterCups * 1.5));
  const nutrition = Math.min(100, 15 + foodLogs * 12 + (waterCups >= 6 ? 15 : 0));
  const discipline = Math.min(100, 10 + streak * 6 + friendsSnapped * 5);

  return [
    { key: 'strength', label: 'Strength', value: strength, color: '#38BDF8' },
    { key: 'endurance', label: 'Stamina', value: endurance, color: '#22C55E' },
    { key: 'nutrition', label: 'Nutrition', value: nutrition, color: '#F59E0B' },
    { key: 'discipline', label: 'Discipline', value: discipline, color: '#A855F7' }
  ];
}

/**
 * Parse rest strings like '60s', '1.5 min', '90s' into integer seconds.
 */
export function parseRestSeconds(restStr = '60s') {
  const str = String(restStr).toLowerCase().trim();
  const num = parseFloat(str);
  if (Number.isNaN(num) || num <= 0) return 60;
  if (str.includes('min')) return Math.round(num * 60);
  return Math.round(num);
}

export function formatDuration(totalSeconds = 0) {
  const secs = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
  return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}
