<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Services\Exporters;

final class CsvExporter
{
    public function export(array $data): string
    {
        $output = fopen('php://temp', 'w');
        
        // Add BOM for UTF-8 Excel compatibility
        fwrite($output, "\xEF\xBB\xBF");
        
        fputcsv($output, ['Tanggal', 'Siswa', 'NISN', 'Rombel', 'Ruangan', 'Jam Masuk', 'Status']);
        
        foreach ($data as $row) {
            fputcsv($output, [
                $row['tanggal'] ?? '-',
                $row['nama_siswa'] ?? '-',
                $row['nisn'] ?? '-',
                $row['rombel'] ?? '-',
                $row['ruangan'] ?? '-',
                $row['jam_ke'] ?? '-',
                $row['status'] ?? '-',
            ]);
        }
        
        rewind($output);
        $content = stream_get_contents($output);
        fclose($output);
        
        return $content !== false ? $content : '';
    }
}
