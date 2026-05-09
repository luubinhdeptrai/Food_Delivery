import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { SignInScreen, authApi } from '@/src/features/auth';
import type { SignInFormData } from '@/src/features/auth';
import { useState } from 'react';

export default function SignInPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleSignIn = async (data: SignInFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await authApi.signIn(data);

      if (error) {
        Alert.alert('Sign In Failed', error.message || 'Check your credentials and try again.');
        return;
      }

      router.replace('/(customer)/(tabs)');
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    // TODO: Navigate to Forgot Password screen
    console.log('Forgot Password pressed');
  };

  const handleGoogleSignIn = async () => {
    try {
      await authApi.signInWithGoogle();
    } catch (err) {
      Alert.alert('Error', 'Google sign-in failed.');
      console.error(err);
    }
  };

  const handleSignUp = () => {
    router.push('/(auth)/sign-up');
  };

  return (
    <SignInScreen
      isLoading={isSubmitting}
      onBack={handleBack}
      onSignIn={handleSignIn}
      onForgotPassword={handleForgotPassword}
      onGoogleSignIn={handleGoogleSignIn}
      onSignUp={handleSignUp}
    />
  );
}
