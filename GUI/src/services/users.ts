import api from './api';
import apiDev from './api-dev';
import { User, UserDTO } from 'types/user';

export async function createUser(userData: UserDTO) {
  const { data } = await apiDev.post<User>('users', userData);
  return data;
}

export async function editUser(id: string | number, userData: UserDTO) {
  const { data } = await api.patch(`users/${id}`, userData);
  return data;
}

export async function deleteUser(id: string | number) {
  const { data } = await api.delete<void>(`users/${id}`);
  return data;
}
