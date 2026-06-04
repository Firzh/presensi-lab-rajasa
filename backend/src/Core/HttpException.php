<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Core;

use InvalidArgumentException;
use RuntimeException;

final class HttpException extends RuntimeException
{
    public function __construct(
        string $message,
        private readonly int $statusCode = 400,
        private readonly array $errors = [],
        private readonly ?string $errorCode = null
    ) {
        if ($statusCode < 400 || $statusCode > 599) {
            throw new InvalidArgumentException('HTTP exception status code must be between 400 and 599.');
        }

        parent::__construct($message);
    }

    public function statusCode(): int
    {
        return $this->statusCode;
    }

    public function errors(): array
    {
        return $this->errors;
    }

    public function errorCode(): ?string
    {
        return $this->errorCode;
    }
}