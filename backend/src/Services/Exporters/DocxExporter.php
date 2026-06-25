<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Services\Exporters;

use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\SimpleType\Jc;
use PhpOffice\PhpWord\Style\TablePosition;

final class DocxExporter
{
    public function export(array $data, array $summary = [], array $filters = []): string
    {
        $data = AttendanceExportRows::compact($data);

        $phpWord = new PhpWord();
        $phpWord->setDefaultFontName('Arial');
        $phpWord->setDefaultFontSize(10);
        
        $section = $phpWord->addSection([
            'orientation' => 'landscape',
            'marginLeft' => 600,
            'marginRight' => 600,
            'marginTop' => 600,
            'marginBottom' => 600,
        ]);
        
        $dateFrom = $filters['date_from'] ?? date('Y-m-d');
        $dateTo = $filters['date_to'] ?? date('Y-m-d');
        $period = $dateFrom === $dateTo ? $dateFrom : "$dateFrom s/d $dateTo";
        
        // Header
        $section->addText('LAPORAN PRESENSI SISWA', ['bold' => true, 'size' => 16], ['alignment' => Jc::CENTER]);
        $section->addText('SMK Rajasa Surabaya', ['size' => 12], ['alignment' => Jc::CENTER]);
        $section->addText("Periode: $period", ['size' => 10], ['alignment' => Jc::CENTER]);
        $section->addTextBreak(1);
        
        // Summary
        $summary = array_merge([
            'total' => count($data),
            'hadir' => 0,
            'terlambat' => 0,
            'sakit' => 0,
            'izin' => 0,
            'alpha' => 0,
        ], $summary);
        
        $tableStyle = [
            'borderSize' => 6,
            'borderColor' => '000000',
            'cellMargin' => 50,
            'alignment' => Jc::CENTER,
        ];
        $phpWord->addTableStyle('Summary Table', $tableStyle);
        $sumTable = $section->addTable('Summary Table');
        
        $sumTable->addRow();
        $sumTable->addCell(1500, ['bgColor' => 'F5F5F5'])->addText('Total', ['bold' => true], ['alignment' => Jc::CENTER]);
        $sumTable->addCell(1500, ['bgColor' => 'F5F5F5'])->addText('Hadir', ['bold' => true], ['alignment' => Jc::CENTER]);
        $sumTable->addCell(1500, ['bgColor' => 'F5F5F5'])->addText('Terlambat', ['bold' => true], ['alignment' => Jc::CENTER]);
        $sumTable->addCell(1500, ['bgColor' => 'F5F5F5'])->addText('Sakit', ['bold' => true], ['alignment' => Jc::CENTER]);
        $sumTable->addCell(1500, ['bgColor' => 'F5F5F5'])->addText('Izin', ['bold' => true], ['alignment' => Jc::CENTER]);
        $sumTable->addCell(1500, ['bgColor' => 'F5F5F5'])->addText('Alpha', ['bold' => true], ['alignment' => Jc::CENTER]);
        
        $sumTable->addRow();
        $sumTable->addCell(1500)->addText((string)$summary['total'], [], ['alignment' => Jc::CENTER]);
        $sumTable->addCell(1500)->addText((string)$summary['hadir'], [], ['alignment' => Jc::CENTER]);
        $sumTable->addCell(1500)->addText((string)$summary['terlambat'], [], ['alignment' => Jc::CENTER]);
        $sumTable->addCell(1500)->addText((string)$summary['sakit'], [], ['alignment' => Jc::CENTER]);
        $sumTable->addCell(1500)->addText((string)$summary['izin'], [], ['alignment' => Jc::CENTER]);
        $sumTable->addCell(1500)->addText((string)$summary['alpha'], [], ['alignment' => Jc::CENTER]);
        
        $section->addTextBreak(1);
        
        // Data Table
        $phpWord->addTableStyle('Data Table', $tableStyle);
        $dataTable = $section->addTable('Data Table');
        
        $dataTable->addRow();
        $headerStyle = ['bold' => true, 'color' => 'FFFFFF'];
        $headerBg = ['bgColor' => '4472C4'];
        
        $dataTable->addCell(600, $headerBg)->addText('No', $headerStyle, ['alignment' => Jc::CENTER]);
        $dataTable->addCell(1500, $headerBg)->addText('Tanggal', $headerStyle, ['alignment' => Jc::CENTER]);
        $dataTable->addCell(3000, $headerBg)->addText('Siswa', $headerStyle);
        $dataTable->addCell(1500, $headerBg)->addText('NISN', $headerStyle, ['alignment' => Jc::CENTER]);
        $dataTable->addCell(1500, $headerBg)->addText('Rombel', $headerStyle, ['alignment' => Jc::CENTER]);
        $dataTable->addCell(1500, $headerBg)->addText('Kehadiran', $headerStyle, ['alignment' => Jc::CENTER]);
        $tidakHadirHeader = $dataTable->addCell(1900, $headerBg);
        $tidakHadirHeaderRun = $tidakHadirHeader->addTextRun(['alignment' => Jc::CENTER]);
        $tidakHadirHeaderRun->addText('Jam Pelajaran', $headerStyle);
        $tidakHadirHeaderRun->addTextBreak();
        $tidakHadirHeaderRun->addText('Tidak Hadir', $headerStyle);
        $dataTable->addCell(1500, $headerBg)->addText('Status', $headerStyle, ['alignment' => Jc::CENTER]);
        
        if (empty($data)) {
            $dataTable->addRow();
            $dataTable->addCell(12600, ['gridSpan' => 8])->addText('Tidak ada data pada periode ini', [], ['alignment' => Jc::CENTER]);
        } else {
            $no = 1;
            foreach ($data as $row) {
                $dataTable->addRow();
                $dataTable->addCell(600)->addText((string)$no++, [], ['alignment' => Jc::CENTER]);
                $dataTable->addCell(1500)->addText($row['tanggal'] ?? '-');
                $dataTable->addCell(3000)->addText($row['nama_siswa'] ?? '-');
                $dataTable->addCell(1500)->addText($row['nisn'] ?? '-');
                $dataTable->addCell(1500)->addText($row['rombel'] ?? '-');
                $dataTable->addCell(1500)->addText((string)($row['kehadiran'] ?? '-'), [], ['alignment' => Jc::CENTER]);
                $dataTable->addCell(1900)->addText((string)($row['jam_pelajaran_tidak_hadir'] ?? '-'), [], ['alignment' => Jc::CENTER]);
                $dataTable->addCell(1500)->addText((string)($row['status'] ?? '-'), [], ['alignment' => Jc::CENTER]);
            }
        }
        
        $section->addTextBreak(2);
        
        // Signatures
        $sigTable = $section->addTable(['alignment' => Jc::CENTER, 'cellMargin' => 0]);
        $sigTable->addRow();
        $sigTable->addCell(4000)->addText('Kepala Sekolah', [], ['alignment' => Jc::CENTER]);
        $sigTable->addCell(4000)->addText('Wali Kelas', [], ['alignment' => Jc::CENTER]);
        $sigTable->addCell(4000)->addText('Admin', [], ['alignment' => Jc::CENTER]);
        
        $sigTable->addRow(1500, ['exactHeight' => true]);
        $sigTable->addCell(4000)->addText('', [], []);
        $sigTable->addCell(4000)->addText('', [], []);
        $sigTable->addCell(4000)->addText('', [], []);
        
        $sigTable->addRow();
        $sigTable->addCell(4000)->addText('(____________________)', [], ['alignment' => Jc::CENTER]);
        $sigTable->addCell(4000)->addText('(____________________)', [], ['alignment' => Jc::CENTER]);
        $sigTable->addCell(4000)->addText('(____________________)', [], ['alignment' => Jc::CENTER]);
        
        // Footer
        $footer = $section->addFooter();
        $footer->addText('Dicetak pada: ' . date('d M Y H:i:s') . ' | Sistem Presensi Lab Rajasa', ['size' => 8, 'color' => '666666'], ['alignment' => Jc::RIGHT]);
        
        // Save to temporary file since PhpWord requires a file path
        $tempFile = tempnam(sys_get_temp_dir(), 'docx_');
        $objWriter = IOFactory::createWriter($phpWord, 'Word2007');
        $objWriter->save($tempFile);
        
        $content = file_get_contents($tempFile);
        @unlink($tempFile);
        
        return $content !== false ? $content : '';
    }
}
