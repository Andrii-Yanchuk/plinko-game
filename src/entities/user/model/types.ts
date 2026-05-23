export type AuthUser = {
  id: string;
  email: string;
};

export type CurrentUser = AuthUser & {
  balance: string;
  createdAt: string;
};

export type AuthResponse = {
  user: AuthUser;
};

export type AuthPayload = {
  email: string;
  password: string;
};
