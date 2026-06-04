<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Tests\Unit;

use Rajasa\PresensiSiswa\Core\HttpException;
use Rajasa\PresensiSiswa\Core\RequestValidator;
use PHPUnit\Framework\TestCase;

final class RequestValidatorTest extends TestCase
{
    public function test_validate_passes_valid_data(): void
    {
        $validator = new RequestValidator();

        $data = $validator->validate([
            'nama' => 'Budi',
            'umur' => '17',
            'status' => 'hadir',
        ], [
            'nama' => ['required', 'string', 'min:3'],
            'umur' => ['required', 'integer', 'min:1'],
            'status' => ['required', 'in:hadir,izin,sakit,alpha'],
        ]);

        $this->assertSame('Budi', $data['nama']);
    }

    public function test_validate_throws_validation_error(): void
    {
        $validator = new RequestValidator();

        $this->expectException(HttpException::class);

        $validator->validate([
            'nama' => '',
        ], [
            'nama' => ['required', 'string'],
        ]);
    }

    public function test_validate_rejects_unknown_rule(): void
    {
        $validator = new RequestValidator();

        $this->expectException(HttpException::class);

        $validator->validate([
            'nama' => 'Budi',
        ], [
            'nama' => ['required', 'unknown_rule'],
        ]);
    }

    public function test_validate_accepts_uploaded_file(): void
    {
        $validator = new RequestValidator();

        $data = $validator->validate([
            'file' => [
                'tmp_name' => '/tmp/example.csv',
                'error' => UPLOAD_ERR_OK,
            ],
        ], [
            'file' => ['required', 'file'],
        ]);

        $this->assertSame(UPLOAD_ERR_OK, $data['file']['error']);
    }

    public function test_validate_accepts_nullable_empty_value(): void
    {
        $validator = new RequestValidator();

        $data = $validator->validate([
            'catatan' => '',
        ], [
            'catatan' => ['nullable', 'string'],
        ]);

        $this->assertSame('', $data['catatan']);
    }

    public function test_validate_rejects_invalid_date(): void
    {
        $validator = new RequestValidator();

        $this->expectException(HttpException::class);

        $validator->validate([
            'tanggal' => '2026-99-99',
        ], [
            'tanggal' => ['required', 'date'],
        ]);
    }

    public function test_validate_rejects_empty_required_array(): void
    {
        $validator = new RequestValidator();

        $this->expectException(HttpException::class);

        $validator->validate([
            'jam_ids' => [],
        ], [
            'jam_ids' => ['required', 'array', 'min:1'],
        ]);
    }

    public function test_validate_throws_validation_error_code(): void
    {
        $validator = new RequestValidator();

        try {
            $validator->validate([
                'nama' => '',
            ], [
                'nama' => ['required'],
            ]);

            $this->fail('Expected HttpException was not thrown.');
        } catch (HttpException $exception) {
            $this->assertSame(422, $exception->statusCode());
            $this->assertSame('VALIDATION_ERROR', $exception->errorCode());
        }
    }
}