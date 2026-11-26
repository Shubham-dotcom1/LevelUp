export function generateLocalWorkouts(answers) {
  const level = answers?.fitnessLevel || 'Beginner';
  const equipment = answers?.equipment || 'Full gym';
  const healthIssue = answers?.healthIssue || 'None';
  const focus = Array.isArray(answers?.focusAreas) && answers.focusAreas.length > 0
    ? answers.focusAreas
    : ['Full Body'];

  const isBodyweight = equipment.includes('Bodyweight');
  const isDumbbells = equipment === 'Dumbbells';
  const sets = level === 'Advanced' ? 4 : 3;
  const reps = level === 'Advanced' ? '12-15 reps' : '10-12 reps';
  const rest = level === 'Advanced' ? '45s' : '60s';

  const hasKneeOrHip = healthIssue === 'Knee' || healthIssue === 'Hip Joints';
  const hasBackIssue = healthIssue === 'Back or Hernia';
  const hasShoulderIssue = healthIssue === 'Arms and Shoulders';
  const noJumps = healthIssue === 'Cant Do Jumps' || hasKneeOrHip;

  const list = [];

  if (focus.includes('Chest') || focus.includes('Full Body')) {
    list.push({
      exercise: isBodyweight
        ? (hasShoulderIssue ? 'Wall / Incline Push-ups' : 'Push-ups')
        : isDumbbells
          ? 'Dumbbell Floor / Bench Press'
          : 'Bench Press',
      sets,
      reps,
      rest
    });
    if (!hasShoulderIssue) {
      list.push({
        exercise: isBodyweight ? 'Incline Push-ups' : 'Incline DB Press',
        sets: 3,
        reps: '12-15 reps',
        rest
      });
    }
  }

  if (focus.includes('Back') || focus.includes('Full Body')) {
    list.push({
      exercise: isBodyweight
        ? 'Inverted Rows'
        : hasBackIssue
          ? 'Chest-Supported Dumbbell Row'
          : 'Lat Pulldown',
      sets,
      reps,
      rest
    });
    if (!hasBackIssue) {
      list.push({
        exercise: isDumbbells ? 'One-Arm Dumbbell Row' : 'Seated Cable Row',
        sets: 3,
        reps: '12-15 reps',
        rest
      });
    }
  }

  if (focus.includes('Legs') || focus.includes('Full Body')) {
    if (hasKneeOrHip) {
      list.push({ exercise: 'Glute Bridges (Low-Impact)', sets: 3, reps: '15 reps', rest: '60s' });
      list.push({ exercise: 'Isometric Wall Sit / Leg Curl', sets: 3, reps: '30-40s', rest: '60s' });
    } else if (hasBackIssue) {
      list.push({ exercise: 'Bodyweight / Goblet Box Squats', sets: 3, reps: '10-12 reps', rest: '75s' });
    } else {
      list.push({
        exercise: isBodyweight ? 'Bodyweight Squats' : isDumbbells ? 'Goblet Squats' : 'Barbell Squats',
        sets,
        reps: '12 reps',
        rest: '90s'
      });
      list.push({
        exercise: noJumps ? 'Controlled Step-Ups' : 'Dumbbell / Walking Lunges',
        sets: 3,
        reps: '12 reps / leg',
        rest: '60s'
      });
    }
  }

  if (focus.includes('Arms') || focus.includes('Shoulders')) {
    if (hasShoulderIssue) {
      list.push({ exercise: 'Controlled Hammer Curls', sets: 3, reps: '12 reps', rest: '45s' });
    } else {
      list.push({
        exercise: isBodyweight ? 'Pike Push-ups' : 'Overhead Shoulder Press',
        sets: 3,
        reps,
        rest
      });
      list.push({
        exercise: isBodyweight ? 'Diamond Push-ups' : 'Bicep Curls & Tricep Extensions',
        sets: 3,
        reps: '12-15 reps',
        rest: '45s'
      });
    }
  }

  if (focus.includes('Abs')) {
    list.push({
      exercise: hasBackIssue ? 'Dead Bug Core Hold' : 'Plank Hold & Leg Raises',
      sets: 3,
      reps: '30-45s',
      rest: '45s'
    });
  }

  if (list.length === 0) {
    list.push({ exercise: isBodyweight ? 'Push-ups' : 'Bench Press', sets: 3, reps: '10-12 reps', rest: '60s' });
    list.push({ exercise: hasKneeOrHip ? 'Glute Bridges' : 'Bodyweight Squats', sets: 3, reps: '12 reps', rest: '60s' });
  }

  return list;
}

export function generateLocalDiet(answers, targetCals = 2200, dietType = 'veg') {
  const goal = answers?.goal || 'Build Muscle';
  const cals = Math.max(1200, Number(targetCals) || 2200);
  const isVeg = dietType === 'veg';

  if (goal === 'Lose Weight') {
    return isVeg
      ? [
          { meal: 'Breakfast', items: 'Oats with skim milk, chia seeds & almonds', cal: Math.round(cals * 0.25), prot: 16 },
          { meal: 'Lunch', items: '2 Wheat Roti, 1 bowl Yellow Dal, 100g Paneer, Salad', cal: Math.round(cals * 0.35), prot: 28 },
          { meal: 'Evening Snack', items: 'Roasted Chana & Black Coffee / Green Tea', cal: Math.round(cals * 0.15), prot: 10 },
          { meal: 'Dinner', items: '120g Tofu / Soya Chunks Stir-fry with Veggies', cal: Math.round(cals * 0.25), prot: 28 }
        ]
      : [
          { meal: 'Breakfast', items: 'Oats with skim milk & 3 Egg Whites + 1 Whole Egg', cal: Math.round(cals * 0.25), prot: 24 },
          { meal: 'Lunch', items: '2 Wheat Roti, 1 bowl Yellow Dal, 120g Chicken, Salad', cal: Math.round(cals * 0.35), prot: 36 },
          { meal: 'Evening Snack', items: 'Roasted Chana & Black Coffee / Green Tea', cal: Math.round(cals * 0.15), prot: 10 },
          { meal: 'Dinner', items: '140g Grilled Fish / Chicken Stir-fry with Veggies', cal: Math.round(cals * 0.25), prot: 32 }
        ];
  }

  return isVeg
    ? [
        { meal: 'Breakfast', items: 'High-protein Oats Shake (Oats, Milk, Banana, PB)', cal: Math.round(cals * 0.30), prot: 24 },
        { meal: 'Lunch', items: '3 Wheat Roti, 1 bowl Rice, Rajma/Dal, 120g Paneer', cal: Math.round(cals * 0.35), prot: 34 },
        { meal: 'Evening Snack', items: '1 scoop Whey Protein Shake + Peanut Butter Toast', cal: Math.round(cals * 0.15), prot: 26 },
        { meal: 'Dinner', items: '2 Roti, 150g Paneer / Soya Bhurji, Warm Milk', cal: Math.round(cals * 0.20), prot: 34 }
      ]
    : [
        { meal: 'Breakfast', items: 'Oats Banana Shake (Milk, Oats, PB) + 3 Boiled Eggs', cal: Math.round(cals * 0.30), prot: 30 },
        { meal: 'Lunch', items: '3 Wheat Roti, 1 bowl Rice, Dal, 150g Chicken Breast', cal: Math.round(cals * 0.35), prot: 44 },
        { meal: 'Evening Snack', items: '1 scoop Whey Protein Shake + Peanut Butter Toast', cal: Math.round(cals * 0.15), prot: 26 },
        { meal: 'Dinner', items: '2 Roti, 150g Chicken Bhurji / Egg Curry, Salad', cal: Math.round(cals * 0.20), prot: 36 }
      ];
}

const BOUNDARY_REFUSAL_REPLY =
  'Main sirf LevelUp Fitness Coach hoon. Aap mujhse sirf gym workouts, exercise safety, Indian diet plans, calories/macros, hydration, ya apni LevelUp streak & progress ke baare mein puch sakte hain.';

const JAILBREAK_PATTERN =
  /\b(ignore\s+(all\s+)?(previous|prior|above)\s+instructions|forget\s+your\s+(rules|instructions|prompt)|system\s+prompt|jailbreak|bypass\s+(rules|restrictions)|pretend\s+to\s+be|act\s+as\s+(a\s+)?(?!fitness|gym|nutrition|diet|workout))\b/i;

const FITNESS_DOMAIN_PATTERN =
  /\b(workout|workouts|gym|exercise|exercises|fitness|diet|nutrition|meal|meals|food|calorie|calories|kcal|protein|carb|carbs|fat|fats|macro|macros|weight|muscle|bulk|bulking|cut|cutting|lean|strength|stamina|cardio|hiit|abs|chest|back|legs|arms|shoulder|shoulders|bicep|tricep|squat|squats|deadlift|bench|pushup|push-up|pullup|pull-up|plank|lunge|dumbbell|barbell|kettlebell|bodyweight|machine|roti|dal|paneer|rice|oats|egg|eggs|chicken|fish|tofu|soya|whey|creatine|bcaa|supplement|water|hydrat\w*|bmi|bmr|tdee|streak|rank|xp|level|milestone|quest|snap|rest|recovery|sleep|warm\s?up|stretch|injury|pain|knee|hip|hernia|veg|non-veg|breakfast|lunch|dinner|snack|eat|khana|khau|wajan|kasrat|sehat|levelup|routine|split|ppl|sets|reps|overweight|underweight|gap|today)\b/i;

const OFF_TOPIC_PATTERN =
  /\b(python|javascript|typescript|java|c\+\+|html|css|sql|react\s+native|node\.js|coding|program|algorithm|debug|compile|github|homework|assignment|essay|thesis|poem|story|lyrics|translate|calculus|algebra|physics|chemistry|history|geography|capital\s+of|president|prime\s+minister|movie|netflix|song|cricket|ipl|fifa|world\s+cup|stock\s+market|crypto|bitcoin|forex|politics|election|horoscope|joke|riddle|weather)\b/i;

const GREETING_PATTERN = /^(hi|hello|hey|hii|namaste|ok|okay|thanks|thank\s+you|yo|sup)[!.\s]*$/i;

export function isOutOfDomainQuery(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return true;
  if (JAILBREAK_PATTERN.test(trimmed)) return true;
  if (FITNESS_DOMAIN_PATTERN.test(trimmed)) return false;
  if (OFF_TOPIC_PATTERN.test(trimmed)) return true;
  return false;
}

export function generateLocalChatReply(text, answers, appData, dietType = 'veg') {
  const trimmed = (text || '').trim();
  if (isOutOfDomainQuery(trimmed)) {
    return BOUNDARY_REFUSAL_REPLY;
  }

  if (GREETING_PATTERN.test(trimmed)) {
    return `Hi! Main LevelUp Fitness Coach hoon. Aap apne ${answers.goal} plan, workouts, diet ya ${appData.targetCalories} kcal target ke baare mein puch sakte hain.`;
  }

  if (!FITNESS_DOMAIN_PATTERN.test(trimmed)) {
    return BOUNDARY_REFUSAL_REPLY;
  }

  const logged = appData.foodLog.reduce((s, f) => s + f.cal, 0);
  const targetCals = appData.targetCalories;
  const diff = targetCals - logged;
  const lower = trimmed.toLowerCase();
  const proteinGoal = Math.round((Number(answers?.weightKg) || 70) * 2.0);
  const isVeg = dietType === 'veg';

  let reply = `Based on your profile (${answers.goal}, ${answers.weightKg}kg ➔ ${answers.targetWeightKg}kg): `;
  if (lower.includes('diet') || lower.includes('eat') || lower.includes('dinner') || lower.includes('lunch') || lower.includes('breakfast') || lower.includes('protein') || lower.includes('meal') || lower.includes('food')) {
    const source = isVeg ? '120g Paneer/Soya with Roti and Dal' : '120g Chicken/Eggs or Paneer with Roti and Dal';
    reply += `Target ${targetCals} kcal/day (~${proteinGoal}g protein). Aim for high-protein meals like ${source}.`;
  } else if (lower.includes('workout') || lower.includes('abs') || lower.includes('exercise') || lower.includes('gym') || lower.includes('sets') || lower.includes('reps')) {
    const safety = answers.healthIssue && answers.healthIssue !== 'None'
      ? ` Keep exercises gentle on your ${answers.healthIssue}.`
      : '';
    reply += `Focus on ${answers.focusAreas?.join(', ')} using ${answers.equipment} (${answers.workoutFrequency}x/week).${safety}`;
  } else if (lower.includes('gap') || lower.includes('calorie') || lower.includes('kcal') || lower.includes('today')) {
    reply += `You have logged ${logged} kcal out of your ${targetCals} kcal target (${diff >= 0 ? `${diff} kcal remaining` : `${Math.abs(diff)} kcal over`}).`;
  } else {
    reply += `Stay consistent with your ${answers.workoutFrequency}x/week schedule (${appData.streak}d streak) and aim for ${targetCals} kcal with ~${proteinGoal}g protein daily.`;
  }
  return reply;
}
