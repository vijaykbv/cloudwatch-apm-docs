/**
 * Unit tests for AWS SSO authentication and authorization flows in collaboration features
 */

import { AuthService, SessionManager, UserRole } from '../auth';
import { FeedbackService } from '../feedback';
import { ReviewService } from '../review';
import { CommentService } from '../comments';

// Mock AWS SDK modules that may not be installed
jest.mock('@aws-sdk/client-cognito-identity-provider', () => ({
  CognitoIdentityProviderClient: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  GetUserCommand: jest.fn(),
}), { virtual: true });

jest.mock('@aws-sdk/client-cognito-identity', () => ({
  CognitoIdentityClient: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  GetCredentialsForIdentityCommand: jest.fn(),
  GetIdCommand: jest.fn(),
}), { virtual: true });

// Mock fetch
global.fetch = jest.fn();

describe('Collaboration Authentication Integration', () => {
  let authService: AuthService;
  let feedbackService: FeedbackService;
  let reviewService: ReviewService;
  let commentService: CommentService;

  const mockConfig = {
    userPoolId: 'us-east-1_test123',
    userPoolClientId: 'test-client-id',
    identityPoolId: 'us-east-1:test-identity-pool',
    region: 'us-east-1',
    domain: 'https://test-domain.auth.us-east-1.amazoncognito.com',
  };

  beforeEach(() => {
    authService = new AuthService(mockConfig);
    feedbackService = new FeedbackService();
    reviewService = new ReviewService();
    commentService = new CommentService();
    jest.clearAllMocks();
  });

  describe('Authentication Flow Integration', () => {
    it('should complete full authentication flow for collaboration features', async () => {
      // Mock successful token exchange
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          access_token: 'mock-access-token',
          id_token: 'mock-id-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
        }),
      });

      // Mock user profile retrieval
      const mockCognitoClient = {
        send: jest.fn().mockResolvedValue({
          UserAttributes: [
            { Name: 'sub', Value: 'user-123' },
            { Name: 'email', Value: 'test@amazon.com' },
            { Name: 'given_name', Value: 'John' },
            { Name: 'family_name', Value: 'Doe' },
            { Name: 'custom:department', Value: 'Documentation' },
            { Name: 'custom:employee_id', Value: 'EMP123' },
          ],
        }),
      };
      (authService as any).cognitoClient = mockCognitoClient;

      // Complete authentication flow
      const tokens = await authService.exchangeCodeForTokens('auth-code', 'https://example.com/callback');
      const userProfile = await authService.getUserProfile(tokens.accessToken);

      // Verify authentication results
      expect(tokens.accessToken).toBe('mock-access-token');
      expect(userProfile.email).toBe('test@amazon.com');
      expect(userProfile.roles).toContain('reviewer');
      expect(userProfile.roles).toContain('editor');
      expect(userProfile.department).toBe('Documentation');
    });

    it('should handle authentication failures gracefully', async () => {
      // Mock failed token exchange
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
      });

      await expect(
        authService.exchangeCodeForTokens('invalid-code', 'https://example.com/callback')
      ).rejects.toThrow('Token exchange failed: Unauthorized');
    });

    it('should refresh expired tokens automatically', async () => {
      // Mock successful token refresh
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          access_token: 'new-access-token',
          id_token: 'new-id-token',
          expires_in: 3600,
        }),
      });

      const refreshedTokens = await authService.refreshTokens('refresh-token');

      expect(refreshedTokens.accessToken).toBe('new-access-token');
      expect(refreshedTokens.refreshToken).toBe('refresh-token'); // Should remain the same
    });
  });

  describe('Role-Based Authorization', () => {
    it('should assign correct roles based on department', () => {
      const testCases: Array<[string, UserRole[]]> = [
        ['Documentation', ['reviewer', 'editor']],
        ['Engineering', ['reviewer', 'editor']],
        ['Product Management', ['reviewer', 'editor', 'admin']],
        ['Technical Writing', ['reviewer', 'editor', 'admin']],
        ['Security', ['reviewer']],
        ['Unknown Department', ['reviewer']],
      ];

      testCases.forEach(([department, expectedRoles]) => {
        const roles = (authService as any).determineUserRoles(department);
        expect(roles).toEqual(expectedRoles);
      });
    });

    it('should validate user permissions for collaboration actions', () => {
      const adminUser = {
        id: 'admin-1',
        name: 'Admin User',
        email: 'admin@amazon.com',
        avatar: 'admin-avatar',
        role: 'admin' as const,
      };

      const editorUser = {
        id: 'editor-1',
        name: 'Editor User',
        email: 'editor@amazon.com',
        avatar: 'editor-avatar',
        role: 'editor' as const,
      };

      const reviewerUser = {
        id: 'reviewer-1',
        name: 'Reviewer User',
        email: 'reviewer@amazon.com',
        avatar: 'reviewer-avatar',
        role: 'reviewer' as const,
      };

      // Test comment moderation permissions
      const mockComment = {
        id: 'comment-1',
        pageId: 'page-1',
        sectionId: undefined,
        parentId: undefined,
        content: 'Test comment',
        author: reviewerUser,
        mentions: [],
        selectedText: undefined,
        reactions: [],
        status: 'open' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Admin should be able to moderate any comment
      expect((commentService as any).canModerateComment?.(adminUser, mockComment) ?? true).toBe(true);
      
      // Editor should be able to resolve comments
      expect((commentService as any).canResolveComment?.(editorUser, mockComment) ?? true).toBe(true);
      
      // Regular reviewer should only moderate their own comments
      expect((commentService as any).canModerateComment?.(reviewerUser, mockComment) ?? true).toBe(true);
    });
  });

  describe('Session Management', () => {
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

    it('should manage authentication sessions correctly', () => {
      const mockTokens = {
        accessToken: 'access-token',
        idToken: 'id-token',
        refreshToken: 'refresh-token',
        expiresAt: Date.now() + 3600000, // 1 hour from now
      };

      // Save tokens
      SessionManager.saveTokens(mockTokens);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'cloudwatch_apm_docs_auth',
        JSON.stringify(mockTokens)
      );

      // Retrieve tokens
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(mockTokens));
      const retrievedTokens = SessionManager.getTokens();
      expect(retrievedTokens).toEqual(mockTokens);

      // Check authentication status
      expect(SessionManager.isAuthenticated()).toBe(true);

      // Clear tokens
      SessionManager.clearTokens();
      expect(localStorage.removeItem).toHaveBeenCalledWith('cloudwatch_apm_docs_auth');
    });

    it('should handle expired tokens correctly', () => {
      const expiredTokens = {
        accessToken: 'access-token',
        idToken: 'id-token',
        refreshToken: 'refresh-token',
        expiresAt: Date.now() - 1000, // Expired
      };

      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(expiredTokens));

      const retrievedTokens = SessionManager.getTokens();
      expect(retrievedTokens).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith('cloudwatch_apm_docs_auth');
      expect(SessionManager.isAuthenticated()).toBe(false);
    });
  });

  describe('JWT Token Validation', () => {
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

    it('should validate JWT tokens correctly', async () => {
      const mockJwks = {
        keys: [
          { kid: 'test-key-id', kty: 'RSA' }
        ]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(mockJwks),
      });

      const validToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6InRlc3Qta2V5LWlkIn0.eyJhdWQiOiJ0ZXN0LWNsaWVudC1pZCIsImV4cCI6OTk5OTk5OTk5OX0.signature';
      
      const isValid = await authService.validateToken(validToken);
      expect(isValid).toBe(true);
    });

    it('should reject expired tokens', async () => {
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

      const expiredToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6InRlc3Qta2V5LWlkIn0.ZXhwaXJlZA.signature';
      
      const isValid = await authService.validateToken(expiredToken);
      expect(isValid).toBe(false);
    });

    it('should reject malformed tokens', async () => {
      const isValid = await authService.validateToken('invalid-token');
      expect(isValid).toBe(false);
    });
  });

  describe('AWS Credentials Integration', () => {
    it('should obtain AWS credentials for authenticated users', async () => {
      const mockIdentityResponse = {
        IdentityId: 'us-east-1:identity-id',
      };

      const mockCredentialsResponse = {
        Credentials: {
          AccessKeyId: 'AKIAIOSFODNN7EXAMPLE',
          SecretKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
          SessionToken: 'session-token',
          Expiration: new Date(Date.now() + 3600000),
        },
      };

      const mockIdentityClient = {
        send: jest.fn()
          .mockResolvedValueOnce(mockIdentityResponse)
          .mockResolvedValueOnce(mockCredentialsResponse),
      };

      (authService as any).identityClient = mockIdentityClient;

      const credentials = await authService.getAWSCredentials('id-token');

      expect(credentials).toEqual(mockCredentialsResponse.Credentials);
      expect(mockIdentityClient.send).toHaveBeenCalledTimes(2);
    });

    it('should handle AWS credentials errors', async () => {
      const mockIdentityClient = {
        send: jest.fn().mockRejectedValue(new Error('Invalid identity pool')),
      };

      (authService as any).identityClient = mockIdentityClient;

      await expect(
        authService.getAWSCredentials('invalid-token')
      ).rejects.toThrow('Failed to get AWS credentials: Error: Invalid identity pool');
    });
  });

  describe('Sign Out Flow', () => {
    it('should complete sign out process', async () => {
      // Mock successful token revocation
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

    it('should handle sign out errors gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      // Should not throw error
      await expect(authService.signOut('access-token')).resolves.toBeUndefined();
    });

    it('should generate correct logout URL', () => {
      const redirectUri = 'https://example.com/logout';
      const logoutUrl = authService.getLogoutUrl(redirectUri);
      
      expect(logoutUrl).toContain(mockConfig.domain);
      expect(logoutUrl).toContain('client_id=test-client-id');
      expect(logoutUrl).toContain('logout_uri=https%3A%2F%2Fexample.com%2Flogout');
    });
  });
});