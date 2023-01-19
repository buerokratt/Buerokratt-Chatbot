import { FC, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button, Dialog, FormInput, FormSelect, Track } from 'components';
import { User, UserDTO } from 'types/user';
import { createUser, editUser } from 'services/users';
import { useToast } from 'hooks/useToast';
import { ROLES } from 'utils/constants';

type UserModalProps = {
  onClose: () => void;
  user?: User;
}

const UserModal: FC<UserModalProps> = ({ onClose, user }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
  } = useForm<UserDTO>({
    defaultValues: {
      login: user?.login,
      idCode: user?.idCode,
      authorities: user?.authorities,
      displayName: user?.displayName,
      email: user?.email,
    },
  });

  const roles = useMemo(() => [
    { label: t('roles.ROLE_ADMINISTRATOR'), value: ROLES.ROLE_ADMINISTRATOR },
    { label: t('roles.ROLE_SERVICE_MANAGER'), value: ROLES.ROLE_SERVICE_MANAGER },
    { label: t('roles.ROLE_CUSTOMER_SUPPORT_AGENT'), value: ROLES.ROLE_CUSTOMER_SUPPORT_AGENT },
    { label: t('roles.ROLE_CHATBOT_TRAINER'), value: ROLES.ROLE_CHATBOT_TRAINER },
    { label: t('roles.ROLE_ANALYST'), value: ROLES.ROLE_ANALYST },
  ], []);

  const userCreateMutation = useMutation({
    mutationFn: (data: UserDTO) => createUser(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries(['cs-get-admins']);
      toast.open({
        type: 'success',
        title: t('global.notification'),
        message: 'New user added',
      });
    },
    onError: (error: AxiosError) => {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: error.message,
      });
    },
  });

  const userEditMutation = useMutation({
    mutationFn: ({ id, userData }: { id: string | number, userData: UserDTO }) => editUser(id, userData),
    onSuccess: async () => {
      await queryClient.invalidateQueries(['cs-get-admins']);
      toast.open({
        type: 'success',
        title: t('global.notification'),
        message: 'User updated',
      });
    },
    onError: (error: AxiosError) => {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: error.message,
      });
    },
  });

  const handleUserSubmit = handleSubmit((data) => {
    if (user) {
      userEditMutation.mutate({ id: user.idCode, userData: data });
    } else {
      userCreateMutation.mutate(data);
    }
  });

  return (
    <Dialog
      title={user ? t('settings.users.editUser') : t('settings.users.addUser')}
      onClose={onClose}
      footer={
        <>
          <Button appearance='secondary' onClick={onClose}>{t('global.cancel')}</Button>
          <Button onClick={handleUserSubmit}>
            {user ? t('settings.users.editUser') : t('settings.users.addUser')}
          </Button>
        </>
      }
    >
      <Track direction='vertical' gap={16}>
        <FormInput {...register('login')} label={t('settings.users.fullName')} />
        <FormInput {...register('idCode')} label={t('settings.users.idCode')} />
        <FormSelect
          {...register('authorities')}
          label={t('settings.users.userRoles')}
          options={roles}
        />
        <FormInput {...register('displayName')} label={t('settings.users.displayName')} />
        <FormInput {...register('email')} label={t('settings.users.email')} type='email' />
      </Track>
    </Dialog>
  );

};

export default UserModal;
