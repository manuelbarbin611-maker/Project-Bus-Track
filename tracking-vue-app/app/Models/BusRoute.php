<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BusRoute extends Model
{
    protected $table = 'routes';

    protected $fillable = ['name', 'description', 'status'];

    // ── Relationships ──────────────────────────────────────────────────────────

    public function stops(): HasMany
    {
        return $this->hasMany(TrackStop::class, 'route_id')
                    ->orderBy('stop_order');
    }

    public function buses(): HasMany
    {
        return $this->hasMany(Bus::class, 'route_id');
    }
}
