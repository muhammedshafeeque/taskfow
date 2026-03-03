export interface AuthPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  roleId?: string;
  permissions: string[];
  mustChangePassword: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export {};
