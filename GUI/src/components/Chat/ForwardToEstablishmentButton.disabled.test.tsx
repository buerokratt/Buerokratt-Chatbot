/**
 * This test file is separate from ForwardToEstablishmentButton.test.tsx because
 * vi.mock() is evaluated at module import time and cannot be changed between tests.
 * To test with isHiddenFeaturesEnabled = false, we need a separate file with its own
 * mock configuration to ensure proper test isolation.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { FC, ReactNode } from 'react';
import { apiDev } from 'services/api';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ForwardToEstablishmentButton } from './ForwardToEstablishmentButton';

vi.mock('services/api');
vi.mock('constants/config', () => ({
  isHiddenFeaturesEnabled: false,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const Wrapper: FC<{ children: ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return Wrapper;
};

describe('ForwardToEstablishmentButton with hidden features disabled', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render button when hidden features are disabled', () => {
    const onClick = vi.fn();
    const { container } = render(<ForwardToEstablishmentButton disabled={false} onClick={onClick} />, {
      wrapper: createWrapper(),
    });

    expect(container.firstChild).toBeNull();
  });

  it('does not make API call when hidden features are disabled', () => {
    const onClick = vi.fn();
    render(<ForwardToEstablishmentButton disabled={false} onClick={onClick} />, {
      wrapper: createWrapper(),
    });

    expect(apiDev.get).not.toHaveBeenCalled();
  });
});
