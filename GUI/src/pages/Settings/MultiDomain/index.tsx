import { FC, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { AxiosError } from 'axios';

import { Button, Card, FormInput, Icon, Track } from 'components';
import { WidgetConfig } from 'types/widgetConfig';
import { useToast } from 'hooks/useToast';
import { apiDev } from 'services/api';
import withAuthorization from 'hoc/with-authorization';
import { ROLES } from 'utils/constants';
import { MdDeleteOutline } from 'react-icons/md';

type WDomain = {
  name: string;
  url: string;
};

const MultiDomain: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const hasRendered = useRef<boolean>();
  const { control, register, handleSubmit, reset } = useForm<{
    widgetDomains: WDomain[];
  }>({
    defaultValues: {
      widgetDomains: [
        { name: '', url: '' },
        { name: '', url: '' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'widgetDomains',
  });

  const widgetDomainsMutation = useMutation({
    mutationFn: (data: WDomain[]) =>
      apiDev.post<WidgetConfig>('configs/widget-domains', data),
    onSuccess: () => {
      toast.open({
        type: 'success',
        title: t('global.notification'),
        message: t('toast.success.updateSuccess'),
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

  useQuery({
    queryKey: ['configs/widget-domains', 'prod'],
    onSuccess: (data: any) => {
      const initialData = data.response ?? [];
      if (!hasRendered.current) {
        reset({ widgetDomains: initialData });
        hasRendered.current = true;
      }
    },
  });

  const handleFormSubmit = handleSubmit((data) => {


    widgetDomainsMutation.mutate(data);
  });

  if (hasRendered.current === undefined) return <>Loading...</>;

  return (
    <div>
      <h1 style={{ paddingBottom: 16 }}>{t('multiDomains.title')}</h1>

      <Card
        footer={
          <Track gap={8} justify="center">
            <Button
              appearance="secondary"
              onClick={() => append({ name: '', url: '' })}
            >
              {t('multiDomains.addNew')}
            </Button>
            <Button onClick={handleSubmit(handleFormSubmit)}>
              {t('global.save')}
            </Button>
          </Track>
        }
      >
        {fields.map((_, index) => (
          <Track
            gap={20}
            key={index}
            direction="horizontal"
            align={'left'}
            justify="center"
            style={{ marginBottom: '15px' }}
          >
            <Controller
              name={`widgetDomains.${index}.name`}
              control={control}
              render={({ field }) => (
                <FormInput
                  label={`${index + 1}. ${t('multiDomains.domainName')}`}
                  {...field}
                />
              )}
            />
            <Controller
              name={`widgetDomains.${index}.url`}
              control={control}
              render={({ field }) => <FormInput label="URL" {...field} />}
            />
            <Track gap={8} justify="between">
              <Button
                appearance="error"
                disabled={fields.length === 1}
                onClick={() => remove(index)}
              >
                <Icon icon={<MdDeleteOutline color={'rgba(0,0,0,0.54)'} />} />
              </Button>
            </Track>
          </Track>
        ))}
      </Card>
    </div>
  );
};

export default withAuthorization(MultiDomain, [ROLES.ROLE_ADMINISTRATOR]);
