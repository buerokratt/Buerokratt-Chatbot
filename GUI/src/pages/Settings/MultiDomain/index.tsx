import { FC, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { AxiosError } from 'axios';

import { Button, Card, FormInput, Icon, Track } from 'components';
import { useToast } from 'hooks/useToast';
import { apiDev } from 'services/api';
import withAuthorization from 'hoc/with-authorization';
import { ROLES } from 'utils/constants';
import { MdDeleteOutline } from 'react-icons/md';
import './MultiDomain.scss';
import { WDomain } from '../../../types/widgetModels';

const MultiDomain: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const hasRendered = useRef<boolean>();
  const { control, handleSubmit, reset } = useForm<{
    widgetDomains: WDomain[];
  }>({
    defaultValues: {
      widgetDomains: [],
    },
  });
  const [initialDomains, setInitialDomains] = useState<WDomain[]>([]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'widgetDomains',
  });

  const widgetDomainsMutation = useMutation({
    mutationFn: (data: WDomain[]) =>
      apiDev.post('configs/widget-domains', {
        widgetDomains: JSON.stringify(data),
      }),
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
        setInitialDomains(initialData);
        reset({ widgetDomains: initialData });
        hasRendered.current = true;
      }
    },
  });

  const handleFormSubmit = handleSubmit((data) => {
    widgetDomainsMutation.mutate(convertDomains(data.widgetDomains));
  });

  const convertDomains = (newWidgets: WDomain[]) => {
    const isSame = (a: WDomain, b: WDomain) =>
      a.name === b.name && a.url === b.url;

    const result: WDomain[] = [];

    for (const a of initialDomains) {
      const matchInB = newWidgets.find((b) => isSame(a, b));
      if (!matchInB) {
        result.push({ ...a, active: false });
      }
    }

    for (const b of newWidgets) {
      const matchInA = initialDomains.find((a) => isSame(a, b));
      if (!matchInA) {
        result.push({ ...b, active: true });
      }
    }

    return result;
  };

  if (hasRendered.current === undefined) return <>Loading...</>;

  return (
    <div>
      <h1 style={{ paddingBottom: 16 }}>{t('multiDomains.title')}</h1>

      <Card
        footer={
          <Track gap={8} justify="end" align={'right'}>
            <Button
              appearance="secondary"
              onClick={() => append({ name: '', url: '' , domainId: crypto.randomUUID()})}>
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
            gap={10}
            key={index}
            direction="horizontal"
            justify="start"
            style={{ marginBottom: '15px' }}
          >
            <Controller
              name={`widgetDomains.${index}.name`}
              control={control}
              render={({ field }) => (
                <FormInput
                  label={`${index + 1}. ${t('multiDomains.domainName')}`}
                  className="inline-form"
                  style={{ width: '500px' }}
                  {...field}
                />
              )}
            />
            <Controller
              name={`widgetDomains.${index}.url`}
              control={control}
              render={({ field }) => (
                <FormInput
                  label="URL"
                  className="inline-form"
                  style={{ width: '500px' }}
                  {...field}
                />
              )}
            />
            <Track gap={8} justify="between">
              <Button
                appearance="error"
                disabled={fields.length === 1}
                onClick={() => remove(index)}
              >
                <Icon icon={<MdDeleteOutline color="white" />} />
              </Button>
            </Track>
          </Track>
        ))}
      </Card>
    </div>
  );
};

export default withAuthorization(MultiDomain, [ROLES.ROLE_ADMINISTRATOR]);
