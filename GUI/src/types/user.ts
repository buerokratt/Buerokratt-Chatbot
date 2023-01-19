import { ROLES } from 'utils/constants';

export interface User {
  idCode: string;
  displayName: string;
  email: string;
  authorities: ROLES[];
  login?: string;
  firstName?: string;
  lastName?: string;
}

export interface UserDTO extends Pick<User, 'login' | 'idCode' | 'authorities' | 'displayName' | 'email'> {
}
