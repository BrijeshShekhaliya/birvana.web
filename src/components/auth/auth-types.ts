export type AuthView = 
  | 'welcome'
  | 'login'
  | 'login-otp'
  | 'register'
  | 'verify-otp';

export type AuthFlowState = {
  view: AuthView;
  email: string;
  password?: string;
  firstName?: string;
  source?: string;
  error: string | null;
  message: string | null;
  loading: boolean;
  otpType: 'signup' | 'email';
};
