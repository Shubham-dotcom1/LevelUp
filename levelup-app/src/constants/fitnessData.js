export const STORAGE_KEY = 'fittrack_real_data_v8';

export const RANKS = [
  { name: 'Beginner', min: 0 },
  { name: 'Bronze', min: 3 },
  { name: 'Silver', min: 7 },
  { name: 'Gold', min: 15 },
  { name: 'Platinum', min: 30 },
  { name: 'Legend', min: 60 }
];

export const MILESTONES = [
  { title: '3-Day Start', days: 3 },
  { title: '7-Day Week Warrior', days: 7 },
  { title: '14-Day Habit Builder', days: 14 },
  { title: '30-Day Consistency King', days: 30 },
  { title: '60-Day Iron Discipline', days: 60 },
  { title: '100-Day Gym Legend', days: 100 }
];

export const WORKOUT_ROUTINES = {
  ppl: {
    label: 'Push/Pull/Legs',
    list: ['Bench Press', 'Incline DB Press', 'Overhead Press', 'Tricep Rope Pushdown', 'Lateral Raises']
  },
  fullbody: {
    label: 'Full Body Routine',
    list: ['Barbell Squats', 'Push-ups', 'Lat Pulldown', 'Dumbbell Lunges', 'Plank Hold']
  },
  upperlower: {
    label: 'Upper/Lower Split',
    list: ['Pull-ups', 'Bench Press', 'Seated Cable Row', 'Bicep Curls', 'Shoulder Press']
  },
  fatloss: {
    label: 'Fat Loss HIIT',
    list: ['Jumping Jacks', 'Burpees', 'Mountain Climbers', 'Jump Squats', 'High Knees']
  }
};

export const WORKOUT_LEVELS = {
  beginner: { label: 'Beginner', sets: 3, reps: '10-12 reps', rest: '90s' },
  intermediate: { label: 'Intermediate', sets: 4, reps: '12-15 reps', rest: '60s' },
  advanced: { label: 'Advanced', sets: 5, reps: '15-20 reps', rest: '45s' }
};

export const DEFAULT_DIETS = {
  loss: {
    veg: [
      { meal: 'Breakfast', items: 'Oats + Skim Milk + Chia Seeds', cal: 300, prot: 12 },
      { meal: 'Lunch', items: '2 Roti, Dal, Salad, 100g Curd', cal: 450, prot: 18 },
      { meal: 'Snack', items: 'Roasted Chana + Black Coffee', cal: 160, prot: 9 },
      { meal: 'Dinner', items: '120g Grilled Paneer + Veggies', cal: 380, prot: 24 }
    ],
    nonveg: [
      { meal: 'Breakfast', items: '3 Egg Whites + 1 Whole Egg + Toast', cal: 310, prot: 22 },
      { meal: 'Lunch', items: '150g Chicken Breast + Rice + Salad', cal: 460, prot: 42 },
      { meal: 'Snack', items: '1 Apple + Green Tea', cal: 95, prot: 0 },
      { meal: 'Dinner', items: '150g Grilled Fish/Chicken + Veggies', cal: 350, prot: 36 }
    ]
  },
  maintain: {
    veg: [
      { meal: 'Breakfast', items: '2 Paneer Paratha + Curd', cal: 520, prot: 20 },
      { meal: 'Lunch', items: '3 Roti, Dal, Sabzi, Salad', cal: 580, prot: 18 },
      { meal: 'Snack', items: '1 Banana + Peanut Butter Toast', cal: 320, prot: 10 },
      { meal: 'Dinner', items: 'Soya Chunks Pulao + Raita', cal: 540, prot: 34 }
    ],
    nonveg: [
      { meal: 'Breakfast', items: '3 Egg Omelette + 2 Brown Bread + Milk', cal: 480, prot: 28 },
      { meal: 'Lunch', items: '2 Roti + Chicken Curry + Rice', cal: 650, prot: 40 },
      { meal: 'Snack', items: 'Whey Protein Shake + Almonds', cal: 280, prot: 28 },
      { meal: 'Dinner', items: '2 Roti + 3 Egg Bhurji', cal: 490, prot: 24 }
    ]
  },
  gain: {
    veg: [
      { meal: 'Breakfast', items: 'Oats, Milk, Banana, PB Shake', cal: 680, prot: 24 },
      { meal: 'Lunch', items: '3 Roti, Rice, Rajma, 100g Paneer', cal: 850, prot: 34 },
      { meal: 'Snack', items: 'Whey Scoop + 2 Boiled Potatoes', cal: 350, prot: 28 },
      { meal: 'Dinner', items: '3 Roti, 150g Paneer Bhurji, Milk', cal: 740, prot: 38 }
    ],
    nonveg: [
      { meal: 'Breakfast', items: '4 Eggs + 3 Toast + Banana Shake', cal: 720, prot: 36 },
      { meal: 'Lunch', items: '200g Chicken Breast + Rice + Dal', cal: 880, prot: 58 },
      { meal: 'Snack', items: 'PB Sandwich + Whey Shake', cal: 450, prot: 34 },
      { meal: 'Dinner', items: '3 Roti + 150g Chicken Curry', cal: 680, prot: 44 }
    ]
  }
};

export const PRESET_FOODS = [
  { name: 'Roti (1 pc)', cal: 100, prot: 3 },
  { name: 'Dal (1 bowl)', cal: 150, prot: 9 },
  { name: 'Paneer (100g)', cal: 265, prot: 18 },
  { name: 'Boiled Eggs (2 pcs)', cal: 155, prot: 13 },
  { name: 'Chicken Breast (100g)', cal: 165, prot: 31 },
  { name: 'Rice (1 bowl)', cal: 200, prot: 4 },
  { name: 'Oats (50g)', cal: 190, prot: 7 },
  { name: 'Whey Protein (1 scoop)', cal: 120, prot: 24 }
];

export const INITIAL_ANSWERS = {
  gender: 'Male',
  motivation: 'Health',
  goal: 'Build Muscle',
  source: 'Instagram',
  focusAreas: ['Full Body'],
  fitnessLevel: 'Beginner',
  activityLevel: 'Sedentary',
  age: 20,
  heightCm: 175,
  heightFt: "5' 9\"",
  weightKg: 70,
  targetWeightKg: 75,
  healthIssue: 'None',
  equipment: 'Full gym',
  workoutFrequency: 4,
  workoutDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
  reminders: true
};

export const INITIAL_APP_DATA = {
  streak: 0,
  totalWorkouts: 0,
  xp: 0,
  waterCups: 0,
  todayWorkoutDone: false,
  workoutHistory: [],
  targetCalories: 2200,
  foodLog: [],
  friends: [],
  lastLogDate: ''
};

export const INITIAL_CHAT_MESSAGES = [
  {
    sender: 'bot',
    text: 'Hi! Main LevelUp AI Coach hoon. Aapke exact setup data ke hisaab se Workout Plan, Diet Plan ya calories ke baare mein kuch bhi pucho.'
  }
];

export const DASHBOARD_TABS = [
  ['overview', 'Overview'],
  ['workouts', 'Workout Plan'],
  ['diet', 'Diet Plan'],
  ['calories', 'Calories'],
  ['friends', 'Friends'],
  ['chat', 'AI Coach']
];

export const QUICK_CHAT_PROMPTS = [
  'Custom diet for my target weight?',
  'Quick 15-min workout with my equipment',
  'Check my calorie gap for today'
];
