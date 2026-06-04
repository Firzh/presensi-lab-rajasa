<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Core;

final class RequestValidator
{
    public function validate(array $data, array $rules): array
    {
        $errors = [];

        foreach ($rules as $field => $fieldRules) {
            $value = $data[$field] ?? null;
            $isNullable = in_array('nullable', $fieldRules, true);

            if ($isNullable && ($value === null || $value === '')) {
                continue;
            }

            foreach ($fieldRules as $rule) {
                if ($rule === 'nullable') {
                    continue;
                }

                if ($rule === 'required' && ($value === null || $value === '' || $value === [])) {
                    $errors[$field] = 'Field ini wajib diisi.';
                    break;
                }

                if ($value === null || $value === '') {
                    continue;
                }

                if ($rule === 'string' && !is_string($value)) {
                    $errors[$field] = 'Field ini harus berupa teks.';
                    break;
                }

                if ($rule === 'integer' && filter_var($value, FILTER_VALIDATE_INT) === false) {
                    $errors[$field] = 'Field ini harus berupa angka bulat.';
                    break;
                }

                if ($rule === 'numeric' && !is_numeric($value)) {
                    $errors[$field] = 'Field ini harus berupa angka.';
                    break;
                }

                if ($rule === 'array' && !is_array($value)) {
                    $errors[$field] = 'Field ini harus berupa array.';
                    break;
                }

                if ($rule === 'file' && !$this->isValidUploadedFile($value)) {
                    $errors[$field] = 'Field ini harus berupa file upload yang valid.';
                    break;
                }

                if ($rule === 'date' && !$this->isValidDate($value)) {
                    $errors[$field] = 'Field ini harus berupa tanggal valid dengan format YYYY-MM-DD.';
                    break;
                }

                if (str_starts_with($rule, 'in:')) {
                    $allowed = array_map('trim', explode(',', substr($rule, 3)));   

                    if (!in_array((string) $value, $allowed, true)) {
                        $errors[$field] = 'Field ini memiliki nilai yang tidak diperbolehkan.';
                        break;
                    }
                }

                if (str_starts_with($rule, 'min:')) {
                    $min = (int) substr($rule, 4);

                    if (is_string($value) && mb_strlen($value) < $min) {
                        $errors[$field] = "Field ini minimal {$min} karakter.";
                        break;
                    }

                    if (is_numeric($value) && (float) $value < $min) {
                        $errors[$field] = "Field ini minimal {$min}.";
                        break;
                    }

                    if (is_array($value) && count($value) < $min) {
                        $errors[$field] = "Field ini minimal {$min} item.";
                        break;
                    }
                }

                if (str_starts_with($rule, 'max:')) {
                    $max = (int) substr($rule, 4);

                    if (is_string($value) && mb_strlen($value) > $max) {
                        $errors[$field] = "Field ini maksimal {$max} karakter.";
                        break;
                    }

                    if (is_numeric($value) && (float) $value > $max) {
                        $errors[$field] = "Field ini maksimal {$max}.";
                        break;
                    }

                    if (is_array($value) && count($value) > $max) {
                        $errors[$field] = "Field ini maksimal {$max} item.";
                        break;
                    }
                }

                if (
                    !in_array($rule, ['required', 'nullable', 'string', 'integer', 'numeric', 'date', 'array', 'file'], true)
                    && !str_starts_with($rule, 'in:')
                    && !str_starts_with($rule, 'min:')
                    && !str_starts_with($rule, 'max:')
                ) {
                    throw new HttpException('Rule validasi tidak dikenali.', 500, [
                        $field => $rule,
                    ], 'SERVER_ERROR');
                }
            }
        }

        if ($errors !== []) {
            throw new HttpException('Validasi gagal.', 422, $errors, 'VALIDATION_ERROR');
        }

        return $data;
    }

    private function isValidDate(mixed $value): bool
    {
        if (!is_string($value)) {
            return false;
        }

        $date = \DateTimeImmutable::createFromFormat('Y-m-d', $value);

        return $date instanceof \DateTimeImmutable
            && $date->format('Y-m-d') === $value;
    }

    private function isValidUploadedFile(mixed $value): bool
    {
        return is_array($value)
            && isset($value['tmp_name'], $value['error'])
            && (int) $value['error'] === UPLOAD_ERR_OK
            && is_string($value['tmp_name'])
            && $value['tmp_name'] !== '';
    }
}