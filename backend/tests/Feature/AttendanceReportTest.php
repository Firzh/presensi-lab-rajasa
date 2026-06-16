<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Tests\Feature;

use Rajasa\PresensiSiswa\Tests\Support\TestCase;

final class AttendanceReportTest extends TestCase
{
    private string $adminToken;

    protected function setUp(): void
    {
        parent::setUp();
        $this->adminToken = $this->loginAndGetToken('admin.demo', 'Rajasa@123');
    }

    public function test_can_get_report_data_with_filters(): void
    {
        $response = $this->runApp(
            'GET', 
            '/api/reports/presensi?date_from=2026-06-01&date_to=2026-06-14&status=hadir', 
            [], 
            ['Authorization' => 'Bearer ' . $this->adminToken]
        );

        $this->assertSame(200, $response['__status_code']);
        $this->assertTrue($response['success']);
        $this->assertArrayHasKey('data', $response);
        $this->assertArrayHasKey('summary', $response['data']);
        $this->assertArrayHasKey('items', $response['data']);
        $this->assertArrayHasKey('pagination', $response['data']);
        
        $this->assertIsArray($response['data']['items']);
        $this->assertIsArray($response['data']['summary']);
    }

    public function test_unauthorized_user_cannot_get_report_data(): void
    {
        $response = $this->runApp('GET', '/api/reports/presensi');
        
        $this->assertSame(401, $response['__status_code']);
        $this->assertFalse($response['success']);
    }
}
