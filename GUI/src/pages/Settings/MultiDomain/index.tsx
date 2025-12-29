import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Button, Card, FormInput, Icon, Track } from 'components';
import withAuthorization from 'hoc/with-authorization';
import { useToast } from 'hooks/useToast';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { MdDeleteOutline } from 'react-icons/md';
import { apiDev } from 'services/api';
import { ROLES } from 'utils/constants';

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
  const [trackKey, setTrackKey] = useState<number>(0);

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
      setTrackKey(trackKey + 1);
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

  const fetchData = useCallback(async () => {
    try {
      const response = await apiDev.get<{ response: WDomain[] }>('configs/widget-domains');
      const domains = response.data.response ?? [];

      if (!hasRendered.current) {
        setInitialDomains(domains);
        hasRendered.current = true;
        reset({ widgetDomains: domains });
        return;
      }

      setInitialDomains(domains);
      reset({ widgetDomains: domains });
    } catch (error) {
      console.error('Failed to fetch domains', error);
    }
  }, [reset]);

  const handleFormSubmit = handleSubmit((data) => {
    widgetDomainsMutation.mutate(convertDomains(data.widgetDomains));
  });

  useEffect(() => {
    fetchData();
  }, [fetchData, trackKey]);

  const convertDomains = (newWidgets: WDomain[]) => {
    const result: WDomain[] = [];

    const findById = (arr: WDomain[], id: string) => arr.find((x) => x.domainId === id);

    const normalizeUrl = (url: string) => (url.endsWith('/') ? url : url + '/');

    for (const oldItem of initialDomains) {
      const match = findById(newWidgets, oldItem.domainId);
      if (!match) {
        result.push({ ...oldItem, active: false });
      }
    }

    for (const newItem of newWidgets) {
      const oldMatch = findById(initialDomains, newItem.domainId);

      if (!oldMatch) {
        result.push({
          ...newItem,
          url: normalizeUrl(newItem.url),
          active: true,
        });
        continue;
      }

      const changed = oldMatch.name !== newItem.name || oldMatch.url !== newItem.url;

      if (changed) {
        result.push({
          ...newItem,
          url: normalizeUrl(newItem.url),
          active: true,
        });
      }
    }

    return result;
  };

  if (hasRendered.current === undefined) return <>Loading...</>;

  return (
    <div>
      <h1 style={{ paddingBottom: 16 }}>{t('multiDomains.title')}</h1>

      <Card
        isScrollable={true}
        footer={
          <Track gap={8} justify="end" align={'right'}>
            <Button appearance="secondary" onClick={() => append({ name: '', url: '', domainId: crypto.randomUUID() })}>
              {t('multiDomains.addNew')}
            </Button>
            <Button onClick={handleSubmit(handleFormSubmit)}>{t('global.save')}</Button>
          </Track>
        }
      >
        {fields.map((field, index) => (
          <Track gap={10} key={field.id} direction="horizontal" justify="start" style={{ marginBottom: '15px' }}>
            <Controller
              name={`widgetDomains.${index}.name`}
              control={control}
              render={({ field }) => (
                <FormInput
                  label={`${index + 1}. ${t('multiDomains.domainName')}`}
                  className="inline-form"
                  style={{ maxWidth: '500px' }}
                  {...field}
                />
              )}
            />
            <Controller
              name={`widgetDomains.${index}.url`}
              control={control}
              render={({ field }) => (
                <FormInput label="URL" className="inline-form" style={{ maxWidth: '500px' }} {...field} />
              )}
            />
            <Track gap={8} justify="between">
              <Button appearance="error" disabled={fields.length === 1} onClick={() => remove(index)}>
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
