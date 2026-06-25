<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Http\Controllers;

use Rajasa\PresensiSiswa\Core\Request;
use Rajasa\PresensiSiswa\Core\Response;
use Rajasa\PresensiSiswa\Http\Middleware\PermissionMiddleware;
use Rajasa\PresensiSiswa\Services\ReportService;
use Rajasa\PresensiSiswa\Services\Exporters\CsvExporter;
use Rajasa\PresensiSiswa\Services\Exporters\XlsxExporter;
use Rajasa\PresensiSiswa\Services\Exporters\PdfExporter;
use Rajasa\PresensiSiswa\Services\Exporters\DocxExporter;

final class ReportExportController
{
    public function __construct(
        private readonly Request $request,
        private readonly PermissionMiddleware $permission,
        private readonly ReportService $reportService,
        private readonly CsvExporter $csvExporter,
        private readonly XlsxExporter $xlsxExporter,
        private readonly PdfExporter $pdfExporter,
        private readonly DocxExporter $docxExporter
    ) {
    }

    public function __invoke(): void
    {
        $this->permission->require('reports.attendance.export');

        $format = strtolower($this->request->input('format', 'csv'));
        if (!in_array($format, ['csv', 'xlsx', 'pdf', 'docx'])) {
            Response::error('Format tidak didukung.', [], 400);
            return;
        }

        $filters = $this->request->query();
        $filters['page'] = 1;
        $filters['per_page'] = 0;
        
        $report = $this->reportService->getAttendanceReport($filters);
        $data = $report['items'] ?? [];
        $summary = $report['summary'] ?? [];

        $filename = 'laporan-presensi-' . date('Ymd_His') . '.' . $format;

        switch ($format) {
            case 'csv':
                $content = $this->csvExporter->export($data);
                $contentType = 'text/csv; charset=UTF-8';
                break;
            case 'xlsx':
                $content = $this->xlsxExporter->export($data, $summary);
                $contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                break;
            case 'pdf':
                $content = $this->pdfExporter->export($data, $summary, $report['filters'] ?? []);
                $contentType = 'application/pdf';
                break;
            case 'docx':
                $content = $this->docxExporter->export($data, $summary, $report['filters'] ?? []);
                $contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                break;
            default:
                Response::error('Format tidak didukung.', [], 400);
                return;
        }

        http_response_code(200);
        header('Content-Type: ' . $contentType);
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Content-Length: ' . strlen($content));
        header('Cache-Control: no-cache, no-store, must-revalidate');
        header('Pragma: no-cache');
        header('Expires: 0');

        echo $content;
        return;
    }
}
