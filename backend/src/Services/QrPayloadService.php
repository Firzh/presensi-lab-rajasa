<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Services;

final class QrPayloadService
{
    private const GOOGLE_FORM_NAME_ENTRY = 'entry.1743651050';
    private const GOOGLE_FORM_NISN_ENTRY = 'entry.178375719';

    public function parse(string $payloadRaw): array
    {
        $payloadRaw = trim($payloadRaw);

        if ($this->isGoogleFormPayload($payloadRaw)) {
            return $this->parseGoogleFormPayload($payloadRaw);
        }

        $payloadNisn = $this->extractNisn($payloadRaw);
        $payloadNama = $this->extractName($payloadRaw, $payloadNisn);

        return [
            'payload_raw' => $payloadRaw,
            'payload_normalized' => $this->normalizePayload($payloadNama . '|' . $payloadNisn),
            'payload_nisn' => $payloadNisn,
            'payload_nama' => $payloadNama,
        ];
    }

    public function normalizePayload(string $value): string
    {
        return strtolower(preg_replace('/[^a-z0-9]+/i', '', $value) ?? '');
    }

    private function isGoogleFormPayload(string $payloadRaw): bool
    {
        return str_contains($payloadRaw, 'docs.google.com/forms')
            && str_contains($payloadRaw, self::GOOGLE_FORM_NAME_ENTRY)
            && str_contains($payloadRaw, self::GOOGLE_FORM_NISN_ENTRY);
    }

    private function parseGoogleFormPayload(string $payloadRaw): array
    {
        $query = parse_url($payloadRaw, PHP_URL_QUERY);

        if (!is_string($query) || $query === '') {
            return [
                'payload_raw' => $payloadRaw,
                'payload_normalized' => $this->normalizePayload($payloadRaw),
                'payload_nisn' => '',
                'payload_nama' => '',
            ];
        }

        $params = $this->parseQueryPreserveDots($query);

        $nama = strtoupper(trim((string) ($params[self::GOOGLE_FORM_NAME_ENTRY] ?? '')));
        $nisn = preg_replace('/\D+/', '', (string) ($params[self::GOOGLE_FORM_NISN_ENTRY] ?? '')) ?? '';

        return [
            'payload_raw' => $payloadRaw,
            'payload_normalized' => $this->normalizePayload($nama . '|' . $nisn),
            'payload_nisn' => $nisn,
            'payload_nama' => $nama,
        ];
    }

    private function parseQueryPreserveDots(string $query): array
    {
        $params = [];

        foreach (explode('&', $query) as $pair) {
            if ($pair === '') {
                continue;
            }

            [$key, $value] = array_pad(explode('=', $pair, 2), 2, '');

            $params[urldecode($key)] = urldecode($value);
        }

        return $params;
    }

    private function extractNisn(string $payloadRaw): string
    {
        if (preg_match('/\b(\d{10,20})\b/', $payloadRaw, $match)) {
            return $match[1];
        }

        return '';
    }

    private function extractName(string $payloadRaw, string $nisn): string
    {
        $name = $payloadRaw;

        if ($nisn !== '') {
            $name = str_replace($nisn, '', $name);
        }

        $name = preg_replace('/[\|\;\,]+/', ' ', $name) ?? '';
        $name = preg_replace('/\s+/', ' ', $name) ?? '';

        return strtoupper(trim($name));
    }
}