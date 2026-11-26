import React from 'react';
import { SafeAreaView, Text, ActivityIndicator, StatusBar } from 'react-native';
import { FitTrackProvider, useFitTrack } from './src/context/FitTrackContext';
import OnboardingFlow from './src/components/OnboardingFlow';
import Dashboard from './src/components/Dashboard';
import { styles } from './src/styles/theme';

function RootNavigator() {
  const { isHydrating, completedOnboarding, step } = useFitTrack();

  if (isHydrating) {
    return (
      <SafeAreaView style={styles.splashSafe}>
        <StatusBar barStyle="light-content" backgroundColor="#0B1220" />
        <Text style={styles.splashLogo}>LevelUp</Text>
        <ActivityIndicator size="large" color="#60A5FA" />
      </SafeAreaView>
    );
  }

  if (!completedOnboarding && step !== null) {
    return <OnboardingFlow />;
  }

  return <Dashboard />;
}

export default function App() {
  return (
    <FitTrackProvider>
      <RootNavigator />
    </FitTrackProvider>
  );
}
