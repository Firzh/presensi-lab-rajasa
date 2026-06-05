// import { h } from 'preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/preact';

import { Field } from '../components/dev-scan/Field.jsx';
import { JamSelector } from '../components/dev-scan/JamSelector.jsx';
import { SingleSelect } from '../components/dev-scan/SingleSelect.jsx';
import { StatusBox } from '../components/dev-scan/StatusBox.jsx';

afterEach(() => {
  cleanup();
});

describe('dev-scan components', () => {
  it('renders StatusBox message when message exists', () => {
    render(<StatusBox message="Berhasil login" type="success" />);

    const message = screen.getByText('Berhasil login');

    expect(message).toBeTruthy();
    expect(message.className).toContain('status-box--success');
  });

  it('does not render StatusBox when message is empty', () => {
    const { container } = render(<StatusBox message="" type="info" />);

    expect(container.textContent).toBe('');
  });

  it('renders Field label and children', () => {
    render(
      <Field label="Username">
        <input aria-label="input username" />
      </Field>
    );

    expect(screen.getByText('Username')).toBeTruthy();
    expect(screen.getByLabelText('input username')).toBeTruthy();
  });

  it('renders JamSelector options and calls onToggleJam', () => {
    const onToggleJam = vi.fn();

    render(<JamSelector selectedJamIds={[1]} onToggleJam={onToggleJam} />);

    expect(screen.getByText('Jam 1')).toBeTruthy();
    expect(screen.getByText('Jam 2')).toBeTruthy();
    expect(screen.getByText('Jam 3')).toBeTruthy();

    fireEvent.click(screen.getByText('Jam 2'));

    expect(onToggleJam).toHaveBeenCalledWith(2);
  });

  it('renders SingleSelect placeholder, opens options, and calls onChange', () => {
    const onChange = vi.fn();

    render(
      <SingleSelect
        value=""
        placeholder="Pilih rombel"
        options={[
          { value: '5', label: '10 TKJ 1' },
          { value: '6', label: '10 TKJ 2' },
        ]}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByText('Pilih rombel'));
    fireEvent.click(screen.getByText('10 TKJ 1'));

    expect(onChange).toHaveBeenCalledWith('5');
  });

  it('disables SingleSelect when disabled is true', () => {
    render(
      <SingleSelect
        value=""
        placeholder="Belum ada data rombel"
        disabled
        options={[{ value: '5', label: '10 TKJ 1' }]}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByRole('button').disabled).toBe(true);
  });
});