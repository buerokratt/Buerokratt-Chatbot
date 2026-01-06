import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { FC, ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { apiDev } from 'services/api';
import { Chat, CHAT_STATUS } from 'types/chat';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ForwardToEstablishmentModal from './index';

vi.mock('services/api');

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
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
  return Wrapper;
};

describe('ForwardToEstablishmentModal', () => {
  const mockChat: Chat = {
    id: '123',
    customerSupportDisplayName: 'Test Chat',
    customerSupportId: 'support-1',
    created: '2024-01-01',
    updated: '2024-01-01',
    ended: '',
    lastMessage: '',
    status: CHAT_STATUS.OPEN,
    endUserId: 'user-1',
    endUserFirstName: 'John',
    endUserLastName: 'Doe',
    labels: '',
    forwardedByUser: undefined,
    forwardedFromCsa: undefined,
    forwardedToCsa: undefined,
    forwardedToName: undefined,
  };

  const mockOnModalClose = vi.fn();
  const mockOnForward = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal with title', () => {
    const mockData = {
      response: {
        items: [],
        totalPages: 0,
      },
    };

    vi.mocked(apiDev.get).mockResolvedValue({ data: mockData });

    render(<ForwardToEstablishmentModal chat={mockChat} onModalClose={mockOnModalClose} onForward={mockOnForward} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('chat.active.forwardChat')).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    vi.mocked(apiDev.get).mockImplementation(() => new Promise(() => {}));

    render(<ForwardToEstablishmentModal chat={mockChat} onModalClose={mockOnModalClose} onForward={mockOnForward} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('global.loading')).toBeInTheDocument();
  });

  it('should display establishments when data loads successfully', async () => {
    const mockData = {
      response: {
        items: [{ name: 'Establishment 1' }, { name: 'Establishment 2' }],
        totalPages: 1,
      },
    };

    vi.mocked(apiDev.get).mockResolvedValue({ data: mockData });

    render(<ForwardToEstablishmentModal chat={mockChat} onModalClose={mockOnModalClose} onForward={mockOnForward} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText('Establishment 1')).toBeInTheDocument();
      expect(screen.getByText('Establishment 2')).toBeInTheDocument();
    });
  });

  it('should display error message when API fails', async () => {
    vi.mocked(apiDev.get).mockRejectedValue(new Error('API Error'));

    render(<ForwardToEstablishmentModal chat={mockChat} onModalClose={mockOnModalClose} onForward={mockOnForward} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText('chat.active.establishmentListError')).toBeInTheDocument();
    });
  });

  it('should update filter when typing in search input', async () => {
    const mockData = {
      response: {
        items: [{ name: 'Establishment 1' }],
        totalPages: 1,
      },
    };

    vi.mocked(apiDev.get).mockResolvedValue({ data: mockData });

    render(<ForwardToEstablishmentModal chat={mockChat} onModalClose={mockOnModalClose} onForward={mockOnForward} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('chat.active.searchByEstablishmentName...')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('chat.active.searchByEstablishmentName...') as HTMLInputElement;
    searchInput.value = 'test';
    searchInput.dispatchEvent(new Event('change', { bubbles: true }));

    expect(searchInput.value).toBe('test');
  });

  it('should call onForward when forward button is clicked', async () => {
    const mockData = {
      response: {
        items: [{ name: 'Establishment 1' }],
        totalPages: 1,
      },
    };

    vi.mocked(apiDev.get).mockResolvedValue({ data: mockData });

    render(<ForwardToEstablishmentModal chat={mockChat} onModalClose={mockOnModalClose} onForward={mockOnForward} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText('Establishment 1')).toBeInTheDocument();
    });

    const forwardButtons = screen.getAllByText('global.forward');
    forwardButtons[0].click();

    await waitFor(() => {
      expect(mockOnForward).toHaveBeenCalledWith(mockChat, 'Establishment 1');
    });
  });

  it('should not render DataTable when establishments list is empty', async () => {
    const mockData = {
      response: {
        items: [],
        totalPages: 0,
      },
    };

    vi.mocked(apiDev.get).mockResolvedValue({ data: mockData });

    render(<ForwardToEstablishmentModal chat={mockChat} onModalClose={mockOnModalClose} onForward={mockOnForward} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
  });
});
