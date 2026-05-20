<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head } from '@inertiajs/vue3';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import axios from 'axios';

const buses       = ref([]);
const loading     = ref(true);
const lastUpdated = ref(null);
const search      = ref('');
const filterRoute = ref('');
let   pollTimer   = null;

// ── Data fetching ──────────────────────────────────────────────────────────────

const fetchLive = async () => {
    try {
        const res = await axios.get('/live');
        buses.value = res.data.data ?? [];
        lastUpdated.value = new Date();
    } catch {
        // silently fail on poll; initial error shown via loading guard
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchLive();
    pollTimer = setInterval(fetchLive, 15_000); // refresh every 15 s
});

onUnmounted(() => clearInterval(pollTimer));

// ── Filters ────────────────────────────────────────────────────────────────────

const routes = computed(() => [...new Set(buses.value.map(b => b.route).filter(Boolean))]);

const filtered = computed(() =>
    buses.value.filter(b => {
        const matchSearch = !search.value || b.bus_number?.toLowerCase().includes(search.value.toLowerCase());
        const matchRoute  = !filterRoute.value || b.route === filterRoute.value;
        return matchSearch && matchRoute;
    })
);

// ── Helpers ────────────────────────────────────────────────────────────────────

const statusColor = s => ({ active: 'badge-green', inactive: 'badge-grey', maintenance: 'badge-amber' }[s] ?? 'badge-grey');

const timeAgo = (dateStr) => {
    if (!dateStr) return '—';
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60)   return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
};

const formatTime = (d) => {
    if (!d) return '—';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const activeBuses      = computed(() => buses.value.filter(b => b.status === 'active').length);
const withLocationCount = computed(() => buses.value.filter(b => b.last_log).length);
</script>

<template>
    <Head title="Live Tracking" />
    <AuthenticatedLayout>
        <div class="page-wrap">

            <!-- Page header -->
            <div class="page-header">
                <div>
                    <h1 class="page-title">
                        <span class="live-dot-inline" />
                        Live Tracking
                    </h1>
                    <p class="page-sub">Real-time position of all active buses · auto-refreshes every 15 s</p>
                </div>
                <div class="header-right">
                    <span class="updated-label">
                        Last updated: <strong>{{ lastUpdated ? formatTime(lastUpdated) : '—' }}</strong>
                    </span>
                    <button @click="fetchLive" class="btn-ghost">↻ Refresh now</button>
                </div>
            </div>

            <!-- Stats -->
            <div class="stats-row">
                <div class="stat-pill">
                    <span class="stat-num">{{ buses.length }}</span>
                    <span class="stat-lbl">Total buses</span>
                </div>
                <div class="stat-pill">
                    <span class="stat-num text-emerald-600">{{ activeBuses }}</span>
                    <span class="stat-lbl">Active</span>
                </div>
                <div class="stat-pill">
                    <span class="stat-num text-blue-600">{{ withLocationCount }}</span>
                    <span class="stat-lbl">With location</span>
                </div>
                <div class="stat-pill">
                    <span class="stat-num text-slate-400">{{ buses.length - activeBuses }}</span>
                    <span class="stat-lbl">Offline</span>
                </div>
            </div>

            <!-- Toolbar -->
            <div class="toolbar">
                <div class="search-wrap">
                    <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
                    </svg>
                    <input v-model="search" type="text" placeholder="Search bus number…" class="search-input" />
                </div>
                <select v-model="filterRoute" class="filter-select">
                    <option value="">All Routes</option>
                    <option v-for="r in routes" :key="r" :value="r">{{ r }}</option>
                </select>
            </div>

            <!-- Table -->
            <div class="card">
                <div v-if="loading" class="empty-state">Loading live data…</div>
                <div v-else-if="filtered.length === 0" class="empty-state">No active buses found.</div>
                <div v-else class="table-wrap">
                    <table class="tbl">
                        <thead>
                            <tr>
                                <th>Bus</th>
                                <th>Status</th>
                                <th>Route</th>
                                <th>Current Stop</th>
                                <th>Coordinates</th>
                                <th>Last Seen</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="b in filtered" :key="b.bus_id">
                                <!-- Bus number -->
                                <td>
                                    <div class="bus-cell">
                                        <div class="bus-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                            </svg>
                                        </div>
                                        <span class="font-semibold">{{ b.bus_number }}</span>
                                    </div>
                                </td>

                                <!-- Status -->
                                <td>
                                    <span :class="statusColor(b.status)" class="badge">{{ b.status }}</span>
                                </td>

                                <!-- Route -->
                                <td>{{ b.route ?? '—' }}</td>

                                <!-- Current stop -->
                                <td>
                                    <div v-if="b.current_stop" class="stop-cell">
                                        <svg class="stop-pin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                        </svg>
                                        {{ b.current_stop }}
                                    </div>
                                    <span v-else class="text-slate-400">No stop data</span>
                                </td>

                                <!-- Coordinates -->
                                <td>
                                    <span v-if="b.last_log?.latitude && b.last_log?.longitude" class="coords">
                                        {{ Number(b.last_log.latitude).toFixed(5) }},
                                        {{ Number(b.last_log.longitude).toFixed(5) }}
                                    </span>
                                    <span v-else class="text-slate-400">—</span>
                                </td>

                                <!-- Last seen -->
                                <td>
                                    <span v-if="b.last_log?.logged_at" class="time-ago">
                                        {{ timeAgo(b.last_log.logged_at) }}
                                    </span>
                                    <span v-else class="text-slate-400">—</span>
                                </td>

                                <!-- Actions -->
                                <td>
                                    <div class="action-row">
                                        <a :href="`/buses/${b.bus_id}`" class="act act-view">View Bus</a>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Empty / no location note -->
            <p v-if="!loading && buses.length > 0 && withLocationCount === 0" class="hint">
                ℹ️ Buses are online but no GPS logs have been recorded yet.
                Location data appears once a driver app or GPS device posts to <code>/api/buses/{'{id}'}/logs</code>.
            </p>

        </div>
    </AuthenticatedLayout>
</template>

<style scoped>
.page-wrap   { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.page-title  { font-size: 22px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 10px; }
.page-sub    { font-size: 13px; color: #64748b; margin-top: 2px; }

.header-right    { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.updated-label   { font-size: 12.5px; color: #94a3b8; }
.updated-label strong { color: #475569; }

/* Pulsing live dot next to title */
.live-dot-inline {
    display: inline-block;
    width: 10px; height: 10px;
    background: #ef4444;
    border-radius: 50%;
    animation: pulse 1.5s infinite;
    flex-shrink: 0;
}

@keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.85); }
}

.btn-ghost   { padding: 8px 14px; background: #f1f5f9; border: none; border-radius: 10px; font-size: 13px; color: #475569; cursor: pointer; }
.btn-ghost:hover { background: #e2e8f0; }

/* Stats */
.stats-row   { display: flex; gap: 16px; flex-wrap: wrap; }
.stat-pill   { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 24px; display: flex; flex-direction: column; align-items: center; min-width: 90px; }
.stat-num    { font-size: 26px; font-weight: 800; color: #0f172a; }
.stat-lbl    { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: .6px; margin-top: 2px; }

/* Toolbar */
.toolbar     { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.search-wrap { position: relative; flex: 1; max-width: 280px; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #94a3b8; }
.search-input{ width: 100%; padding: 8px 12px 8px 34px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13.5px; outline: none; }
.search-input:focus { border-color: #1a56db; }
.filter-select{ padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13.5px; outline: none; color: #374151; }

/* Card + table */
.card        { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; }
.empty-state { padding: 48px; text-align: center; color: #94a3b8; font-size: 14px; }
.table-wrap  { overflow-x: auto; }
.tbl         { width: 100%; border-collapse: collapse; font-size: 13.5px; }
.tbl th      { padding: 10px 16px; text-align: left; font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .5px; border-bottom: 1px solid #f1f5f9; background: #fafbff; }
.tbl td      { padding: 13px 16px; color: #334155; border-bottom: 1px solid #f8fafc; }
.tbl tr:last-child td { border-bottom: none; }
.tbl tr:hover td { background: #fafbff; }

/* Bus cell */
.bus-cell    { display: flex; align-items: center; gap: 8px; }
.bus-icon    { width: 28px; height: 28px; background: #eff6ff; border-radius: 7px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #1a56db; }
.bus-icon svg{ width: 16px; height: 16px; }

/* Stop cell */
.stop-cell   { display: flex; align-items: center; gap: 5px; }
.stop-pin    { width: 14px; height: 14px; color: #ef4444; flex-shrink: 0; }

/* Coords */
.coords      { font-family: 'Courier New', monospace; font-size: 12px; color: #475569; background: #f8fafc; padding: 3px 6px; border-radius: 5px; white-space: nowrap; }

/* Time ago */
.time-ago    { font-size: 12.5px; color: #64748b; }

/* Badges */
.badge       { display: inline-block; padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 600; text-transform: capitalize; }
.badge-green { background: #dcfce7; color: #16a34a; }
.badge-grey  { background: #f1f5f9; color: #94a3b8; }
.badge-amber { background: #fef3c7; color: #d97706; }

/* Actions */
.action-row  { display: flex; gap: 6px; }
.act         { font-size: 12px; padding: 4px 10px; border-radius: 7px; font-weight: 500; text-decoration: none; border: none; cursor: pointer; }
.act-view    { background: #eff6ff; color: #1a56db; }
.act-view:hover { background: #dbeafe; }

/* Hint */
.hint        { font-size: 13px; color: #64748b; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; }
.hint code   { background: #e2e8f0; padding: 1px 5px; border-radius: 4px; font-size: 12px; }
</style>
