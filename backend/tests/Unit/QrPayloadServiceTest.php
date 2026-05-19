<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Tests\Unit;

use PHPUnit\Framework\TestCase;
use Rajasa\PresensiSiswa\Services\QrPayloadService;

final class QrPayloadServiceTest extends TestCase
{
    public function test_parse_google_form_qr_payload(): void
    {
        $service = new QrPayloadService();

        $result = $service->parse(
            'https://docs.google.com/forms/d/e/1FAIpQLSdld41u92r5hCQUzp_HeGNnPN7StSC9LcAlixa9Ymzg4ixkRw/formResponse?usp=pp_url&entry.1743651050=RENDY+PRAWIRA&entry.178375719=0099662619'
        );

        $this->assertSame('RENDY PRAWIRA', $result['payload_nama']);
        $this->assertSame('0099662619', $result['payload_nisn']);
        $this->assertSame('rendyprawira0099662619', $result['payload_normalized']);
    }

    public function test_parse_plain_payload_still_supported(): void
    {
        $service = new QrPayloadService();

        $result = $service->parse('RENDY PRAWIRA|0099662619');

        $this->assertSame('RENDY PRAWIRA', $result['payload_nama']);
        $this->assertSame('0099662619', $result['payload_nisn']);
    }
}