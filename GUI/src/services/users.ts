import apiDev from './api-dev';
import { User, UserDTO } from 'types/user';

export async function createUser(userData: UserDTO) {
  const { data } = await apiDev.post<User>('cs-add-user', {
    "firstName": userData.fullName?.split(' ').slice(0, 1).join(' ') ?? '',
    "lastName": userData.fullName?.split(' ').slice(1, 2).join(' ') ?? '',
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
    "firstName": userData.fullName?.split(' ').slice(0, 1).join(' ') ?? '',
    "lastName": userData.fullName?.split(' ').slice(1, 2).join(' ') ?? '',
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
