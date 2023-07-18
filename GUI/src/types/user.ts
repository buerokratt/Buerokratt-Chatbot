import { ROLES } from 'utils/constants';

export interface User {
  login?: string;
  fullName?: string;
  firstName: string;
  lastName: string;
  idCode: string;
  displayName: string;
  csaTitle: string;
  csaEmail: string;
  authorities: ROLES[];
  customerSupportStatus: 'online' | 'idle' | 'offline';
}

export interface UserDTO extends Pick<User, 'login' | 'firstName' | 'lastName' | 'fullName' | 'idCode' | 'authorities' | 'displayName' | 'csaTitle' | 'csaEmail'> {
}
