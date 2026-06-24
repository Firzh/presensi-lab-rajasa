<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Services\Exporters;

use Dompdf\Dompdf;
use Dompdf\Options;

final class PdfExporter
{
    public function export(array $data, array $summary = [], array $filters = []): string
    {
        $options = new Options();
        $options->set('defaultFont', 'Helvetica');
        $options->set('isHtml5ParserEnabled', true);
        
        $dompdf = new Dompdf($options);
        
        $html = $this->generateHtml($data, $summary, $filters);
        $dompdf->loadHtml($html);
        
        // Setup paper size and orientation
        $dompdf->setPaper('A4', 'landscape');
        
        // Render PDF
        $dompdf->render();
        
        return $dompdf->output() ?: '';
    }
    
    private function generateHtml(array $data, array $summary, array $filters): string
    {
        $dateFrom = $filters['date_from'] ?? date('Y-m-d');
        $dateTo = $filters['date_to'] ?? date('Y-m-d');
        $period = $dateFrom === $dateTo ? $dateFrom : "$dateFrom s/d $dateTo";
        
        // Ringkasan fallback
        $summary = array_merge([
            'total' => count($data),
            'hadir' => 0,
            'terlambat' => 0,
            'sakit' => 0,
            'izin' => 0,
            'alpha' => 0,
        ], $summary);
        
        $html = '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Laporan Presensi Siswa</title>
    <style>
        body { font-family: Helvetica, sans-serif; font-size: 11px; color: #333; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .header h1 { margin: 0; font-size: 18px; text-transform: uppercase; }
        .header h2 { margin: 5px 0 0; font-size: 14px; font-weight: normal; }
        .summary { margin-bottom: 15px; }
        .summary-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .summary-table th, .summary-table td { border: 1px solid #ccc; padding: 6px; text-align: center; }
        .summary-table th { background-color: #f5f5f5; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th, .data-table td { border: 1px solid #000; padding: 6px; }
        .data-table th { background-color: #4472C4; color: white; }
        .data-table tr:nth-child(even) { background-color: #f9f9f9; }
        .footer { position: fixed; bottom: -20px; left: 0; right: 0; font-size: 9px; color: #666; text-align: right; }
        .page-break { page-break-after: always; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Laporan Presensi Siswa</h1>
        <h2>SMK Rajasa Surabaya</h2>
        <p style="margin: 5px 0 0; font-size: 11px;">Periode: ' . htmlspecialchars($period) . '</p>
    </div>
    
    <div class="summary">
        <table class="summary-table">
            <tr>
                <th>Total</th>
                <th>Hadir</th>
                <th>Terlambat</th>
                <th>Sakit</th>
                <th>Izin</th>
                <th>Alpha</th>
            </tr>
            <tr>
                <td>' . $summary['total'] . '</td>
                <td>' . $summary['hadir'] . '</td>
                <td>' . $summary['terlambat'] . '</td>
                <td>' . $summary['sakit'] . '</td>
                <td>' . $summary['izin'] . '</td>
                <td>' . $summary['alpha'] . '</td>
            </tr>
        </table>
    </div>
    
    <table class="data-table">
        <thead>
            <tr>
                <th width="3%">No</th>
                <th width="10%">Tanggal</th>
                <th width="25%">Siswa</th>
                <th width="10%">NISN</th>
                <th width="12%">Rombel</th>
                <th width="15%">Ruangan</th>
                <th width="10%">Jam Masuk</th>
                <th width="15%">Status</th>
            </tr>
        </thead>
        <tbody>';
        
        if (empty($data)) {
            $html .= '<tr><td colspan="8" style="text-align: center; padding: 15px;">Tidak ada data pada periode ini</td></tr>';
        } else {
            $no = 1;
            foreach ($data as $row) {
                $html .= '<tr>
                    <td style="text-align: center;">' . $no++ . '</td>
                    <td>' . htmlspecialchars((string) ($row['tanggal'] ?? '-')) . '</td>
                    <td>' . htmlspecialchars((string) ($row['nama_siswa'] ?? '-')) . '</td>
                    <td>' . htmlspecialchars((string) ($row['nisn'] ?? '-')) . '</td>
                    <td>' . htmlspecialchars((string) ($row['rombel'] ?? '-')) . '</td>
                    <td>' . htmlspecialchars((string) ($row['ruangan'] ?? '-')) . '</td>
                    <td style="text-align: center;">' . htmlspecialchars((string) ($row['jam_ke'] ?? '-')) . '</td>
                    <td style="text-align: center; text-transform: capitalize;">' . htmlspecialchars((string) ($row['status'] ?? '-')) . '</td>
                </tr>';
            }
        }
        
        $html .= '</tbody>
    </table>
    
    <div class="footer">
        Dicetak pada: ' . date('d M Y H:i:s') . ' | Sistem Presensi Lab Rajasa
    </div>
</body>
</html>';

        return $html;
    }
}
