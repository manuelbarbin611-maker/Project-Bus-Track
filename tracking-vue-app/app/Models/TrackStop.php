<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TrackStop extends Model
{
    protected $table = 'track_stops';

    public $timestamps = false; // only has created_at via useCurrent()

    protected $fillable = [
        'route_id',
        'stop_name',
        'stop_order',
        'latitude',
        'longitude',
    ];

    protected function casts(): array
    {
        return [
            'latitude'   => 'float',
            'longitude'  => 'float',
            'stop_order' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    // ── Relationships ──────────────────────────────────────────────────────────

    public function route(): BelongsTo
    {
        return $this->belongsTo(BusRoute::class, 'route_id');
    }

    /** Buses currently stationed at this stop */
    public function busesHere(): HasMany
    {
        return $this->hasMany(Bus::class, 'current_stop_id');
    }

    /** Track log entries that recorded this stop */
    public function trackLogs(): HasMany
    {
        return $this->hasMany(TrackLog::class, 'stop_id');
    }
}
