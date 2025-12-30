import { render, screen, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { Chat, CHAT_STATUS } from 'types/chat';
import { Establishment } from 'types/establishment';
import { describe, expect, it, vi } from 'vitest';

import { createEstablishmentColumns } from './establishment-columns';

describe('createEstablishmentColumns', () => {
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

  const mockOnForward = vi.fn();
  const mockT = (key: string) => key;

  it('should create columns with correct headers', () => {
    const columns = createEstablishmentColumns(mockChat, mockOnForward, mockT);

    expect(columns).toHaveLength(2);
    expect(columns[0].header).toBe('chat.active.establishment');
    expect(columns[1].id).toBe('forward');
  });

  it('should render establishment name in first column', () => {
    const columns = createEstablishmentColumns(mockChat, mockOnForward, mockT);
    const nameColumn = columns[0];

    const mockEstablishment: Establishment = {
      clientId: 'client-1',
      name: 'Test Establishment',
      authenticationCertificate: 'cert-123',
      createdAt: '2024-01-01',
      updatedAt: null,
    };

    if (typeof nameColumn.cell === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const cellValue = nameColumn.cell({
        getValue: () => mockEstablishment.name,
        row: { original: mockEstablishment },
      } as any);

      expect(cellValue).toBe('Test Establishment');
    }
  });

  it('should render forward button in second column', () => {
    const columns = createEstablishmentColumns(mockChat, mockOnForward, mockT);
    const forwardColumn = columns[1];

    const mockEstablishment: Establishment = {
      clientId: 'client-1',
      name: 'Test Establishment',
      authenticationCertificate: 'cert-123',
      createdAt: '2024-01-01',
      updatedAt: null,
    };

    const CellComponent = forwardColumn.cell as any;
    const cellElement = CellComponent({
      row: { original: mockEstablishment },
    });

    render(cellElement as ReactNode);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('global.forward')).toBeInTheDocument();
  });

  it('should call onForward with correct parameters when button is clicked', async () => {
    const columns = createEstablishmentColumns(mockChat, mockOnForward, mockT);
    const forwardColumn = columns[1];

    const mockEstablishment: Establishment = {
      clientId: 'client-1',
      name: 'Test Establishment',
      authenticationCertificate: 'cert-123',
      createdAt: '2024-01-01',
      updatedAt: null,
    };

    const CellComponent = forwardColumn.cell as any;
    const cellElement = CellComponent({
      row: { original: mockEstablishment },
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    render(cellElement);

    const button = screen.getByRole('button');
    button.click();

    await waitFor(() => {
      expect(mockOnForward).toHaveBeenCalledWith(mockChat, 'Test Establishment');
      expect(mockOnForward).toHaveBeenCalledTimes(1);
    });
  });

  it('should set correct meta size for forward column', () => {
    const columns = createEstablishmentColumns(mockChat, mockOnForward, mockT);
    const forwardColumn = columns[1];

    expect(forwardColumn.meta).toEqual({ size: '1%' });
  });
});
