import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import { createShadowStyle } from '../../src/utils/shadow';
import GradientTitle from '../../src/components/GradientTitle';
import { supabase, supabaseReady } from '../../src/lib/supabase';
import { logger } from '../../src/utils/logger';
import { LEGAL_URLS } from '../../src/constants/legal';

const PRIMARY_GRADIENT = ['#2563eb', '#7e22ce'] as const;
const DIVIDER_LINE_COLORS = [
  'rgba(37, 99, 235, 0)',
  'rgba(37, 99, 235, 0.45)',
  'rgba(37, 99, 235, 0)',
] as const;
const DIVIDER_BADGE_COLORS = [
  'rgba(37, 99, 235, 0.35)',
  'rgba(126, 34, 206, 0.45)',
] as const;
const CARD_ELEVATION = createShadowStyle({
  native: {
    shadowColor: '#000000',
    shadowOpacity: 0.6,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 18 },
    elevation: 24,
  },
  web: '0 18px 24px rgba(0, 0, 0, 0.35)',
});

const EMAIL_PLACEHOLDER = 'Enter your email';

const AuthScreen: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [hasAcceptedLegal, setHasAcceptedLegal] = useState(false);

  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslate = useRef(new Animated.Value(24)).current;
  const cardScale = useRef(new Animated.Value(0.98)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 320,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(cardTranslate, {
        toValue: 0,
        duration: 320,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 320,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, [cardOpacity, cardScale, cardTranslate]);

  const isValidEmail = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }, [email]);


  const openTerms = useCallback(() => {
    Linking.openURL(LEGAL_URLS.terms);
  }, []);

  const openPrivacy = useCallback(() => {
    Linking.openURL(LEGAL_URLS.privacy);
  }, []);

  const handleEmail = async () => {
    if (!isValidEmail || emailLoading || !hasAcceptedLegal) {
      return;
    }

    if (!supabaseReady) {
      logger.error('Auth', 'Supabase not configured', { supabaseReady });
      Alert.alert('Configuration Error', 'Authentication service is not properly configured. Please contact support.');
      return;
    }

    const maskedEmail = email.trim().replace(/(.{2})(.*)(@.*)/, '$1***$3');

    setEmailLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
        }
      });

      if (error) {
        logger.error('Auth', 'OTP signin failed', {
          email: maskedEmail,
          errorName: error.name,
          errorMessage: error.message,
          errorStatus: (error as any).status,
        });

        let userMessage = error.message;

        if (error.message.includes('Signups not allowed')) {
          userMessage = 'New account creation is currently disabled. Please contact support if you need access.';
        } else if (error.message.includes('Invalid email')) {
          userMessage = 'Please enter a valid email address.';
        } else if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
          userMessage = 'Too many attempts. Please wait a few minutes before trying again.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          userMessage = 'Unable to connect to authentication service. Please check your internet connection.';
        }

        Alert.alert('Authentication Error', userMessage);
        setEmailLoading(false);
        return;
      }

      router.replace(`/auth/verify-otp?email=${encodeURIComponent(email.trim())}`);
    } catch (error: any) {
      logger.error('Auth', 'OTP signin exception', {
        email: maskedEmail,
        error: error?.message || String(error),
        stack: error?.stack,
      });

      const errorMessage = error?.message || 'Something went wrong';
      let userMessage = 'Unable to send verification code. Please try again.';

      if (errorMessage.includes('Not configured')) {
        userMessage = 'Authentication service is not properly configured. Please contact support.';
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        userMessage = 'Unable to connect. Please check your internet connection and try again.';
      }

      Alert.alert('Error', userMessage);
      setEmailLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.root}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandSection}>
            <GradientTitle text="Zenlit" style={styles.brandTitle} />
            <Text style={styles.brandSubtitle}>Connect with people around you</Text>
          </View>

          <Animated.View
            style={[
              styles.card,
              {
                opacity: cardOpacity,
                transform: [{ translateY: cardTranslate }, { scale: cardScale }],
              },
            ]}
          >
            <Text style={styles.cardTitle}>Welcome</Text>
            <Text style={styles.cardSubtitle}>Enter your email to continue</Text>

            <View style={styles.inputBlock}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder={EMAIL_PLACEHOLDER}
                placeholderTextColor="rgba(148, 163, 184, 0.7)"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
            </View>

            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: hasAcceptedLegal }}
              onPress={() => setHasAcceptedLegal((previous) => !previous)}
              style={styles.consentRow}
            >
              <View style={[styles.checkbox, hasAcceptedLegal ? styles.checkboxChecked : null]}>
                {hasAcceptedLegal ? <Text style={styles.checkboxMark}>✓</Text> : null}
              </View>
              <Text style={styles.consentText}>
                I agree to the{' '}
                <Text style={styles.legalLink} onPress={openTerms}>Terms of Service</Text>
                {' '}and acknowledge the{' '}
                <Text style={styles.legalLink} onPress={openPrivacy}>Privacy Policy</Text>
                .
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={handleEmail}
              disabled={!isValidEmail || emailLoading || !hasAcceptedLegal}
              style={({ pressed }) => [
                styles.primaryButton,
                (!isValidEmail || emailLoading || !hasAcceptedLegal) ? styles.disabled : null,
                pressed && isValidEmail && !emailLoading && hasAcceptedLegal ? styles.primaryButtonPressed : null,
              ]}
            >
              <LinearGradient
                colors={PRIMARY_GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryGradient}
              >
                <Text style={styles.primaryLabel}>
                  {emailLoading ? 'Sending...' : 'Send Verification Code'}
                </Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    alignItems: 'center',
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brandTitle: {
    fontSize: 48,
    fontFamily: 'Inter_500Medium',
    letterSpacing: -1,
    textAlign: 'center',
  },
  brandSubtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#94a3b8',
    letterSpacing: -0.2,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderRadius: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    ...CARD_ELEVATION,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  cardSubtitle: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputBlock: {
    width: '100%',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#cbd5f5',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.3)',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    color: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
  },
  primaryButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  primaryGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  primaryLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.5,
  },
  consentRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 20,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
  checkboxMark: {
    color: '#ffffff',
    fontWeight: '700',
  },
  consentText: {
    flex: 1,
    fontSize: 13,
    color: '#cbd5e1',
    lineHeight: 18,
  },
  legalLink: {
    color: '#60a5fa',
    textDecorationLine: 'underline',
  },
});

export default AuthScreen;
