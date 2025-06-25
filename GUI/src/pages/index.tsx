import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import withAuthorization from 'hoc/with-authorization';

import { ROLES } from 'utils/constants';

import { Track } from 'components';

const LandingPage: FC = () => {
  const { t } = useTranslation();

  return (
    <Track>
      <h1>{t('landing.title')}</h1>
    </Track>
  );
};

export default withAuthorization(LandingPage, [
  ROLES.ROLE_ADMINISTRATOR,
  ROLES.ROLE_SERVICE_MANAGER,
  ROLES.ROLE_CUSTOMER_SUPPORT_AGENT,
  ROLES.ROLE_CHATBOT_TRAINER,
  ROLES.ROLE_ANALYST,
]);
