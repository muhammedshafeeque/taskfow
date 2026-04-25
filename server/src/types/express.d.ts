export interface AuthPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  roleId?: string;
  permissions: string[];
  mustChangePassword: boolean;
}

export interface CustomerAuthPayload {
  id: string;
  email: string;
  name: string;
  orgId: string;
  isOrgAdmin: boolean;
  permissions: string[];
  mustChangePassword: boolean;
}

declare global {
  namespace Express {
    /** TaskFlow JWT user (passport-compatible name) */
    interface User extends AuthPayload {}
    interface Request {
      customerUser?: CustomerAuthPayload;
      /** Active TaskFlow workspace (set for TaskFlow JWT users). */
      activeOrganizationId?: string;
    }
  }
}

export {};
