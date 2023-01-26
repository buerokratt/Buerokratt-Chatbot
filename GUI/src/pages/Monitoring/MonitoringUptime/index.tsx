import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

import { Card, Tooltip, Track } from 'components';
import { format, sub } from 'date-fns';

type ComponentHealth = {
  name: string;
  version: string;
}

const MonitoringUptime: FC = () => {
  const { t } = useTranslation();
  const { data: uptimeData } = useQuery<ComponentHealth[]>({
    queryKey: ['cs-get-components-healthz-status'],
  });

  return (
    <>
      <h1>{t('monitoring.uptime.title')}</h1>

      {uptimeData && uptimeData.map((component) => (
        <Card key={component.name} header={<h2 className='h5'>{component.name}</h2>}>
          <Track direction='vertical' align='left' gap={8}>
            <Track gap={5} justify='between' style={{ width: '100%' }}>
              {Array.from({ length: 90 }, (v, i) => i).map((bar) => (
                <Tooltip key={bar} content={format(sub(new Date(), { days: 90 - bar - 1 }), 'dd.MM.yyyy')}>
                  <div style={{
                    flex: 1,
                    height: 60,
                    backgroundColor: '#308653',
                  }}></div>
                </Tooltip>
              ))}
            </Track>

            <Track justify='between' gap={16}
                   style={{ color: '#4D4F5D', fontSize: 14, lineHeight: '1.5', width: '100%' }}>
              <p>{t('monitoring.uptime.daysAgo', { days: 90 })}</p>
              <p>{t('monitoring.uptime.uptimePercent', { percent: 99 })}</p>
              <p>{t('global.today')}</p>
            </Track>
          </Track>
        </Card>
      ))}
    </>
  );
};

export default MonitoringUptime;
