import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, FC, ReactNode } from 'react';
import { apiDev } from 'services/api';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useEstablishments } from './use-establishments';

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
  const Wrapper: FC<{ children: ReactNode }> = ({ children }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  return Wrapper;
};

describe('useEstablishments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch establishments successfully', async () => {
    const mockData = {
      response: {
        items: [{ name: 'Establishment 1' }, { name: 'Establishment 2' }],
        totalPages: 2,
      },
    };

    vi.mocked(apiDev.get).mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useEstablishments({ pageIndex: 0, pageSize: 10 }, '', []), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.establishmentsList).toEqual(mockData.response.items);
    expect(result.current.totalPages).toBe(2);
    expect(result.current.errorMessage).toBeNull();
  });

  it('should handle API errors', async () => {
    vi.mocked(apiDev.get).mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useEstablishments({ pageIndex: 0, pageSize: 10 }, '', []), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.errorMessage).toBe('chat.active.establishmentListError');
    expect(result.current.establishmentsList).toEqual([]);
  });

  it('should call API with correct pagination parameters', async () => {
    const mockData = {
      response: {
        items: [],
        totalPages: 0,
      },
    };

    vi.mocked(apiDev.get).mockResolvedValue({ data: mockData });

    renderHook(() => useEstablishments({ pageIndex: 2, pageSize: 20 }, '', []), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(apiDev.get).toHaveBeenCalledWith('/configs/centops-establishments', {
        params: {
          page: 3,
          pageSize: 20,
          sortOrder: 'asc',
          filter: '',
        },
      });
    });
  });

  it('should call API with correct filter and sorting parameters', async () => {
    const mockData = {
      response: {
        items: [],
        totalPages: 0,
      },
    };

    vi.mocked(apiDev.get).mockResolvedValue({ data: mockData });

    renderHook(() => useEstablishments({ pageIndex: 0, pageSize: 10 }, 'test filter', [{ id: 'name', desc: true }]), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(apiDev.get).toHaveBeenCalledWith('/configs/centops-establishments', {
        params: {
          page: 1,
          pageSize: 10,
          sortOrder: 'desc',
          filter: 'test filter',
        },
      });
    });
  });

  it('should update establishments list when data changes', async () => {
    const mockData1 = {
      response: {
        items: [{ name: 'Establishment 1' }],
        totalPages: 1,
      },
    };

    const mockData2 = {
      response: {
        items: [{ name: 'Establishment 2' }, { name: 'Establishment 3' }],
        totalPages: 2,
      },
    };

    vi.mocked(apiDev.get).mockResolvedValueOnce({ data: mockData1 });

    const { result, rerender } = renderHook(
      ({ pageIndex, pageSize }) => useEstablishments({ pageIndex, pageSize }, '', []),
      {
        wrapper: createWrapper(),
        initialProps: { pageIndex: 0, pageSize: 10 },
      },
    );

    await waitFor(() => {
      expect(result.current.establishmentsList).toEqual(mockData1.response.items);
    });

    vi.mocked(apiDev.get).mockResolvedValueOnce({ data: mockData2 });

    rerender({ pageIndex: 1, pageSize: 10 });

    await waitFor(() => {
      expect(result.current.establishmentsList).toEqual(mockData2.response.items);
    });
  });

  it('should clear error message when data loads successfully after error', async () => {
    vi.mocked(apiDev.get).mockRejectedValueOnce(new Error('API Error'));

    const { result, rerender } = renderHook(
      ({ pageIndex, pageSize }) => useEstablishments({ pageIndex, pageSize }, '', []),
      {
        wrapper: createWrapper(),
        initialProps: { pageIndex: 0, pageSize: 10 },
      },
    );

    await waitFor(() => {
      expect(result.current.errorMessage).toBe('chat.active.establishmentListError');
    });

    const mockData = {
      response: {
        items: [{ name: 'Establishment 1' }],
        totalPages: 1,
      },
    };

    vi.mocked(apiDev.get).mockResolvedValueOnce({ data: mockData });

    rerender({ pageIndex: 1, pageSize: 10 });

    await waitFor(() => {
      expect(result.current.errorMessage).toBeNull();
      expect(result.current.establishmentsList).toEqual(mockData.response.items);
    });
  });
});
