import { FC, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button, Dialog, FormInput, FormSelect, Track } from 'components';
import { User, UserDTO } from 'types/user';
import { checkIfUserExists, createUser, editUser } from 'services/users';
import { useToast } from 'hooks/useToast';
import { ROLES } from 'utils/constants';
import Select from 'react-select';
import './SettingsUsers.scss';

type UserModalProps = {
  onClose: () => void;
  user?: User;
};

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
      fullName: user?.fullName,
    },
  });

  const roles = useMemo(
    () => [
      { label: t('roles.ROLE_ADMINISTRATOR'), value: ROLES.ROLE_ADMINISTRATOR },
      {
        label: t('roles.ROLE_SERVICE_MANAGER'),
        value: ROLES.ROLE_SERVICE_MANAGER,
      },
      {
        label: t('roles.ROLE_CUSTOMER_SUPPORT_AGENT'),
        value: ROLES.ROLE_CUSTOMER_SUPPORT_AGENT,
      },
      {
        label: t('roles.ROLE_CHATBOT_TRAINER'),
        value: ROLES.ROLE_CHATBOT_TRAINER,
      },
      { label: t('roles.ROLE_ANALYST'), value: ROLES.ROLE_ANALYST },
    ],
    []
  );

  const userCreateMutation = useMutation({
    mutationFn: (data: UserDTO) => createUser(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries([
        'cs-get-customer-support-agents',
        'prod',
      ]);
      toast.open({
        type: 'success',
        title: t('global.notification'),
        message: t('toast.success.newUserAdded'),
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
    mutationFn: ({
      id,
      userData,
    }: {
      id: string | number;
      userData: UserDTO;
    }) => editUser(id, userData),
    onSuccess: async () => {
      await queryClient.invalidateQueries([
        'cs-get-customer-support-agents',
        'prod',
      ]);
      toast.open({
        type: 'success',
        title: t('global.notification'),
        message: t('toast.success.userUpdated'),
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

  const checkIfUserExistsMutation = useMutation({
    mutationFn: ({ userData }: { userData: UserDTO }) =>
      checkIfUserExists(userData),
    onSuccess: async (data) => {
      if (data.data.check_user_exists !== undefined) {
        toast.open({
          type: 'error',
          title: t('global.notificationError'),
          message: t('settings.users.userExists'),
        });
      } else {
        createNewUser();
      }
    },
    onError: (error: AxiosError) => {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: error.message,
      });
    },
  });

  const createNewUser = handleSubmit((userData) => {
    userCreateMutation.mutate(userData);
  });

  const handleUserSubmit = handleSubmit((data) => {
    if (user) {
      userEditMutation.mutate({ id: user.idCode, userData: data });
    } else {
      checkIfUserExistsMutation.mutate({ userData: data });
    }
  });

  const requiredText = t('settings.users.required') ?? '*';

  return (
    <Dialog
      title={user ? t('settings.users.editUser') : t('settings.users.addUser')}
      onClose={onClose}
      footer={
        <>
          <Button appearance="secondary" onClick={onClose}>
            {t('global.cancel')}
          </Button>
          <Button onClick={handleUserSubmit}>
            {user ? t('settings.users.editUser') : t('settings.users.addUser')}
          </Button>
        </>
      }
    >
      <Track direction="vertical" gap={16} align="right">
        <FormInput
          defaultValue={`${user?.firstName ?? ''} ${
            user?.lastName ?? ''
          }`.trim()}
          {...register('fullName', { required: requiredText })}
          label={t('settings.users.fullName')}
        />
        {errors.fullName && (
          <span style={{ color: '#f00', marginTop: '-1rem' }}>
            {errors.fullName.message}
          </span>
        )}

        {!user && (
          <FormInput
            {...register('idCode', {
              required: requiredText,
              pattern: {
                value: /\bEE\d+\b/,
                message: t('settings.users.invalidIdCode'),
              },
            })}
            label={t('settings.users.idCode')}
          >
            <div>
              <label style={{ fontSize: '14.7px', color: '#9799a4' }}>
                {t('settings.users.idCodePlaceholder')}
              </label>
            </div>
          </FormInput>
        )}

        {!user && errors.idCode && (
          <span style={{ color: '#f00', marginTop: '-1rem' }}>
            {errors.idCode.message}
          </span>
        )}

        <Controller
          control={control}
          name="authorities"
          rules={{ required: requiredText }}
          render={({ field: { onChange, onBlur, name, ref } }) => (
            <div className="multiSelect">
              <label className="multiSelect__label">
                {t('settings.users.userRoles')}
              </label>
              <div className="multiSelect__wrapper">
                <Select
                  name={name}
                  maxMenuHeight={165}
                  ref={ref}
                  onBlur={onBlur}
                  required={true}
                  options={roles}
                  defaultValue={user?.authorities.map((v) => {
                    return { label: t(`roles.${v}` ?? ''), value: v };
                  })}
                  isMulti={true}
                  placeholder={t('global.choose')}
                  onChange={onChange}
                />
              </div>
            </div>
          )}
        />

        {errors.authorities && (
          <span style={{ color: '#f00', marginTop: '-1rem' }}>
            {errors.authorities.message}
          </span>
        )}
        <FormInput
          {...register('displayName', {
            required: requiredText,
          })}
          label={t('settings.users.displayName')}
        />
        {errors.displayName && (
          <span style={{ color: '#f00', marginTop: '-1rem' }}>
            {errors.displayName.message}
          </span>
        )}

        <FormInput
          {...register('csaTitle')}
          label={t('settings.users.userTitle')}
        />

        <FormInput
          {...register('csaEmail', {
            required: requiredText,
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: t('settings.users.invalidemail'),
            },
          })}
          label={t('settings.users.email')}
          type="email"
        />
        {errors.csaEmail && (
          <span style={{ color: '#f00', marginTop: '-1rem' }}>
            {errors.csaEmail.message}
          </span>
        )}
      </Track>
    </Dialog>
  );
};

export default UserModal;
