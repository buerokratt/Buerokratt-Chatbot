import { FC, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm, Controller, useWatch, useFormContext } from 'react-hook-form';
import { motion } from 'framer-motion';
import { AxiosError } from 'axios';

import {
  Button,
  Card,
  FormInput,
  FormSelect,
  Icon,
  Switch,
  Track,
} from 'components';
import { WidgetConfig } from 'types/widgetConfig';
import { useToast } from 'hooks/useToast';
import bykLogo from 'assets/logo-white.svg';
import apiDevV2 from 'services/api-dev-v2';
import './SettingsAppearance.scss';
import clsx from 'clsx';
import { ChromePicker } from 'react-color';
import { MdOutlinePalette } from 'react-icons/md';

const variants = {
  initial: {
    y: 100,
  },
  animate: {
    y: 0,
  },
};

const SettingsAppearance: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const hasRendered = useRef<boolean>();
  const { register, control, handleSubmit, reset, setValue } =
    useForm<WidgetConfig>();
  const [showPreview, setShowPreview] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [delayFinished, setDelayFinished] = useState(false);
  const { data: widgetConfig } = useQuery<WidgetConfig>({
    queryKey: ['cs-get-widget-config', 'prod-2'],
    onSuccess: (data) => {
      if (!hasRendered.current) {
        reset({
          ...data,
          widgetAnimation:
            data.widgetAnimation.length === 0
              ? 'shockwave'
              : data.widgetAnimation,
        });
        hasRendered.current = true;
      }
    },
  });

  const widgetProactiveSeconds = useWatch({
    control,
    name: 'widgetProactiveSeconds',
  });
  const widgetBubbleMessageText = useWatch({
    control,
    name: 'widgetBubbleMessageText',
  });
  const widgetDisplayBubbleMessageSeconds = useWatch({
    control,
    name: 'widgetDisplayBubbleMessageSeconds',
  });
  const widgetColor = useWatch({ control, name: 'widgetColor' });
  const widgetAnimation = useWatch({ control, name: 'widgetAnimation' });

  const widgetConfigMutation = useMutation({
    mutationFn: (data: WidgetConfig) =>
      apiDevV2.post<WidgetConfig>('cs-set-widget-config', data),
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

  const colorComponentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      handleClickOutside(event);
    };
    document.addEventListener('click', handleDocumentClick);

    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      colorComponentRef.current &&
      !colorComponentRef.current.contains(event.target as Node)
    ) {
      setShowColorPalette(false);
    }
  };

  const handleFormSubmit = handleSubmit((data) => {
    widgetConfigMutation.mutate(data);
  });

  const handlePreview = () => {
    setShowPreview((prevState) => {
      if (prevState) {
        setDelayFinished(false);
        return false;
      }

      setTimeout(() => {
        setDelayFinished(true);
      }, widgetDisplayBubbleMessageSeconds * 1000);

      return true;
    });
  };

  if (!widgetConfig) return <>Loading...</>;

  return (
    <div ref={colorComponentRef}>
      <h1>{t('settings.appearance.title')}</h1>

      <Card
        footer={
          <Track gap={8} justify="end">
            <Button onClick={handleFormSubmit}>{t('global.save')}</Button>
            <Button appearance="secondary" onClick={handlePreview}>
              {t('global.preview')}
            </Button>
          </Track>
        }
      >
        <Track gap={8} direction="vertical" align="left">
          <FormInput
            {...register('widgetProactiveSeconds')}
            label={t('settings.appearance.widgetProactiveSeconds')}
            type="number"
          />
          <Controller
            name="isWidgetActive"
            control={control}
            render={({ field }) => (
              <Switch
                onCheckedChange={field.onChange}
                label={t('settings.appearance.widgetBubbleMessageText')}
                checked={field.value}
                {...field}
              />
            )}
          />
          <FormInput
            {...register('widgetDisplayBubbleMessageSeconds')}
            label={t('settings.appearance.widgetDisplayBubbleMessageSeconds')}
            type="number"
          />
          <FormInput
            {...register('widgetBubbleMessageText')}
            label={t('settings.appearance.widgetBubbleMessageText')}
          />
          <FormInput
            {...register('widgetColor')}
            readOnly={true}
            label={t('settings.appearance.widgetColor')}
            onClick={() => setShowColorPalette(!showColorPalette)}
          >
            {
              <div>
                <Icon
                  icon={
                    <MdOutlinePalette fontSize={20} color="rgba(0,0,0,0.54)" />
                  }
                  onIconClicked={() => setShowColorPalette(!showColorPalette)}
                />
                {showColorPalette && (
                  <div style={{ position: 'absolute', zIndex: '2' }}>
                    <div
                      onClick={() => setShowColorPalette(!showColorPalette)}
                    />
                    <ChromePicker
                      {...register('widgetColor')}
                      color={widgetColor}
                      onChange={(color) => setValue('widgetColor', color.hex)}
                    />
                  </div>
                )}
              </div>
            }
          </FormInput>
          <Controller
            name="widgetAnimation"
            control={control}
            render={({ field }) => (
              <FormSelect
                {...field}
                onSelectionChange={(selection) =>
                  field.onChange(selection?.value)
                }
                label={t('settings.appearance.widgetAnimation')}
                defaultValue={field.value}
                options={[
                  { label: 'Shockwave', value: 'shockwave' },
                  { label: 'Jump', value: 'jump' },
                  { label: 'Wiggle', value: 'wiggle' },
                ]}
              />
            )}
          />
        </Track>
      </Card>

      {showPreview && (
        <div className="profile__wrapper">
          <motion.div
            className={clsx(
              'profile',
              delayFinished && {
                'profile--shockwave': widgetAnimation === 'shockwave',
                'profile--jump': widgetAnimation === 'jump',
                'profile--wiggle': widgetAnimation === 'wiggle',
              }
            )}
            variants={variants}
            initial="initial"
            animate="animate"
            style={{
              animationIterationCount: widgetProactiveSeconds,
              backgroundColor: widgetColor,
            }}
          >
            <img src={bykLogo} alt="Buerokratt logo" width={45} />
          </motion.div>
          {control._formValues.isWidgetActive && (
            <div
              className={clsx('profile__greeting-message', {
                'profile__greeting-message--active': delayFinished,
              })}
            >
              {widgetBubbleMessageText}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SettingsAppearance;
