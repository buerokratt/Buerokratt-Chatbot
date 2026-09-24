import { useTranslation } from 'react-i18next';

import { useToast } from './useToast';

export const useCopyToClipboard = () => {
  const { t } = useTranslation();
  const toast = useToast();

  return async (value: string) => {
    if (window.getSelection()?.toString()) return;

    try {
      await navigator.clipboard.writeText(value);
      toast.open({
        type: 'success',
        title: t('global.notification'),
        message: t('toast.success.copied'),
      });
    } catch (error) {
      toast.open({
        type: 'error',
        title: t('global.notificationError'),
        message: (error as Error)?.message,
      });
    }
  };
};
