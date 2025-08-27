import { apiDev } from './api';
import { User, UserDTO } from 'types/user';
import { DomainSelection } from '../types/domainsModels';

export async function createUser(userData: UserDTO) {
  const authorities = userData.authorities
    .map((e) => (e as any).value)
    .filter((item) => item);
  const fullName = userData.fullName?.trim();
  const { data } = await apiDev.post<User>('accounts/admin/add', {
    firstName: fullName?.split(' ').slice(0, 1).join(' ') ?? '',
    lastName: fullName?.split(' ').slice(1, 2).join(' ') ?? '',
    userIdCode: userData.idCode,
    displayName: userData.displayName,
    csaTitle: userData.csaTitle,
    csa_email: userData.csaEmail,
    roles:
      authorities.length === 0
        ? Object.values(userData.authorities)
        : authorities,
    department: userData.department,
    domains:
      userData.domains.length === 0 || userData.domains[0] === null
        ? []
        : userData.domains.map(d => d.value)
  });
  return data;
}

export async function checkIfUserExists(userData: UserDTO) {
  const { data } = await apiDev.post('accounts/admin/exists', {
    userIdCode: userData.idCode,
  });
  return data;
}

export async function editUser(
  id: string | number,
  userData: UserDTO,
  smaxConnectDisconnect: boolean
) {
  const authorities = userData.authorities
    .map((e: any) => e.value)
    .filter((item) => item);
  const fullName = userData.fullName?.trim();

  const apiUrl = smaxConnectDisconnect
    ? 'accounts/admin/smax-connection'
    : 'accounts/admin/edit';

  const { data } = await apiDev.post<User>(apiUrl, {
    firstName: fullName?.split(' ').slice(0, 1).join(' ') ?? '',
    lastName: fullName?.split(' ').slice(1, 2).join(' ') ?? '',
    userIdCode: id,
    displayName: userData.displayName,
    csaTitle: userData.csaTitle,
    csa_email: userData.csaEmail,
    smaxAccountId: userData.smaxAccountId,
    ...(smaxConnectDisconnect && { smaxConnectDisconnect }),
    roles:
      authorities.length === 0
        ? Object.values(userData.authorities)
        : authorities,
    department: userData.department,
    domains:
      userData.domains.length === 0 || userData.domains[0] === null
        ? []
        : userData.domains.map(d => d.value)
  });
  return data;
}

export async function deleteUser(id: string | number) {
  const { data } = await apiDev.post<User>('accounts/admin/delete', {
    userIdCode: id,
  });
  return data;
}

export async function getWidgetData(userId: string) {
  const { data } = await apiDev.get<DomainSelection[]>('accounts/widget-data', {
    params: {
      user_id: userId,
    },
  });
  return data;
}