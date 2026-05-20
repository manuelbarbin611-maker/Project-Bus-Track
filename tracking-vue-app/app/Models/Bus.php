<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bus extends Model
{
    protected $table = 'buses';

    protected $fillable = [
        'bus_number',
        'route_id',
        'capacity',
        'current_stop_id',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'capacity' => 'integer',
        ];
    }

    // ── Relationships ──────────────────────────────────────────────────────────

    public function route(): BelongsTo
    {
        return $this->belongsTo(BusRoute::class, 'route_id');
    }

    public function currentStop(): BelongsTo
    {
        return $this->belongsTo(TrackStop::class, 'current_stop_id');
    }

    /** Passengers currently assigned to this bus */
    public function passengers(): HasMany
    {
        return $this->hasMany(Passenger::class, 'assigned_bus_id');
    }

    /** Ordered queue entries */
    public function queue(): HasMany
    {
        return $this->hasMany(BusQueue::class, 'bus_id')
                    ->orderBy('queue_order');
    }

    public function trackLogs(): HasMany
    {
        return $this->hasMany(TrackLog::class, 'bus_id')
                    ->orderByDesc('logged_at');
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** Remaining seats = capacity minus onboarded passengers */
    public function availableSeats(): int
    {
        return max(0, $this->capacity - $this->passengers()->where('status', 'onboarded')->count());
    }
}
