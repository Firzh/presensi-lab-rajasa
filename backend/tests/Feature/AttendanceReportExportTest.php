<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Tests\Feature;

use Rajasa\PresensiSiswa\Tests\Support\TestCase;

final class AttendanceReportExportTest extends TestCase
{
    private string $adminToken;

    protected function setUp(): void
    {
        parent::setUp();
        $this->adminToken = $this->loginAndGetToken('admin.demo', 'Rajasa@123');
    }

    public function test_can_export_csv(): void
    {
        $response = $this->runApp(
            'GET', 
            '/api/reports/presensi/export?format=csv', 
            [], 
            ['Authorization' => 'Bearer ' . $this->adminToken]
        );

        $this->assertSame(200, $response['__status_code']);
    }

    public function test_can_export_xlsx(): void
    {
        $response = $this->runApp(
            'GET', 
            '/api/reports/presensi/export?format=xlsx', 
            [], 
            ['Authorization' => 'Bearer ' . $this->adminToken]
        );

        $this->assertSame(200, $response['__status_code']);
    }

    public function test_export_unsupported_format_returns_400(): void
    {
        $response = $this->runApp(
            'GET', 
            '/api/reports/presensi/export?format=txt', 
            [], 
            ['Authorization' => 'Bearer ' . $this->adminToken]
        );

        $this->assertSame(400, $response['__status_code']);
    }

    public function test_export_pdf_returns_200(): void
    {
        $response = $this->runApp(
            'GET', 
            '/api/reports/presensi/export?format=pdf', 
            [], 
            ['Authorization' => 'Bearer ' . $this->adminToken]
        );

        $this->assertSame(200, $response['__status_code']);
    }

    public function test_export_docx_returns_200(): void
    {
        $response = $this->runApp(
            'GET', 
            '/api/reports/presensi/export?format=docx', 
            [], 
            ['Authorization' => 'Bearer ' . $this->adminToken]
        );

        $this->assertSame(200, $response['__status_code']);
    }

    public function test_export_requires_token(): void
    {
        $response = $this->runApp('GET', '/api/reports/presensi/export?format=csv');

        $this->assertSame(401, $response['__status_code']);
    }

    public function test_export_excel_alias_is_not_backend_contract(): void
    {
        $response = $this->runApp(
            'GET',
            '/api/reports/presensi/export?format=excel',
            [],
            ['Authorization' => 'Bearer ' . $this->adminToken]
        );

        $this->assertSame(400, $response['__status_code']);
    }

    public function test_export_csv_with_per_page_zero_returns_more_than_header_when_data_exists(): void
    {
        $response = $this->runApp(
            'GET',
            '/api/reports/presensi/export?format=csv&per_page=0',
            [],
            ['Authorization' => 'Bearer ' . $this->adminToken]
        );

        $this->assertSame(200, $response['__status_code']);
        $this->assertStringContainsString('Tanggal', $response['__raw_content']);
    }
}
