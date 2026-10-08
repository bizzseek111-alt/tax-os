import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';
import { UserRole } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'taxos_jwt_super_secret_signing_key_production_grade_2026';
const TOKEN_EXPIRY = '24h';

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  organizationId: string;
  organizationSlug: string;
}

export interface AuthContext {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
  };
  organizationId: string;
  membershipRole: UserRole;
}

export class AuthService {
  /**
   * Hashes a plaintext password using bcrypt with 10 salt rounds.
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  /**
   * Compares a plaintext password against a bcrypt hash.
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Issues a signed JWT token containing user identity and tenant context.
   */
  static generateToken(payload: AuthTokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
  }

  /**
   * Verifies and decodes a JWT token.
   */
  static verifyToken(token: string): AuthTokenPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    } catch {
      throw new Error('INVALID_AUTH_TOKEN');
    }
  }

  /**
   * Authenticates a user by email and password, returning user profile and active organization JWT.
   */
  static async login(email: string, passwordPlain: string, orgSlug?: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const isMatch = await this.verifyPassword(passwordPlain, user.passwordHash);
    if (!isMatch) {
      throw new Error('INVALID_CREDENTIALS');
    }

    if (user.memberships.length === 0) {
      throw new Error('NO_ORGANIZATION_MEMBERSHIP');
    }

    // Select primary organization (or matching orgSlug)
    const membership = orgSlug
      ? user.memberships.find((m) => m.organization.slug === orgSlug) || user.memberships[0]
      : user.memberships[0];

    const payload: AuthTokenPayload = {
      userId: user.id,
      email: user.email,
      role: membership.role,
      organizationId: membership.organizationId,
      organizationSlug: membership.organization.slug,
    };

    const token = this.generateToken(payload);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      organization: {
        id: membership.organization.id,
        name: membership.organization.name,
        slug: membership.organization.slug,
        tier: membership.organization.tier,
      },
    };
  }

  /**
   * Resolves authentication context from Authorization header Bearer token.
   */
  static async resolveAuthContext(authHeader?: string): Promise<AuthContext> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('UNAUTHORIZED');
    }

    const token = authHeader.substring(7);
    const decoded = this.verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        memberships: {
          where: { organizationId: decoded.organizationId },
        },
      },
    });

    if (!user || user.memberships.length === 0) {
      throw new Error('UNAUTHORIZED_OR_TENANT_REVOKED');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      organizationId: decoded.organizationId,
      membershipRole: user.memberships[0].role,
    };
  }
}
