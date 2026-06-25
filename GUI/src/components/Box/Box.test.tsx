import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Box from './index';

describe('Box', () => {
  it('renders children correctly', () => {
    render(<Box>Test content</Box>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies default color class when no color prop is provided', () => {
    const { container } = render(<Box>Content</Box>);
    const boxElement = container.querySelector('.box--default');
    expect(boxElement).toBeInTheDocument();
  });

  it('applies correct color class when color prop is provided', () => {
    const { container } = render(<Box color="blue">Content</Box>);
    const boxElement = container.querySelector('.box--blue');
    expect(boxElement).toBeInTheDocument();
  });

  it('applies multiple classes correctly', () => {
    const { container } = render(<Box color="red">Content</Box>);
    const boxElement = container.firstChild as HTMLElement;
    expect(boxElement).toHaveClass('box', 'box--red');
  });
});
