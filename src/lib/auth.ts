import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { CognitoIdentityClient, GetCredentialsForIdentityCommand, GetIdCommand } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';

export interface AuthConfig {
  userPoolId: string;
  userPoolClientId: string;
  identityPoolId: string;
  region: string;
  domain: string;
}

export interface UserProfile {
  sub: string;
  email: string;
  given_name: string;
  family_name: string;
  department?: string;
  employee_id?: string;
  roles: UserRole[];
}

export type UserRole = 'reviewer' | 'editor' | 'admin';

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
}

export class AuthService {
  private config: AuthConfig;
  private cognitoClient: CognitoIdentityProviderClient;
  private identityClient: CognitoIdentityClient;

  constructor(config: AuthConfig) {
    this.config = config;
    this.cognitoClient = new CognitoIdentityProviderClient({ region: config.region });
    this.identityClient = new CognitoIdentityClient({ region: config.region });
  }

  /**
   * Get the authorization URL for AWS SSO login
   */
  getAuthorizationUrl(redirectUri: string, state?: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.userPoolClientId,
      redirect_uri: redirectUri,
      scope: 'email openid profile',
      identity_provider: 'AWSSSO',
    });

    if (state) {
      params.append('state', state);
    }

    return `${this.config.domain}/oauth2/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string, redirectUri: string): Promise<AuthTokens> {
    const response = await fetch(`${this.config.domain}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.config.userPoolClientId,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      accessToken: data.access_token,
      idToken: data.id_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (data.expires_in * 1000),
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const response = await fetch(`${this.config.domain}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.config.userPoolClientId,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      accessToken: data.access_token,
      idToken: data.id_token,
      refreshToken: refreshToken, // Refresh token doesn't change
      expiresAt: Date.now() + (data.expires_in * 1000),
    };
  }

  /**
   * Get user profile from access token
   */
  async getUserProfile(accessToken: string): Promise<UserProfile> {
    try {
      const command = new GetUserCommand({
        AccessToken: accessToken,
      });

      const response = await this.cognitoClient.send(command);
      
      const attributes = response.UserAttributes || [];
      const getAttributeValue = (name: string) => 
        attributes.find(attr => attr.Name === name)?.Value;

      // Determine user roles based on department or custom attributes
      const roles = this.determineUserRoles(getAttributeValue('custom:department') || '');

      return {
        sub: getAttributeValue('sub') || '',
        email: getAttributeValue('email') || '',
        given_name: getAttributeValue('given_name') || '',
        family_name: getAttributeValue('family_name') || '',
        department: getAttributeValue('custom:department'),
        employee_id: getAttributeValue('custom:employee_id'),
        roles,
      };
    } catch (error) {
      throw new Error(`Failed to get user profile: ${error}`);
    }
  }

  /**
   * Get AWS credentials for authenticated user
   */
  async getAWSCredentials(idToken: string): Promise<any> {
    try {
      const getIdCommand = new GetIdCommand({
        IdentityPoolId: this.config.identityPoolId,
        Logins: {
          [`cognito-idp.${this.config.region}.amazonaws.com/${this.config.userPoolId}`]: idToken,
        },
      });

      const identityResponse = await this.identityClient.send(getIdCommand);
      
      if (!identityResponse.IdentityId) {
        throw new Error('Failed to get identity ID');
      }

      const getCredentialsCommand = new GetCredentialsForIdentityCommand({
        IdentityId: identityResponse.IdentityId,
        Logins: {
          [`cognito-idp.${this.config.region}.amazonaws.com/${this.config.userPoolId}`]: idToken,
        },
      });

      const credentialsResponse = await this.identityClient.send(getCredentialsCommand);
      
      return credentialsResponse.Credentials;
    } catch (error) {
      throw new Error(`Failed to get AWS credentials: ${error}`);
    }
  }

  /**
   * Validate JWT token
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      // Decode JWT header to get key ID
      const [headerB64] = token.split('.');
      const header = JSON.parse(atob(headerB64));
      
      // Get JWKS from Cognito
      const jwksUrl = `https://cognito-idp.${this.config.region}.amazonaws.com/${this.config.userPoolId}/.well-known/jwks.json`;
      const jwksResponse = await fetch(jwksUrl);
      const jwks = await jwksResponse.json();
      
      // Find the key that matches the token's key ID
      const key = jwks.keys.find((k: any) => k.kid === header.kid);
      if (!key) {
        return false;
      }

      // For production, implement proper JWT signature verification
      // This is a simplified validation
      const [, payloadB64] = token.split('.');
      const payload = JSON.parse(atob(payloadB64));
      
      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        return false;
      }

      // Check token audience
      if (payload.aud !== this.config.userPoolClientId) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Sign out user
   */
  async signOut(accessToken: string): Promise<void> {
    try {
      await fetch(`${this.config.domain}/oauth2/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          token: accessToken,
          client_id: this.config.userPoolClientId,
        }),
      });
    } catch (error) {
      // Log error but don't throw - sign out should always succeed locally
      console.error('Failed to revoke token:', error);
    }
  }

  /**
   * Get logout URL
   */
  getLogoutUrl(redirectUri: string): string {
    const params = new URLSearchParams({
      client_id: this.config.userPoolClientId,
      logout_uri: redirectUri,
    });

    return `${this.config.domain}/logout?${params.toString()}`;
  }

  /**
   * Determine user roles based on department or other attributes
   */
  private determineUserRoles(department: string): UserRole[] {
    const roles: UserRole[] = ['reviewer']; // Default role

    // Map departments to roles
    const departmentRoleMap: Record<string, UserRole[]> = {
      'Documentation': ['reviewer', 'editor'],
      'Engineering': ['reviewer', 'editor'],
      'Product Management': ['reviewer', 'editor', 'admin'],
      'Technical Writing': ['reviewer', 'editor', 'admin'],
    };

    const mappedRoles = departmentRoleMap[department];
    if (mappedRoles) {
      return mappedRoles;
    }

    return roles;
  }
}

// Session management utilities
export class SessionManager {
  private static readonly STORAGE_KEY = 'cloudwatch_apm_docs_auth';

  static saveTokens(tokens: AuthTokens): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tokens));
    }
  }

  static getTokens(): AuthTokens | null {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const tokens = JSON.parse(stored);
        // Check if tokens are expired
        if (tokens.expiresAt > Date.now()) {
          return tokens;
        }
        // Remove expired tokens
        this.clearTokens();
      }
    }
    return null;
  }

  static clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  static isAuthenticated(): boolean {
    return this.getTokens() !== null;
  }
}

// React hook for authentication
export function useAuth() {
  // This would be implemented as a React hook in a real application
  // For now, providing the interface
  return {
    isAuthenticated: SessionManager.isAuthenticated(),
    user: null as UserProfile | null,
    login: (redirectUri: string) => {},
    logout: () => {},
    refreshToken: () => Promise.resolve(),
  };
}