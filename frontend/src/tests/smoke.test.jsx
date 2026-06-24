// import { h } from 'preact';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/preact';

function SmokeComponent() {
  return (
    <main>
      <h1>Presensi Rajasa</h1>
      <p>Frontend test environment is ready.</p>
    </main>
  );
}

describe('frontend smoke test', () => {
  it('renders a basic Preact component', () => {
    render(<SmokeComponent />);

    expect(screen.getByRole('heading', { name: 'Presensi Rajasa' })).toBeTruthy();
    expect(screen.getByText('Frontend test environment is ready.')).toBeTruthy();
  });
});