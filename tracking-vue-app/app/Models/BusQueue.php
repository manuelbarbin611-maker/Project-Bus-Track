<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BusQueue extends Model
{
    protected $table = 'bus_queue';

    public $timestamps = false; // only has queued_at via useCurrent()

    protected $fillable = [
        'bus_id',
        'passenger_id',
        'queue_order',
    ];

    protected function casts(): array
    {
        return [
            'queue_order' => 'integer',
            'queued_at'   => 'datetime',
        ];
    }

    // ── Relationships ──────────────────────────────────────────────────────────

    public function bus(): BelongsTo
    {
        return $this->belongsTo(Bus::class, 'bus_id');
    }

    public function passenger(): BelongsTo
    {
        return $this->belongsTo(Passenger::class, 'passenger_id');
    }
}
