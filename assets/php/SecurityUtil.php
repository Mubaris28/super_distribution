<?php
/**
 * Security and Rate Limiting Utilities for Contact & Reseller mail forms.
 * Log file: assets/php/logs/submissions.log
 */
class SecurityUtil {

    private static function getLogFile(): string {
        return __DIR__ . '/logs/submissions.log';
    }

    public static function checkOrigin(): bool {
        if (!defined('ALLOWED_ORIGINS')) {
            return true;
        }
        $origin = $_SERVER['HTTP_ORIGIN'] ?? $_SERVER['HTTP_REFERER'] ?? '';
        $host   = $_SERVER['HTTP_HOST'] ?? '';
        $scheme = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https' : 'http';
        if (defined('DEBUG_MODE') && DEBUG_MODE) {
            error_log('ORIGIN DEBUG - Origin: ' . $origin . ', Host: ' . $host);
        }
        $currentUrl = $scheme . '://' . $host;
        if (is_array(ALLOWED_ORIGINS) && in_array($currentUrl, ALLOWED_ORIGINS, true)) {
            return true;
        }
        if ($origin !== '' && is_array(ALLOWED_ORIGINS) && in_array($origin, ALLOWED_ORIGINS, true)) {
            return true;
        }
        if (strpos($host, 'localhost') !== false || strpos($host, '127.0.0.1') !== false) {
            return true;
        }
        return false;
    }

    public static function checkRateLimit(string $ip): bool {
        if (!defined('MAX_SUBMISSIONS_PER_HOUR') || !defined('MAX_SUBMISSIONS_PER_DAY')) {
            return true;
        }
        $logFile = self::getLogFile();
        $logDir  = dirname($logFile);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        $logs        = self::getSubmissionLogs($ip);
        $now         = time();
        $oneHourAgo  = $now - 3600;
        $oneDayAgo   = $now - 86400;
        $hourlyCount = 0;
        $dailyCount  = 0;
        foreach ($logs as $timestamp) {
            if ($timestamp > $oneHourAgo)  $hourlyCount++;
            if ($timestamp > $oneDayAgo)   $dailyCount++;
        }
        if ($hourlyCount >= MAX_SUBMISSIONS_PER_HOUR) return false;
        if ($dailyCount >= MAX_SUBMISSIONS_PER_DAY)   return false;
        return true;
    }

    public static function logSubmission(string $ip, string $email = ''): void {
        $logFile = self::getLogFile();
        $logDir  = dirname($logFile);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        $logEntry = time() . '|' . $ip . '|' . $email . "\n";
        file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
        self::cleanOldLogs();
    }

    private static function getSubmissionLogs(string $ip): array {
        $logFile = self::getLogFile();
        if (!file_exists($logFile)) return [];
        $logs   = file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $result = [];
        foreach ($logs as $log) {
            $parts = explode('|', $log);
            if (count($parts) >= 2 && $parts[1] === $ip) {
                $result[] = (int) $parts[0];
            }
        }
        return $result;
    }

    private static function cleanOldLogs(): void {
        $logFile = self::getLogFile();
        if (!file_exists($logFile)) return;
        $logs         = file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $sevenDaysAgo = time() - (7 * 86400);
        $valid        = [];
        foreach ($logs as $log) {
            $parts = explode('|', $log);
            if (count($parts) >= 1 && (int) $parts[0] > $sevenDaysAgo) {
                $valid[] = $log;
            }
        }
        file_put_contents($logFile, implode("\n", $valid) . "\n", LOCK_EX);
    }

    public static function sanitizeInput($data) {
        if (is_array($data)) {
            return array_map([self::class, 'sanitizeInput'], $data);
        }
        return htmlspecialchars(strip_tags(trim((string) $data)), ENT_QUOTES, 'UTF-8');
    }

    public static function validateEmail(string $email): bool {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    public static function getClientIP(): string {
        $keys = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
        foreach ($keys as $key) {
            if (!empty($_SERVER[$key])) {
                $ip = $_SERVER[$key];
                if (strpos($ip, ',') !== false) $ip = trim(explode(',', $ip)[0]);
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP)) return $ip;
            }
        }
        return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    }
}
