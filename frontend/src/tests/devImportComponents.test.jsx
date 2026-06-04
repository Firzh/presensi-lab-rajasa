import { h } from 'preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/preact';

import {
  DevImportHeader,
  ImportDropzone,
  ImportResultPanel,
} from '../components/dev-import/index.js';

afterEach(() => {
  cleanup();
});

describe('dev-import components', () => {
  it('renders DevImportHeader status and calls login handler', () => {
    const onLogin = vi.fn();

    render(<DevImportHeader status="Siap upload import." onLogin={onLogin} />);

    expect(screen.getByText('Demo Advanced Import')).toBeTruthy();
    expect(screen.getByText('Siap upload import.')).toBeTruthy();

    fireEvent.click(screen.getByText('Login Demo'));

    expect(onLogin).toHaveBeenCalledTimes(1);
  });

  it('renders ImportDropzone empty state and disabled upload button', () => {
    render(
      <ImportDropzone
        file={null}
        onDrop={vi.fn()}
        onFileChange={vi.fn()}
        onUpload={vi.fn()}
      />
    );

    expect(screen.getByText('Belum ada file dipilih')).toBeTruthy();
    expect(screen.getByText('Upload Import').disabled).toBe(true);
  });

  it('renders ImportDropzone selected file and calls upload handler', () => {
    const onUpload = vi.fn();
    const file = new File(['nama,nisn'], 'siswa.csv', { type: 'text/csv' });

    render(
      <ImportDropzone
        file={file}
        onDrop={vi.fn()}
        onFileChange={vi.fn()}
        onUpload={onUpload}
      />
    );

    expect(screen.getAllByText('siswa.csv')).toHaveLength(2);
    
    fireEvent.click(screen.getByText('Upload Import'));

    expect(onUpload).toHaveBeenCalledTimes(1);
  });

  it('calls file change handler from file input', () => {
    const onFileChange = vi.fn();
    const file = new File(['nama,nisn'], 'siswa.csv', { type: 'text/csv' });

    render(
      <ImportDropzone
        file={null}
        onDrop={vi.fn()}
        onFileChange={onFileChange}
        onUpload={vi.fn()}
      />
    );

    const input = document.querySelector('input[type="file"]');

    fireEvent.change(input, {
      target: {
        files: [file],
      },
    });

    expect(onFileChange).toHaveBeenCalledTimes(1);
  });

  it('does not render ImportResultPanel when responseJson is empty', () => {
    const { container } = render(<ImportResultPanel responseJson={null} />);

    expect(container.textContent).toBe('');
  });

  it('renders ImportResultPanel JSON response', () => {
    render(
      <ImportResultPanel
        responseJson={{
          success: true,
          message: 'Import selesai.',
          data: {
            inserted: 3,
          },
        }}
      />
    );

    expect(screen.getByText('Response Import')).toBeTruthy();
    expect(screen.getByText(/Import selesai/)).toBeTruthy();
    expect(screen.getByText(/inserted/)).toBeTruthy();
  });
});