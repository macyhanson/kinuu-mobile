import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/Button';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const { user, token } = await authService.login({ email: email.trim(), password });
      await setUser(user, token);
      router.replace('/(main)/home');
    } catch (err: unknown) {
      Alert.alert('Login Failed', (err as Error).message ?? 'Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo / Brand */}
        <View style={styles.brand}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>B</Text>
          </View>
          <Text style={styles.appName}>BrainyAct</Text>
          <Text style={styles.tagline}>Move. Learn. Grow.</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Welcome back</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="you@email.com"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
            <Text style={styles.forgotLink}>Forgot password?</Text>
          </TouchableOpacity>

          <Button
            label="Sign In"
            onPress={handleLogin}
            loading={loading}
            fullWidth
            size="lg"
            style={styles.submitBtn}
          />

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>New to BrainyAct? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.signupLink}>Create account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgApp,
  },
  scroll: {
    flexGrow: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
    gap: Spacing.xl,
  },
  brand: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.xxl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: Colors.white,
    fontSize: 40,
    fontWeight: '700',
  },
  appName: {
    fontSize: Typography.size.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  tagline: {
    fontSize: Typography.size.base,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  form: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  formTitle: {
    fontSize: Typography.size.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  field: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: Typography.size.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
    backgroundColor: Colors.offWhite,
  },
  forgotLink: {
    color: Colors.primary,
    fontSize: Typography.size.sm,
    textAlign: 'right',
  },
  submitBtn: {
    marginTop: Spacing.sm,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  signupText: {
    color: Colors.textMuted,
    fontSize: Typography.size.base,
  },
  signupLink: {
    color: Colors.primary,
    fontSize: Typography.size.base,
    fontWeight: '600',
  },
});
