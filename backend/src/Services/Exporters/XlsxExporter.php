<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Services\Exporters;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Border;

final class XlsxExporter
{
    public function export(array $data, array $summary): string
    {
        $spreadsheet = new Spreadsheet();
        
        // Sheet 1: Laporan Presensi
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Laporan Presensi');
        
        $sheet->setCellValue('A1', 'LAPORAN PRESENSI SISWA');
        $sheet->setCellValue('A2', 'Diekspor pada: ' . date('Y-m-d H:i:s'));
        
        $headers = ['Tanggal', 'Siswa', 'NISN', 'Rombel', 'Ruangan', 'Jam Masuk', 'Status'];
        foreach ($headers as $index => $header) {
            $col = chr(65 + $index);
            $sheet->setCellValue($col . '4', $header);
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
        
        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['argb' => Color::COLOR_WHITE]],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['argb' => 'FF4472C4']
            ],
            'borders' => [
                'allBorders' => ['borderStyle' => Border::BORDER_THIN]
            ]
        ];
        $sheet->getStyle('A4:G4')->applyFromArray($headerStyle);
        
        $rowNum = 5;
        foreach ($data as $row) {
            $sheet->setCellValue('A' . $rowNum, $row['tanggal'] ?? '-');
            $sheet->setCellValue('B' . $rowNum, $row['nama_siswa'] ?? '-');
            $sheet->setCellValueExplicit('C' . $rowNum, $row['nisn'] ?? '-', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
            $sheet->setCellValue('D' . $rowNum, $row['rombel'] ?? '-');
            $sheet->setCellValue('E' . $rowNum, $row['ruangan'] ?? '-');
            $sheet->setCellValue('F' . $rowNum, $row['jam_ke'] ?? '-');
            $sheet->setCellValue('G' . $rowNum, $row['status'] ?? '-');
            $rowNum++;
        }
        
        $sheet->freezePane('A5');
        
        // Sheet 2: Ringkasan
        $summarySheet = $spreadsheet->createSheet();
        $summarySheet->setTitle('Ringkasan');
        
        $summarySheet->setCellValue('A1', 'RINGKASAN PRESENSI');
        $summarySheet->setCellValue('A3', 'Status');
        $summarySheet->setCellValue('B3', 'Jumlah');
        $summarySheet->getStyle('A3:B3')->applyFromArray($headerStyle);
        
        $summaryRow = 4;
        $statuses = ['hadir', 'terlambat', 'sakit', 'izin', 'alpha'];
        foreach ($statuses as $status) {
            $summarySheet->setCellValue('A' . $summaryRow, ucfirst($status));
            $summarySheet->setCellValue('B' . $summaryRow, $summary[$status] ?? 0);
            $summaryRow++;
        }
        
        $summarySheet->setCellValue('A' . $summaryRow, 'Total');
        $summarySheet->setCellValue('B' . $summaryRow, $summary['total'] ?? 0);
        $summarySheet->getStyle('A' . $summaryRow . ':B' . $summaryRow)->getFont()->setBold(true);
        
        $summarySheet->getColumnDimension('A')->setAutoSize(true);
        $summarySheet->getColumnDimension('B')->setAutoSize(true);
        
        $spreadsheet->setActiveSheetIndex(0);
        
        $tempFile = tempnam(sys_get_temp_dir(), 'xlsx_');
        $writer = new Xlsx($spreadsheet);
        $writer->save($tempFile);
        
        $content = file_get_contents($tempFile);
        @unlink($tempFile);
        
        return $content !== false ? $content : '';
    }
}
