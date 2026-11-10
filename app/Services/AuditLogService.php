<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuditLogService
{
    public function log(
        string $actorType,
        ?int $actorId,
        string $action,
        ?string $targetType = null,
        ?int $targetId = null,
        ?string $reference = null,
        ?string $reason = null,
        ?array $metadata = null,
        ?string $ipAddress = null
    ): AuditLog {
        return AuditLog::create([
            'actor_type' => $actorType,
            'actor_id' => $actorId,
            'action' => $action,
            'target_type' => $targetType,
            'target_id' => $targetId,
            'reference' => $reference,
            'reason' => $reason,
            'metadata' => $metadata,
            'ip_address' => $ipAddress ?? request()->ip(),
        ]);
    }

    public function logAdmin(
        string $action,
        ?string $targetType = null,
        ?int $targetId = null,
        ?string $reference = null,
        ?string $reason = null,
        ?array $metadata = null
    ): AuditLog {
        $admin = Auth::guard('admin')->user();

        return $this->log(
            'admin',
            $admin ? $admin->id : null,
            $action,
            $targetType,
            $targetId,
            $reference,
            $reason,
            $metadata
        );
    }

    public function logUser(
        string $action,
        ?string $targetType = null,
        ?int $targetId = null,
        ?string $reference = null,
        ?string $reason = null,
        ?array $metadata = null
    ): AuditLog {
        $user = Auth::guard('web')->user();

        return $this->log(
            'user',
            $user ? $user->id : null,
            $action,
            $targetType,
            $targetId,
            $reference,
            $reason,
            $metadata
        );
    }

    public function logSystem(
        string $action,
        ?string $reference = null,
        ?array $metadata = null
    ): AuditLog {
        return $this->log(
            'system',
            null,
            $action,
            null,
            null,
            $reference,
            'Automated system event',
            $metadata,
            '127.0.0.1'
        );
    }
}
