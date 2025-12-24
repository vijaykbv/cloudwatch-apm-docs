export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  user: User;
  expires: string;
}

export interface AuthProvider {
  id: string;
  name: string;
  type: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  permissions: string[];
  preferences?: {
    theme?: 'light' | 'dark';
    language?: string;
    notifications?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthenticationResult {
  success: boolean;
  user?: User;
  error?: string;
  token?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}