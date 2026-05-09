// ─── Sign In Form Data ────────────────────────────────────────────────────────

export interface SignInFormData {
  email: string;
  password: string;
}

// ─── Sign In Screen Props ─────────────────────────────────────────────────────

export interface SignInScreenProps {
  isLoading?: boolean;
  onBack?: () => void;
  onSignIn?: (data: SignInFormData) => void;
  onForgotPassword?: () => void;
  onGoogleSignIn?: () => void;
  onSignUp?: () => void;
}
