import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { useChildStore } from '@/stores/childStore';

export default function RootLayout() {
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const loadChildren = useChildStore((s) => s.loadFromStorage);

  useEffect(() => {
    restoreSession();
    loadChildren();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(main)" />
        <Stack.Screen name="(assessment)" />
        <Stack.Screen name="(session)" />
        <Stack.Screen name="(offline)" />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
