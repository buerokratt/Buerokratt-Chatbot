import apiDev from './api-dev';
import { User, UserDTO } from 'types/user';

export async function createUser(userData: UserDTO) {
  const authorities = userData.authorities.map((e) => (e as any).value).filter(item => item);
  const fullName = userData.fullName?.trim();
  const { data } = await apiDev.post<User>('account/add-user', {
    "firstName": fullName?.split(' ').slice(0, 1).join(' ') ?? '',
    "lastName": fullName?.split(' ').slice(1, 2).join(' ') ?? '',
    "userIdCode": userData.idCode,
    "displayName": userData.displayName,
    "csaTitle": userData.csaTitle,
    "csa_email": userData.csaEmail,
    "roles": authorities.length === 0 ? Object.values(userData.authorities) : authorities
  });
  return data;
}

export async function checkIfUserExists(userData: UserDTO) {
  const { data } = await apiDev.post('account/check-user-exists', {
    "userIdCode": userData.idCode
  });
  return data;
}

export async function editUser(id: string | number, userData: UserDTO) {
  const authorities = userData.authorities.map((e) => (e as any).value).filter(item => item);
  const fullName = userData.fullName?.trim();
  const { data } = await apiDev.post<User>('account/edit-user', {
    "firstName": fullName?.split(' ').slice(0, 1).join(' ') ?? '',
    "lastName": fullName?.split(' ').slice(1, 2).join(' ') ?? '',
    "userIdCode": id,
    "displayName": userData.displayName,
    "csaTitle": userData.csaTitle,
    "csa_email": userData.csaEmail,
    "roles": authorities.length === 0 ? Object.values(userData.authorities) : authorities
  });
  return data;
}

export async function deleteUser(id: string | number) {
  const { data } = await apiDev.post<User>('account/delete-user', {
    "userIdCode": id,
  });
  return data;
}
