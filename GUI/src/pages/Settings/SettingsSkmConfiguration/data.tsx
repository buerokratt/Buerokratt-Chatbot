import { useTranslation } from 'react-i18next';

export function getQueryTypes() {
  const { t } = useTranslation();
  return [
    {
      label: t('settings.skmConfiguration.semantic'),
      value: 'semantic',
    },
    {
      label: t('settings.skmConfiguration.vector'),
      value: 'vector',
    },
    {
      label: t('settings.skmConfiguration.simple'),
      value: 'simple',
    },
    {
      label: t('settings.skmConfiguration.vectorSimpleHybrid'),
      value: 'vector_simple_hybrid',
    },
    {
      label: t('settings.skmConfiguration.vectorSemanticHybrid'),
      value: 'vector_semantic_hybrid',
    },
  ];
}
