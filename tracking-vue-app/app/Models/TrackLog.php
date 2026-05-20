<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrackLog extends Model
{
    protected $table = 'track_log';

    public $timestamps = false; // only has logged_at via useCurrent()

    protected $fillable = [
        'bus_id',
        'stop_id',
        'stop_name',
        'latitude',
        'longitude',
    ];

    protected function casts(): array
    {
        return [
            'latitude'  => 'float',
            'longitude' => 'float',
            'logged_at' => 'datetime',
        ];
    }

    // ── Relationships ──────────────────────────────────────────────────────────

    public function bus(): BelongsTo
    {
        return $this->belongsTo(Bus::class, 'bus_id');
    }

    public function stop(): BelongsTo
    {
        return $this->belongsTo(TrackStop::class, 'stop_id');
    }
}
