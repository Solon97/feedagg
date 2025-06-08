// User Entity - Core domain model
export interface UserEntity {
  readonly id: string;
  readonly email: string;
  readonly fullName: string | null;
  readonly displayName: string; // Computed property: fullName || email
  readonly avatarUrl: string | null;
  readonly digestFrequency: DigestFrequency;
  readonly digestTime: string;
  readonly timezone: string;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export type DigestFrequency = "daily" | "weekly" | "monthly";

export interface CreateUserParams {
  readonly email: string;
  readonly fullName?: string;
  readonly avatarUrl?: string;
  readonly digestFrequency?: DigestFrequency;
  readonly digestTime?: string;
  readonly timezone?: string;
}

export interface UpdateUserParams {
  readonly fullName?: string;
  readonly avatarUrl?: string;
  readonly digestFrequency?: DigestFrequency;
  readonly digestTime?: string;
  readonly timezone?: string;
  readonly isActive?: boolean;
}

// User factory with validation
export class User {
  static create(params: CreateUserParams & { id: string }): UserEntity {
    if (!this.isValidEmail(params.email)) {
      throw new Error("Invalid email format");
    }

    const fullName = params.fullName || null;
    const displayName = fullName || params.email;

    return {
      id: params.id,
      email: params.email,
      fullName,
      displayName,
      avatarUrl: params.avatarUrl || null,
      digestFrequency: params.digestFrequency || "daily",
      digestTime: params.digestTime || "09:00:00",
      timezone: params.timezone || "UTC",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static update(user: UserEntity, params: UpdateUserParams): UserEntity {
    const updatedFullName =
      params.fullName !== undefined ? params.fullName : user.fullName;
    const displayName = updatedFullName || user.email;

    return {
      ...user,
      ...params,
      displayName,
      updatedAt: new Date(),
    };
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
