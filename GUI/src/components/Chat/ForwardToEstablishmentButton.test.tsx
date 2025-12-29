import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { FC, ReactNode } from 'react';
import { apiDev } from 'services/api';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { ForwardToEstablishmentButton } from './ForwardToEstablishmentButton';

vi.mock('services/api');
vi.mock('constants/config', () => ({
  isHiddenFeaturesEnabled: true,
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

describe('ForwardToEstablishmentButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders button when CentOps is configured and hidden features are enabled', async () => {
    (apiDev.get as Mock).mockResolvedValue({
      data: { response: { configured: true } },
    });

    const onClick = vi.fn();
    render(<ForwardToEstablishmentButton disabled={false} onClick={onClick} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText('chat.active.forwardToOrganization')).toBeInTheDocument();
    });
  });

  it('does not render button when CentOps is not configured', async () => {
    (apiDev.get as Mock).mockResolvedValue({
      data: { response: { configured: false } },
    });

    const onClick = vi.fn();
    const { container } = render(<ForwardToEstablishmentButton disabled={false} onClick={onClick} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('renders disabled button when disabled prop is true', async () => {
    (apiDev.get as Mock).mockResolvedValue({
      data: { response: { configured: true } },
    });

    const onClick = vi.fn();
    render(<ForwardToEstablishmentButton disabled={true} onClick={onClick} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      const button = screen.getByText('chat.active.forwardToOrganization').closest('button');
      expect(button).toBeDisabled();
    });
  });

  it('calls onClick handler when button is clicked', async () => {
    (apiDev.get as Mock).mockResolvedValue({
      data: { response: { configured: true } },
    });

    const onClick = vi.fn();
    render(<ForwardToEstablishmentButton disabled={false} onClick={onClick} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      const button = screen.getByText('chat.active.forwardToOrganization');
      button.click();
    });

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
