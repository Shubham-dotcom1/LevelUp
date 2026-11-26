import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  STORAGE_KEY,
  INITIAL_ANSWERS,
  INITIAL_APP_DATA,
  INITIAL_CHAT_MESSAGES
} from '../constants/fitnessData';
import { calcBMRAndTDEE, getRankInfo, getTodayKey } from '../utils/fitnessMath';
import {
  generateLocalWorkouts,
  generateLocalDiet,
  generateLocalChatReply,
  isOutOfDomainQuery
} from '../utils/localFallbacks';
import {
  checkBackendHealth,
  fetchAiPlan,
  sendChatMessage
} from '../services/api';

const FitTrackContext = createContext(null);

function normalizeDailyAppData(rawData) {
  const today = getTodayKey();
  const base = { ...INITIAL_APP_DATA, ...(rawData || {}) };
  if (base.lastLogDate && base.lastLogDate !== today) {
    return {
      ...base,
      xp: Number(base.xp) || 0,
      waterCups: 0,
      todayWorkoutDone: false,
      workoutHistory: Array.isArray(base.workoutHistory) ? base.workoutHistory : [],
      foodLog: [],
      friends: Array.isArray(base.friends)
        ? base.friends.map((f) => ({ ...f, snapped: false }))
        : [],
      lastLogDate: today
    };
  }
  return {
    ...base,
    xp: Number(base.xp) || 0,
    waterCups: Number(base.waterCups) || 0,
    todayWorkoutDone: Boolean(base.todayWorkoutDone),
    workoutHistory: Array.isArray(base.workoutHistory) ? base.workoutHistory : [],
    foodLog: Array.isArray(base.foodLog) ? base.foodLog : [],
    friends: Array.isArray(base.friends) ? base.friends : [],
    lastLogDate: base.lastLogDate || today
  };
}

export function FitTrackProvider({ children }) {
  const [isHydrating, setIsHydrating] = useState(true);
  const [step, setStep] = useState(1);
  const [completedOnboarding, setCompletedOnboarding] = useState(false);

  const [answers, setAnswers] = useState(INITIAL_ANSWERS);
  const [appData, setAppData] = useState({ ...INITIAL_APP_DATA, lastLogDate: getTodayKey() });
  const [aiPlan, setAiPlan] = useState(null);
  const [loadingAiPlan, setLoadingAiPlan] = useState(false);
  const loadingAiPlanRef = useRef(false);

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRoutine, setSelectedRoutine] = useState('ppl');
  const [selectedLevel, setSelectedLevel] = useState('beginner');
  const [selectedDietGoal, setSelectedDietGoal] = useState('gain');
  const [selectedDietType, setSelectedDietType] = useState('veg');

  const [messages, setMessages] = useState(INITIAL_CHAT_MESSAGES);
  const [loadingChat, setLoadingChat] = useState(false);
  const [backendStatus, setBackendStatus] = useState({ online: false, aiConfigured: false, checked: false });

  // Ref keeps latest state snapshot for safe async persistence without stale closures
  const snapshotRef = useRef({
    answers: INITIAL_ANSWERS,
    appData: { ...INITIAL_APP_DATA, lastLogDate: getTodayKey() },
    aiPlan: null,
    completedOnboarding: false,
    messages: INITIAL_CHAT_MESSAGES,
    selectedRoutine: 'ppl',
    selectedLevel: 'beginner',
    selectedDietGoal: 'gain',
    selectedDietType: 'veg'
  });

  const persistSnapshot = useCallback((partial = {}) => {
    const next = { ...snapshotRef.current, ...partial };
    snapshotRef.current = next;

    if (partial.answers !== undefined) setAnswers(next.answers);
    if (partial.appData !== undefined) setAppData(next.appData);
    if (partial.aiPlan !== undefined) setAiPlan(next.aiPlan);
    if (partial.completedOnboarding !== undefined) setCompletedOnboarding(next.completedOnboarding);
    if (partial.messages !== undefined) setMessages(next.messages);
    if (partial.selectedRoutine !== undefined) setSelectedRoutine(next.selectedRoutine);
    if (partial.selectedLevel !== undefined) setSelectedLevel(next.selectedLevel);
    if (partial.selectedDietGoal !== undefined) setSelectedDietGoal(next.selectedDietGoal);
    if (partial.selectedDietType !== undefined) setSelectedDietType(next.selectedDietType);

    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        answers: next.answers,
        appData: next.appData,
        aiPlan: next.aiPlan,
        completedOnboarding: next.completedOnboarding,
        messages: next.messages.slice(-40),
        selectedRoutine: next.selectedRoutine,
        selectedLevel: next.selectedLevel,
        selectedDietGoal: next.selectedDietGoal,
        selectedDietType: next.selectedDietType
      })
    ).catch((err) => {
      console.warn('AsyncStorage write error:', err?.message || err);
    });
  }, []);

  const refreshBackendStatus = useCallback(async () => {
    const health = await checkBackendHealth();
    setBackendStatus({ ...health, checked: true });
    return health;
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved && mounted) {
          const parsed = JSON.parse(saved);
          const hydratedAnswers = parsed.answers ? { ...INITIAL_ANSWERS, ...parsed.answers } : INITIAL_ANSWERS;
          const hydratedAppData = normalizeDailyAppData(parsed.appData);
          const hydratedMessages = Array.isArray(parsed.messages) && parsed.messages.length > 0
            ? parsed.messages
            : INITIAL_CHAT_MESSAGES;
          const hydratedDone = Boolean(parsed.completedOnboarding);

          persistSnapshot({
            answers: hydratedAnswers,
            appData: hydratedAppData,
            aiPlan: parsed.aiPlan || null,
            completedOnboarding: hydratedDone,
            messages: hydratedMessages,
            selectedRoutine: parsed.selectedRoutine || 'ppl',
            selectedLevel: parsed.selectedLevel || 'beginner',
            selectedDietGoal: parsed.selectedDietGoal || 'gain',
            selectedDietType: parsed.selectedDietType || 'veg'
          });

          if (hydratedDone) {
            setStep(null);
          }
        }
      } catch (err) {
        console.warn('AsyncStorage hydration warning:', err?.message || err);
      } finally {
        if (mounted) {
          setIsHydrating(false);
        }
      }
    })();

    refreshBackendStatus();

    const sub = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        const current = snapshotRef.current.appData;
        const normalized = normalizeDailyAppData(current);
        if (normalized.lastLogDate !== current.lastLogDate) {
          persistSnapshot({ appData: normalized });
        }
      }
    });

    return () => {
      mounted = false;
      sub.remove();
    };
  }, [persistSnapshot, refreshBackendStatus]);

  const updateAnswers = useCallback((updater) => {
    const prev = snapshotRef.current.answers;
    const nextAnswers = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
    snapshotRef.current = { ...snapshotRef.current, answers: nextAnswers };
    setAnswers(nextAnswers);
  }, []);

  const nextStep = useCallback(() => setStep((s) => s + 1), []);
  const prevStep = useCallback(() => setStep((s) => Math.max(1, s - 1)), []);

  const fetchFitTrackAiPlan = useCallback(
    async (
      userAnswers = snapshotRef.current.answers,
      overrideDietType = snapshotRef.current.selectedDietType,
      markComplete = true
    ) => {
      if (loadingAiPlanRef.current) return null;
      loadingAiPlanRef.current = true;
      setLoadingAiPlan(true);

      const calc = calcBMRAndTDEE(userAnswers);
      const currentAppData = normalizeDailyAppData(snapshotRef.current.appData);
      const updatedAppData = { ...currentAppData, targetCalories: calc.targetCals };

      const fullContext = {
        ...userAnswers,
        dietType: overrideDietType,
        targetCalories: calc.targetCals,
        streak: updatedAppData.streak
      };

      try {
        const data = await fetchAiPlan(fullContext);
        setBackendStatus((prev) => ({ ...prev, online: true, checked: true }));
        persistSnapshot({
          answers: userAnswers,
          appData: updatedAppData,
          aiPlan: data,
          completedOnboarding: markComplete ? true : snapshotRef.current.completedOnboarding
        });
        loadingAiPlanRef.current = false;
        setLoadingAiPlan(false);
        return data;
      } catch (err) {
        console.log('LevelUp AI Plan Fetch handled gracefully:', err?.message || err);
      }

      const fallbackPlan = {
        workouts: generateLocalWorkouts(userAnswers),
        diet: generateLocalDiet(userAnswers, calc.targetCals, overrideDietType),
        advice: `Focus on progressive overload for ${userAnswers.focusAreas?.join(', ') || 'Full Body'} using ${userAnswers.equipment || 'Full gym'}.`,
        source: 'local-fallback'
      };

      persistSnapshot({
        answers: userAnswers,
        appData: updatedAppData,
        aiPlan: fallbackPlan,
        completedOnboarding: markComplete ? true : snapshotRef.current.completedOnboarding
      });
      loadingAiPlanRef.current = false;
      setLoadingAiPlan(false);
      return fallbackPlan;
    },
    [persistSnapshot]
  );

  const prepareOnboardingPlan = useCallback(async () => {
    const latestAnswers = snapshotRef.current.answers;
    const defaultDietGoal =
      latestAnswers.goal === 'Lose Weight'
        ? 'loss'
        : latestAnswers.goal === 'Build Muscle'
          ? 'gain'
          : 'maintain';
    const defaultLevel = (latestAnswers.fitnessLevel || 'Beginner').toLowerCase();

    persistSnapshot({
      selectedDietGoal: defaultDietGoal,
      selectedLevel: ['beginner', 'intermediate', 'advanced'].includes(defaultLevel) ? defaultLevel : 'beginner'
    });

    return fetchFitTrackAiPlan(latestAnswers, snapshotRef.current.selectedDietType, false);
  }, [fetchFitTrackAiPlan, persistSnapshot]);

  const finishOnboarding = useCallback(async () => {
    if (!snapshotRef.current.aiPlan) {
      await prepareOnboardingPlan();
    }
    persistSnapshot({ completedOnboarding: true });
    setStep(null);
  }, [persistSnapshot, prepareOnboardingPlan]);

  const resetOnboarding = useCallback(() => {
    persistSnapshot({ completedOnboarding: false });
    setStep(1);
  }, [persistSnapshot]);

  const addStreak = useCallback(
    (days) => {
      const current = normalizeDailyAppData(snapshotRef.current.appData);
      const updated = {
        ...current,
        streak: current.streak + days,
        totalWorkouts: current.totalWorkouts + days,
        xp: current.xp + days * 60,
        todayWorkoutDone: true
      };
      persistSnapshot({ appData: updated });
    },
    [persistSnapshot]
  );

  const resetStreak = useCallback(() => {
    const current = normalizeDailyAppData(snapshotRef.current.appData);
    persistSnapshot({
      appData: {
        ...current,
        streak: 0,
        totalWorkouts: 0,
        xp: 0,
        todayWorkoutDone: false,
        workoutHistory: []
      }
    });
  }, [persistSnapshot]);

  const adjustWater = useCallback(
    (delta) => {
      const current = normalizeDailyAppData(snapshotRef.current.appData);
      const nextCups = Math.max(0, Math.min(25, (Number(current.waterCups) || 0) + delta));
      const xpGain = delta > 0 && nextCups > current.waterCups ? 5 : 0;
      persistSnapshot({
        appData: {
          ...current,
          waterCups: nextCups,
          xp: current.xp + xpGain
        }
      });
    },
    [persistSnapshot]
  );

  const completeLiveWorkout = useCallback(
    ({ title, durationSec, completedExercises, completedSets, totalSets, xpEarned }) => {
      const current = normalizeDailyAppData(snapshotRef.current.appData);
      const sessionEntry = {
        id: `${Date.now()}`,
        date: getTodayKey(),
        title: title || 'Workout Session',
        durationSec: Math.max(1, Number(durationSec) || 1),
        completedExercises: Number(completedExercises) || 0,
        completedSets: Number(completedSets) || 0,
        totalSets: Number(totalSets) || 0,
        xpEarned: Number(xpEarned) || 60
      };
      const updatedHistory = [sessionEntry, ...(current.workoutHistory || [])].slice(0, 20);
      persistSnapshot({
        appData: {
          ...current,
          streak: current.streak + 1,
          totalWorkouts: current.totalWorkouts + 1,
          xp: current.xp + sessionEntry.xpEarned,
          todayWorkoutDone: true,
          workoutHistory: updatedHistory
        }
      });
      return sessionEntry;
    },
    [persistSnapshot]
  );

  const logFoodItem = useCallback(
    (foodItem) => {
      const current = normalizeDailyAppData(snapshotRef.current.appData);
      const updated = {
        ...current,
        foodLog: [...current.foodLog, foodItem],
        xp: current.xp + 10
      };
      persistSnapshot({ appData: updated });
    },
    [persistSnapshot]
  );

  const removeFoodItem = useCallback(
    (index) => {
      const current = normalizeDailyAppData(snapshotRef.current.appData);
      const updated = {
        ...current,
        foodLog: current.foodLog.filter((_, idx) => idx !== index)
      };
      persistSnapshot({ appData: updated });
    },
    [persistSnapshot]
  );

  const addFriend = useCallback(
    (username) => {
      const trimmed = username.trim();
      if (!trimmed) return { ok: false, error: 'Please enter a username.' };
      const current = normalizeDailyAppData(snapshotRef.current.appData);
      const exists = current.friends.some((f) => f.name.toLowerCase() === trimmed.toLowerCase());
      if (exists) return { ok: false, error: `@${trimmed} is already in your friends list.` };
      const updated = {
        ...current,
        friends: [...current.friends, { name: trimmed, streak: 1, snapped: false }]
      };
      persistSnapshot({ appData: updated });
      return { ok: true };
    },
    [persistSnapshot]
  );

  const sendFriendSnap = useCallback(
    (index) => {
      const current = normalizeDailyAppData(snapshotRef.current.appData);
      let gainedXp = 0;
      const updatedFriends = current.friends.map((item, idx) => {
        if (idx === index && !item.snapped) {
          gainedXp = 15;
          return { ...item, streak: item.streak + 1, snapped: true };
        }
        return item;
      });
      persistSnapshot({
        appData: {
          ...current,
          friends: updatedFriends,
          xp: current.xp + gainedXp
        }
      });
    },
    [persistSnapshot]
  );

  const sendChat = useCallback(
    async (text) => {
      const trimmed = (text || '').trim().slice(0, 500);
      if (!trimmed || loadingChat) return;

      const userMsg = { sender: 'user', text: trimmed };
      const nextMessages = [...snapshotRef.current.messages, userMsg];

      // Immediate client-side domain guardrail to block off-topic/jailbreak prompts without wasting API quota
      if (isOutOfDomainQuery(trimmed)) {
        const guardrailReply = generateLocalChatReply(
          trimmed,
          snapshotRef.current.answers,
          normalizeDailyAppData(snapshotRef.current.appData),
          snapshotRef.current.selectedDietType
        );
        persistSnapshot({
          messages: [...nextMessages, { sender: 'bot', text: guardrailReply }]
        });
        return;
      }

      persistSnapshot({ messages: nextMessages });
      setLoadingChat(true);

      const currentAnswers = snapshotRef.current.answers;
      const currentAppData = normalizeDailyAppData(snapshotRef.current.appData);
      const logged = currentAppData.foodLog.reduce((s, f) => s + f.cal, 0);
      const { current: rank } = getRankInfo(currentAppData.streak);

      try {
        const json = await sendChatMessage({
          message: trimmed,
          history: nextMessages.slice(-7, -1),
          context: {
            gender: currentAnswers.gender,
            age: currentAnswers.age,
            heightCm: currentAnswers.heightCm,
            heightFt: currentAnswers.heightFt,
            weightKg: currentAnswers.weightKg,
            targetWeightKg: currentAnswers.targetWeightKg,
            goal: currentAnswers.goal,
            dietType: snapshotRef.current.selectedDietType,
            motivation: currentAnswers.motivation,
            focusAreas: currentAnswers.focusAreas,
            fitnessLevel: currentAnswers.fitnessLevel,
            activityLevel: currentAnswers.activityLevel,
            equipment: currentAnswers.equipment,
            healthIssue: currentAnswers.healthIssue,
            workoutFrequency: currentAnswers.workoutFrequency,
            workoutDays: currentAnswers.workoutDays,
            streak: currentAppData.streak,
            rank: rank.name,
            targetCalories: currentAppData.targetCalories,
            loggedCalories: logged
          }
        });
        setBackendStatus((prev) => ({ ...prev, online: true, checked: true }));
        persistSnapshot({
          messages: [...nextMessages, { sender: 'bot', text: json.reply }]
        });
        setLoadingChat(false);
        return;
      } catch (err) {
        console.log('Chat fetch handled gracefully:', err?.message || err);
      }

      const fallbackReply = generateLocalChatReply(
        trimmed,
        currentAnswers,
        currentAppData,
        snapshotRef.current.selectedDietType
      );
      persistSnapshot({
        messages: [...nextMessages, { sender: 'bot', text: fallbackReply }]
      });
      setLoadingChat(false);
    },
    [loadingChat, persistSnapshot]
  );

  const clearChat = useCallback(() => {
    persistSnapshot({ messages: INITIAL_CHAT_MESSAGES });
  }, [persistSnapshot]);

  const setWorkoutOption = useCallback(
    (routine, level) => {
      persistSnapshot({
        ...(routine !== undefined ? { selectedRoutine: routine } : {}),
        ...(level !== undefined ? { selectedLevel: level } : {})
      });
    },
    [persistSnapshot]
  );

  const setDietOption = useCallback(
    (goal, type) => {
      persistSnapshot({
        ...(goal !== undefined ? { selectedDietGoal: goal } : {}),
        ...(type !== undefined ? { selectedDietType: type } : {})
      });
    },
    [persistSnapshot]
  );

  const value = {
    isHydrating,
    step,
    completedOnboarding,
    answers,
    updateAnswers,
    appData,
    aiPlan,
    loadingAiPlan,
    activeTab,
    setActiveTab,
    selectedRoutine,
    selectedLevel,
    setWorkoutOption,
    selectedDietGoal,
    selectedDietType,
    setDietOption,
    messages,
    loadingChat,
    backendStatus,
    refreshBackendStatus,
    nextStep,
    prevStep,
    prepareOnboardingPlan,
    finishOnboarding,
    resetOnboarding,
    fetchFitTrackAiPlan,
    addStreak,
    resetStreak,
    adjustWater,
    completeLiveWorkout,
    logFoodItem,
    removeFoodItem,
    addFriend,
    sendFriendSnap,
    sendChat,
    clearChat
  };

  return <FitTrackContext.Provider value={value}>{children}</FitTrackContext.Provider>;
}

export function useFitTrack() {
  const ctx = useContext(FitTrackContext);
  if (!ctx) {
    throw new Error('useFitTrack must be used inside FitTrackProvider');
  }
  return ctx;
}
