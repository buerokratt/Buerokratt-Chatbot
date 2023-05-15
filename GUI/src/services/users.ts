import api from './api';
import apiDev from './api-dev';
import { User, UserDTO } from 'types/user';

export async function createUser(userData: UserDTO) {
  const { data } = await apiDev.post<User>('cs-add-user', {
    "userIdCode": userData.idCode,
    "displayName": userData.displayName,
    "csaTitle": userData.csaTitle,
    "csa_email": userData.csaEmail,
    "roles": [Object.values(userData.authorities)[1]]
  });
  return data;
}

export async function editUser(id: string | number, userData: UserDTO) {
  const { data } = await apiDev.post<User>('cs-edit-user', {
    "userIdCode": id,
    "displayName": userData.displayName,
    "csaTitle": userData.csaTitle,
    "csa_email": userData.csaEmail,
    "roles": [Object.values(userData.authorities)[1]]
  });
  return data;
}

export async function deleteUser(id: string | number) {
  const { data } = await apiDev.post<User>('cs-delete-user', {
    "userIdCode": id,
  });
  return data;
}
