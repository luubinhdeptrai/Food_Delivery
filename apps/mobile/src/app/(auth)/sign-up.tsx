import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { SignUpScreen, authApi } from '@/src/features/auth';
import type { SignUpFormData } from '@/src/features/auth';
import { useState } from 'react';

export default function SignUpPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleContinue = async (data: SignUpFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await authApi.signUp(data);

      if (error) {
        Alert.alert('Registration Failed', error.message || 'Please check your information and try again.');
        return;
      }

      Alert.alert('Success', 'Account created successfully!');
      router.replace('/(customer)/(tabs)');
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogIn = () => {
    router.back(); // Navigate back to the welcome/login screen
  };

  const handleTermsPress = () => {
    // TODO: Navigate to Terms & Conditions
    console.log('Terms & Conditions pressed');
  };

  const handlePrivacyPress = () => {
    // TODO: Navigate to Privacy Policy
    console.log('Privacy Policy pressed');
  };

  return (
    <SignUpScreen
      isLoading={isSubmitting}
      onBack={handleBack}
      onContinue={handleContinue}
      onLogIn={handleLogIn}
      onTermsPress={handleTermsPress}
      onPrivacyPress={handlePrivacyPress}
    />
  );
}
