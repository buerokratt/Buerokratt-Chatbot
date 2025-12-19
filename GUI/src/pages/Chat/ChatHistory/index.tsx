import { ChatHistory } from '@buerokratt-ria/common-gui-components';
import withAuthorization from 'hoc/with-authorization';
import React, { FC } from 'react';
import useStore from 'store';
import { ROLES } from 'utils/constants';

import { useToast } from '../../../hooks/useToast';

const History: FC = () => {
  return (
    <ChatHistory
      toastContext={useToast()}
      showEmail={import.meta.env.REACT_APP_SHOW_HISTORY_EMAIL === 'true'}
      showDownload={true}
      showSortingLabel={import.meta.env.REACT_APP_SHOW_HISTORY_SORTING === 'true'}
      user={useStore.getState().userInfo}
      userDomains={useStore}
    />
  );
};

export default withAuthorization(History, [ROLES.ROLE_ADMINISTRATOR, ROLES.ROLE_CUSTOMER_SUPPORT_AGENT]);
