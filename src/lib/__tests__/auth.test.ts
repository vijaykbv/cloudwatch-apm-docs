/**
 * Unit tests for AWS SSO authentication and authorization flows
 */

import { AuthService, SessionManager, UserRole } from '../auth';

// Mock AWS SDK
jest.mock('@aws-sdk/client-cognito-identity-provider', () => ({
  CognitoIdentityProviderClient: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  GetUserCommand: jest.fn(),
}));

jest.mock('@aws-sdk/client-cognito-identity', () => ({
  CognitoIdentityClient: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  GetCredentialsForIdentityCommand: jest.fn(),
  GetIdCommand: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('AuthService', () => {
  let authService: AuthService;
  const mockConfig = {
    userPoolId: 'us-east-1_test123',
    userPoolClientId: 'test-client-id',
    identityPoolId: 'us-east-1:test-identity-pool',
    region: 'us-east-1',
    domain: 'https://test-domain.auth.us-east-1.amazoncognito.com',
  };

  beforeEach(() => {
    authService = new AuthService(mockConfig);
    jest.clearAllMocks();
  });

  describe('getAuthorizationUrl', () => {
    it('should generate correct authorization URL', () => {
      const redirectUri = 'https://example.com/callback';
      const state = 'test-state';
      
      const url = authService.getAuthorizationUrl(redirectUri, state);
      
      expect(url).toContain(mockConfig.domain);
      expect(url).toContain('response_type=code');
      expect(url).toContain('client_id=test-client-id');
      expect(url).toContain('redirect_uri=https%3A%2F%2Fexample.com%2Fcallback');
      expect(url).toContain('scope=email%20openid%20profile');
      expect(url).toContain('identity_provider=AWSSSO');
      expect(url).toContain('state=test-state');
    });

    it('should generate URL without state parameter when not provided', () => {
      const redirectUri = 'https://example.com/callback';
      
      const url = authService.getAuthorizationUrl(redirectUri);
      
      expect(url).not.toContain('state=');
    });
  });

  describe('exchangeCodeForTokens', () => {
    it('should exchange authorization code for tokens successfully', async () => {
      const mockTokenResponse = {
        access_token: 'mock-access-token',
        id_token: 'mock-id-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse),
      });

      const result = await authService.exchangeCodeForTokens('test-code', 'https://example.com/callback');

      expect(result).toEqual({
        accessToken: 'mock-access-token',
        idToken: 'mock-id-token',
        refreshToken: 'mock-refresh-token',
        expiresAt: expect.any(Number),
      });

      expect(fetch).toHaveBeenCalledWith(
        `${mockConfig.domain}/oauth2/token`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
      );
    });

    it('should throw error when token exchange fails', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      });

      await expect(
        authService.exchangeCodeForTokens('invalid-code', 'https://example.com/callback')
      ).rejects.toThrow('Token exchange failed: Bad Request');
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens successfully', async () => {
      const mockTokenResponse = {
        access_token: 'new-access-token',
        id_token: 'new-id-token',
        expires_in: 3600,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse),
      });

      const result = await authService.refreshTokens('refresh-token');

      expect(result).toEqual({
        accessToken: 'new-access-token',
        idToken: 'new-id-token',
        refreshToken: 'refresh-token', // Should remain the same
        expiresAt: expect.any(Number),
      });
    });

    it('should throw error when token refresh fails', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
      });

      await expect(
        authService.refreshTokens('invalid-refresh-token')
      ).rejects.toThrow('Token refresh failed: Unauthorized');
    });
  });

  describe('getUserProfile', () => {
    it('should get user profile successfully', async () => {
      const mockUserAttributes = [
        { Name: 'sub', Value: 'user-123' },
        { Name: 'email', Value: 'test@example.com' },
        { Name: 'given_name', Value: 'John' },
        { Name: 'family_name', Value: 'Doe' },
        { Name: 'custom:department', Value: 'Engineering' },
        { Name: 'custom:employee_id', Value: 'EMP123' },
      ];

      const mockCognitoClient = {
        send: jest.fn().mockResolvedValue({
          UserAttributes: mockUserAttributes,
        }),
      };

      (authService as any).cognitoClient = mockCognitoClient;

      const result = await authService.getUserProfile('access-token');

      expect(result).toEqual({
        sub: 'user-123',
        email: 'test@example.com',
        given_name: 'John',
        family_name: 'Doe',
        department: 'Engineering',
        employee_id: 'EMP123',
        roles: ['reviewer', 'editor'], // Engineering department gets these roles
      });
    });

    it('should handle missing user attributes gracefully', async () => {
      const mockCognitoClient = {
        send: jest.fn().mockResolvedValue({
          UserAttributes: [
            { Name: 'sub', Value: 'user-123' },
            { Name: 'email', Value: 'test@example.com' },
          ],
        }),
      };

      (authService as any).cognitoClient = mockCognitoClient;

      const result = await authService.getUserProfile('access-token');

      expect(result).toEqual({
        sub: 'user-123',
        email: 'test@example.com',
        given_name: '',
        family_name: '',
        department: undefined,
        employee_id: undefined,
        roles: ['reviewer'], // Default role
      });
    });

    it('should throw error when getting user profile fails', async () => {
      const mockCognitoClient = {
        send: jest.fn().mockRejectedValue(new Error('Access token expired')),
      };

      (authService as any).cognitoClient = mockCognitoClient;

      await expect(
        authService.getUserProfile('invalid-token')
      ).rejects.toThrow('Failed to get user profile: Error: Access token expired');
    });
  });

  describe('validateToken', () => {
    beforeEach(() => {
      // Mock atob for JWT decoding
      global.atob = jest.fn((str) => {
        if (str === 'eyJhbGciOiJSUzI1NiIsImtpZCI6InRlc3Qta2V5LWlkIn0') {
          return '{"alg":"RS256","kid":"test-key-id"}';
        }
        if (str === 'eyJhdWQiOiJ0ZXN0LWNsaWVudC1pZCIsImV4cCI6OTk5OTk5OTk5OX0') {
          return '{"aud":"test-client-id","exp":9999999999}';
        }
        return '';
      });
    });

    it('should validate token successfully', async () => {
      const mockJwks = {
        keys: [
          { kid: 'test-key-id', kty: 'RSA' }
        ]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(mockJwks),
      });

      const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6InRlc3Qta2V5LWlkIn0.eyJhdWQiOiJ0ZXN0LWNsaWVudC1pZCIsImV4cCI6OTk5OTk5OTk5OX0.signature';
      
      const result = await authService.validateToken(token);

      expect(result).toBe(true);
    });

    it('should return false for expired token', async () => {
      const mockJwks = {
        keys: [
          { kid: 'test-key-id', kty: 'RSA' }
        ]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(mockJwks),
      });

      // Mock expired token payload
      (global.atob as jest.Mock).mockImplementation((str) => {
        if (str === 'eyJhbGciOiJSUzI1NiIsImtpZCI6InRlc3Qta2V5LWlkIn0') {
          return '{"alg":"RS256","kid":"test-key-id"}';
        }
        if (str === 'ZXhwaXJlZA') {
          return '{"aud":"test-client-id","exp":1000000000}'; // Expired
        }
        return '';
      });

      const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6InRlc3Qta2V5LWlkIn0.ZXhwaXJlZA.signature';
      
      const result = await authService.validateToken(token);

      expect(result).toBe(false);
    });

    it('should return false for invalid token format', async () => {
      const result = await authService.validateToken('invalid-token');

      expect(result).toBe(false);
    });
  });

  describe('signOut', () => {
    it('should revoke token successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      await authService.signOut('access-token');

      expect(fetch).toHaveBeenCalledWith(
        `${mockConfig.domain}/oauth2/revoke`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
      );
    });

    it('should not throw error when token revocation fails', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      // Should not throw
      await expect(authService.signOut('access-token')).resolves.toBeUndefined();
    });
  });

  describe('getLogoutUrl', () => {
    it('should generate correct logout URL', () => {
      const redirectUri = 'https://example.com/logout';
      
      const url = authService.getLogoutUrl(redirectUri);
      
      expect(url).toContain(mockConfig.domain);
      expect(url).toContain('client_id=test-client-id');
      expect(url).toContain('logout_uri=https%3A%2F%2Fexample.com%2Flogout');
    });
  });

  describe('determineUserRoles', () => {
    it('should assign correct roles based on department', () => {
      const testCases: Array<[string, UserRole[]]> = [
        ['Documentation', ['reviewer', 'editor']],
        ['Engineering', ['reviewer', 'editor']],
        ['Product Management', ['reviewer', 'editor', 'admin']],
        ['Technical Writing', ['reviewer', 'editor', 'admin']],
        ['Unknown Department', ['reviewer']],
        ['', ['reviewer']],
      ];

      testCases.forEach(([department, expectedRoles]) => {
        const roles = (authService as any).determineUserRoles(department);
        expect(roles).toEqual(expectedRoles);
      });
    });
  });
});

describe('SessionManager', () => {
  const mockTokens = {
    accessToken: 'access-token',
    idToken: 'id-token',
    refreshToken: 'refresh-token',
    expiresAt: Date.now() + 3600000, // 1 hour from now
  };

  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  describe('saveTokens', () => {
    it('should save tokens to localStorage', () => {
      SessionManager.saveTokens(mockTokens);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'cloudwatch_apm_docs_auth',
        JSON.stringify(mockTokens)
      );
    });
  });

  describe('getTokens', () => {
    it('should retrieve valid tokens from localStorage', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(mockTokens));

      const result = SessionManager.getTokens();

      expect(result).toEqual(mockTokens);
    });

    it('should return null for expired tokens', () => {
      const expiredTokens = {
        ...mockTokens,
        expiresAt: Date.now() - 1000, // Expired
      };

      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(expiredTokens));

      const result = SessionManager.getTokens();

      expect(result).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith('cloudwatch_apm_docs_auth');
    });

    it('should return null when no tokens exist', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      const result = SessionManager.getTokens();

      expect(result).toBeNull();
    });
  });

  describe('clearTokens', () => {
    it('should remove tokens from localStorage', () => {
      SessionManager.clearTokens();

      expect(localStorage.removeItem).toHaveBeenCalledWith('cloudwatch_apm_docs_auth');
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when valid tokens exist', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(mockTokens));

      const result = SessionManager.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when no valid tokens exist', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      const result = SessionManager.isAuthenticated();

      expect(result).toBe(false);
    });
  });
});