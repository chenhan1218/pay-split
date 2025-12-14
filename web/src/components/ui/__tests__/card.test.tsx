import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../card';

describe('Card Component', () => {
  it('renders all card components correctly', () => {
    render(
      <Card data-testid="card">
        <CardHeader data-testid="card-header">
          <CardTitle data-testid="card-title">Card Title</CardTitle>
          <CardDescription data-testid="card-description">Card Description</CardDescription>
          <CardAction data-testid="card-action">Action</CardAction>
        </CardHeader>
        <CardContent data-testid="card-content">Card Content</CardContent>
        <CardFooter data-testid="card-footer">Card Footer</CardFooter>
      </Card>
    );

    expect(screen.getByTestId('card')).toBeDefined();
    expect(screen.getByTestId('card-header')).toBeDefined();
    expect(screen.getByTestId('card-title').textContent).toBe('Card Title');
    expect(screen.getByTestId('card-description').textContent).toBe('Card Description');
    expect(screen.getByTestId('card-action').textContent).toBe('Action');
    expect(screen.getByTestId('card-content').textContent).toBe('Card Content');
    expect(screen.getByTestId('card-footer').textContent).toBe('Card Footer');
  });

  it('applies custom classes', () => {
    render(<Card className="custom-class" data-testid="card-custom" />);
    const card = screen.getByTestId('card-custom');
    expect(card.className).toContain('custom-class');
  });
});
