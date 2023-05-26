import { FC, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UserDTO>({
    defaultValues: {
      login: user?.login,
      idCode: user?.idCode,
      authorities: user?.authorities,
      displayName: user?.displayName,
      csaTitle: user?.csaTitle,
      csaEmail: user?.csaEmail,
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
      await queryClient.invalidateQueries(['cs-get-customer-support-agents', 'prod']);
      toast.open({
        type: 'success',
        title: t('global.notification'),
        message: 'New user added',
      });
      onClose();
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
      await queryClient.invalidateQueries(['cs-get-customer-support-agents', 'prod']);
      toast.open({
        type: 'success',
        title: t('global.notification'),
        message: 'User updated',
      });
      onClose();
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

  const requiredText = t('settings.users.required') ?? '*';

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
      <Track direction='vertical' gap={16} align='right'>
        <FormInput
          {...register('login', { required: requiredText, })}
          label={t('settings.users.fullName')}
        />
        {errors.login && <span style={{ color: '#f00', marginTop: '-1.2rem' }}>{errors.login.message}</span>}
        {!user && <FormInput
          {...register('idCode', { required: requiredText, })}
          label={t('settings.users.idCode')}
        />}
        {!user && errors.idCode && <span style={{ color: '#f00', marginTop: '-1.2rem' }}>{errors.idCode.message}</span>}
        <Controller
          name='authorities'
          control={control}
          required
          render={({ field }) =>
            <FormSelect
              label={t('settings.users.userRoles')}
              onSelectionChange={field.onChange}
              options={roles}
              {...field}
            />
          }
        />
        {errors.authorities && <span style={{ color: '#f00', marginTop: '-1.2rem' }}>{errors.authorities.message}</span>}
        <FormInput {...register('displayName')} label={t('settings.users.displayName')} />
        <FormInput {...register('csaTitle')} label={t('settings.users.userTitle')} />

        <FormInput
          {...register('csaEmail', {
            required: requiredText,
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: t('settings.users.invalidemail')
            }
          })}
          label={t('settings.users.email')}
          type='email'
        />
        {errors.csaEmail && <span style={{ color: '#f00', marginTop: '-1.2rem' }}>{errors.csaEmail.message}</span>}
      </Track>
    </Dialog>
  );

};

export default UserModal;
