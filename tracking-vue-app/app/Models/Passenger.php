<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Passenger extends Model
{
    protected $table = 'passengers';

    protected $fillable = [
        'first_name',
        'last_name',
        'status',
        'assigned_bus_id',
    ];

    // ── Relationships ──────────────────────────────────────────────────────────

    public function assignedBus(): BelongsTo
    {
        return $this->belongsTo(Bus::class, 'assigned_bus_id');
    }

    public function queueEntry(): HasOne
    {
        return $this->hasOne(BusQueue::class, 'passenger_id');
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }
}
