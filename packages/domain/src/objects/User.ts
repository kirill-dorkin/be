import { type Metadata } from "./Metadata";

export interface User {
  checkoutIds: string[];
  email: string;
  firstName: string;
  id: string;
  isStaff: boolean;
  lastName: string;
  metadata: Metadata;
  permissionGroups: UserPermissionGroup[];
}

export interface RefreshToken {
  refreshToken: string;
}

export interface UserPermissionGroup {
  id: string;
  name: string;
}
