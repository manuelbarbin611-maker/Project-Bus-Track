<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link, usePage } from '@inertiajs/vue3';
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

// ── Permissions ────────────────────────────────────────────────────────────────
const page = usePage();
const can  = computed(() => page.props.auth.can);

// ── State ──────────────────────────────────────────────────────────────────────
const buses      = ref([]);
const passengers = ref([]);
const routes     = ref([]);
const recentLogs = ref([]);
const loading    = ref(true);

// ── Fetch all summary data ─────────────────────────────────────────────────────
onMounted(async () => {
    try {
        const requests = [
            axios.get('/buses'),
            axios.get('/routes'),
            axios.get('/live'),
        ];
        // Passengers are only for admin and operator
        if (can.value?.manageOperations) requests.push(axios.get('/passengers'));

        const [busRes, routeRes, liveRes, pasRes] = await Promise.all(requests);
        buses.value      = busRes.data.data   ?? [];
        routes.value     = routeRes.data.data ?? [];
        recentLogs.value = liveRes.data.data  ?? [];
        passengers.value = pasRes?.data.data  ?? [];
    } catch (e) {
        console.error('Dashboard fetch error', e);
    } finally {
        loading.value = false;
    }
});

// ── Computed stats ─────────────────────────────────────────────────────────────
const totalBuses       = computed(() => buses.value.length);
const activeBuses      = computed(() => buses.value.filter(b => b.status === 'active').length);
const maintenanceBuses = computed(() => buses.value.filter(b => b.status === 'maintenance').length);

const totalPassengers     = computed(() => passengers.value.length);
const waitingPassengers   = computed(() => passengers.value.filter(p => p.status === 'waiting').length);
const onboardedPassengers = computed(() => passengers.value.filter(p => p.status === 'onboarded').length);
const cancelledPassengers = computed(() => passengers.value.filter(p => p.status === 'cancelled').length);

const totalRoutes = computed(() => routes.value.length);

const busesWithLocation = computed(() => recentLogs.value.filter(b => b.last_log).length);

const recentPassengers = computed(() => [...passengers.value].slice(0, 5));
const recentBuses      = computed(() => [...buses.value].slice(0, 5));

// ── Helpers ────────────────────────────────────────────────────────────────────
const statusColor = s => ({
    active:      'bg-green-100 text-green-700',
    inactive:    'bg-slate-100 text-slate-400',
    maintenance: 'bg-amber-100 text-amber-600',
}[s] ?? 'bg-slate-100 text-slate-400');

const pasStatusColor = s => ({
    waiting:   'bg-blue-50 text-blue-700',
    onboarded: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-50 text-red-600',
}[s] ?? 'bg-slate-100 text-slate-400');

const timeAgo = (dateStr) => {
    if (!dateStr) return '—';
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60)   return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
};

const busOccupancyPct = (bus) => {
    if (!bus.capacity) return 0;
    const onboarded = passengers.value.filter(p => p.assigned_bus_id === bus.id && p.status === 'onboarded').length;
    return Math.round((onboarded / bus.capacity) * 100);
};
</script>

<template>
    <Head title="Dashboard" />
    <AuthenticatedLayout>
        <div class="max-w-[1200px] mx-auto flex flex-col gap-6">

            <!-- Page header -->
            <div class="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 class="text-[22px] font-bold text-slate-900">Dashboard</h1>
                    <p class="text-[13px] text-slate-500 mt-0.5">Fleet overview at a glance</p>
                </div>
                <div class="flex items-center gap-2.5">
                    <Link href="/tracking" class="flex items-center gap-1.5 text-[12.5px] font-semibold text-red-600 bg-red-50 border border-red-200 px-3.5 py-1.5 rounded-full no-underline hover:bg-red-100 transition-colors">
                        <span class="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                        Live Tracking
                    </Link>
                </div>
            </div>

            <!-- Loading -->
            <div v-if="loading" class="py-16 text-center text-slate-400 text-sm">Loading dashboard…</div>

            <template v-else>

                <!-- ── Top stat cards ──────────────────────────────── -->
                <div class="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">

                    <!-- Buses -->
                    <div class="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-3">
                        <div class="flex items-center gap-3.5">
                            <div class="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                                <svg class="w-[22px] h-[22px]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                </svg>
                            </div>
                            <div>
                                <p class="text-[12px] text-slate-400 uppercase tracking-wide font-semibold">Total Buses</p>
                                <p class="text-[32px] font-extrabold text-slate-900 leading-none mt-1">{{ totalBuses }}</p>
                            </div>
                        </div>
                        <div class="flex flex-wrap gap-1.5">
                            <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">{{ activeBuses }} active</span>
                            <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-600">{{ maintenanceBuses }} maintenance</span>
                            <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">{{ totalBuses - activeBuses - maintenanceBuses }} inactive</span>
                        </div>
                        <Link href="/buses" class="text-[12.5px] text-blue-700 no-underline font-medium mt-auto hover:underline">View all buses →</Link>
                    </div>

                    <!-- Passengers (admin + operator only) -->
                    <div v-if="can.manageOperations" class="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-3">
                        <div class="flex items-center gap-3.5">
                            <div class="w-11 h-11 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center shrink-0">
                                <svg class="w-[22px] h-[22px]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                </svg>
                            </div>
                            <div>
                                <p class="text-[12px] text-slate-400 uppercase tracking-wide font-semibold">Total Passengers</p>
                                <p class="text-[32px] font-extrabold text-slate-900 leading-none mt-1">{{ totalPassengers }}</p>
                            </div>
                        </div>
                        <div class="flex flex-wrap gap-1.5">
                            <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{{ waitingPassengers }} waiting</span>
                            <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">{{ onboardedPassengers }} onboarded</span>
                            <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600">{{ cancelledPassengers }} cancelled</span>
                        </div>
                        <Link href="/passengers" class="text-[12.5px] text-blue-700 no-underline font-medium mt-auto hover:underline">View all passengers →</Link>
                    </div>

                    <!-- Routes -->
                    <div class="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-3">
                        <div class="flex items-center gap-3.5">
                            <div class="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                                <svg class="w-[22px] h-[22px]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                                </svg>
                            </div>
                            <div>
                                <p class="text-[12px] text-slate-400 uppercase tracking-wide font-semibold">Active Routes</p>
                                <p class="text-[32px] font-extrabold text-slate-900 leading-none mt-1">{{ totalRoutes }}</p>
                            </div>
                        </div>
                        <div class="flex flex-wrap gap-1.5">
                            <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">
                                {{ routes.reduce((s, r) => s + (r.stops_count ?? 0), 0) }} total stops
                            </span>
                        </div>
                        <Link href="/routes" class="text-[12.5px] text-blue-700 no-underline font-medium mt-auto hover:underline">View all routes →</Link>
                    </div>

                    <!-- Live -->
                    <div class="bg-white border border-red-200 rounded-2xl p-5 flex flex-col gap-3">
                        <div class="flex items-center gap-3.5">
                            <div class="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                <svg class="w-[22px] h-[22px]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                                </svg>
                            </div>
                            <div>
                                <p class="text-[12px] text-slate-400 uppercase tracking-wide font-semibold">Live Buses</p>
                                <p class="text-[32px] font-extrabold text-slate-900 leading-none mt-1">{{ busesWithLocation }}</p>
                            </div>
                        </div>
                        <div class="flex flex-wrap gap-1.5">
                            <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">{{ activeBuses - busesWithLocation }} not reporting</span>
                        </div>
                        <Link href="/tracking" class="text-[12.5px] text-red-600 no-underline font-medium mt-auto hover:underline">Open live map →</Link>
                    </div>

                </div>

                <!-- ── Two-column section ──────────────────────────────── -->
                <div class="grid gap-4 max-md:grid-cols-1" :class="can.manageOperations ? 'grid-cols-2' : 'grid-cols-1'">

                    <!-- Recent buses -->
                    <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                            <h2 class="text-sm font-bold text-slate-900">Recent Buses</h2>
                            <Link href="/buses" class="text-[12.5px] text-blue-700 no-underline font-medium hover:underline">View all</Link>
                        </div>
                        <div v-if="recentBuses.length === 0" class="py-8 text-center text-slate-400 text-[13.5px]">No buses yet.</div>
                        <div v-else class="flex flex-col">
                            <div
                                v-for="b in recentBuses"
                                :key="b.id"
                                class="flex items-center gap-3 px-5 py-3 border-b border-slate-50 last:border-b-0 hover:bg-slate-50/60 transition-colors"
                            >
                                <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                    </svg>
                                </div>
                                <div class="flex-1 min-w-0 flex flex-col">
                                    <span class="text-[13.5px] font-semibold text-slate-900 truncate">{{ b.bus_number }}</span>
                                    <span class="text-[11.5px] text-slate-400 truncate">{{ b.route?.name ?? 'No route' }} · {{ b.current_stop?.stop_name ?? 'No stop' }}</span>
                                </div>
                                <div class="flex flex-col items-end gap-1.5 shrink-0">
                                    <span :class="statusColor(b.status)" class="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize whitespace-nowrap">{{ b.status }}</span>
                                    <div v-if="can.manageOperations" class="w-15 h-1 bg-slate-100 rounded-full overflow-hidden" :title="`${busOccupancyPct(b)}% full`">
                                        <div class="h-full bg-blue-600 rounded-full transition-all duration-300" :style="{ width: busOccupancyPct(b) + '%' }" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Recent passengers (admin + operator only) -->
                    <div v-if="can.manageOperations" class="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                            <h2 class="text-sm font-bold text-slate-900">Recent Passengers</h2>
                            <Link href="/passengers" class="text-[12.5px] text-blue-700 no-underline font-medium hover:underline">View all</Link>
                        </div>
                        <div v-if="recentPassengers.length === 0" class="py-8 text-center text-slate-400 text-[13.5px]">No passengers yet.</div>
                        <div v-else class="flex flex-col">
                            <div
                                v-for="p in recentPassengers"
                                :key="p.id"
                                class="flex items-center gap-3 px-5 py-3 border-b border-slate-50 last:border-b-0 hover:bg-slate-50/60 transition-colors"
                            >
                                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                                    {{ p.first_name?.charAt(0) }}{{ p.last_name?.charAt(0) }}
                                </div>
                                <div class="flex-1 min-w-0 flex flex-col">
                                    <span class="text-[13.5px] font-semibold text-slate-900 truncate">{{ p.first_name }} {{ p.last_name }}</span>
                                    <span class="text-[11.5px] text-slate-400 truncate">{{ p.assigned_bus?.bus_number ? `Bus ${p.assigned_bus.bus_number}` : 'Unassigned' }}</span>
                                </div>
                                <span :class="pasStatusColor(p.status)" class="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize whitespace-nowrap">{{ p.status }}</span>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- ── Routes overview ─────────────────────────────────── -->
                <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                        <h2 class="text-sm font-bold text-slate-900">Routes Overview</h2>
                        <Link href="/routes" class="text-[12.5px] text-blue-700 no-underline font-medium hover:underline">
                            {{ can.manageNetwork ? 'Manage routes' : 'View routes' }}
                        </Link>
                    </div>
                    <div v-if="routes.length === 0" class="py-8 text-center text-slate-400 text-[13.5px]">
                        No routes yet.
                        <Link v-if="can.manageNetwork" href="/routes/create" class="text-blue-700 no-underline font-medium hover:underline">Create one →</Link>
                    </div>
                    <div v-else class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-px bg-slate-100">
                        <Link
                            v-for="r in routes"
                            :key="r.id"
                            :href="`/routes/${r.id}`"
                            class="bg-white px-5 py-4 flex flex-col gap-2 no-underline hover:bg-slate-50/80 transition-colors"
                        >
                            <div class="flex items-center gap-2">
                                <div class="w-7 h-7 bg-emerald-50 rounded-[7px] flex items-center justify-center shrink-0 text-emerald-700">
                                    <svg class="w-[15px] h-[15px]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                                    </svg>
                                </div>
                                <span class="text-sm font-semibold text-slate-900">{{ r.name }}</span>
                            </div>
                            <div class="flex gap-2.5 text-xs text-slate-400">
                                <span>{{ r.stops_count ?? 0 }} stops</span>
                                <span>{{ r.buses_count ?? 0 }} buses</span>
                            </div>
                            <p v-if="r.description" class="text-xs text-slate-500 leading-snug m-0 truncate">{{ r.description }}</p>
                        </Link>
                    </div>
                </div>

                <!-- ── Live feed strip ─────────────────────────────────── -->
                <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                        <h2 class="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            <span class="inline-block w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                            Live Bus Feed
                        </h2>
                        <Link href="/tracking" class="text-[12.5px] text-red-600 no-underline font-medium hover:underline">Open full view →</Link>
                    </div>
                    <div v-if="recentLogs.length === 0" class="py-8 text-center text-slate-400 text-[13.5px]">No active buses reporting location.</div>
                    <div v-else class="overflow-x-auto">
                        <table class="w-full border-collapse text-[13.5px]">
                            <thead>
                                <tr>
                                    <th class="px-5 py-2.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100 bg-slate-50/70">Bus</th>
                                    <th class="px-5 py-2.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100 bg-slate-50/70">Route</th>
                                    <th class="px-5 py-2.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100 bg-slate-50/70">Current Stop</th>
                                    <th class="px-5 py-2.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100 bg-slate-50/70">Last Seen</th>
                                    <th class="px-5 py-2.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100 bg-slate-50/70">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="b in recentLogs" :key="b.bus_id" class="hover:bg-slate-50/60 transition-colors">
                                    <td class="px-5 py-3 text-slate-700 font-semibold border-b border-slate-50 last:border-b-0">{{ b.bus_number }}</td>
                                    <td class="px-5 py-3 text-slate-600 border-b border-slate-50">{{ b.route ?? '—' }}</td>
                                    <td class="px-5 py-3 text-slate-600 border-b border-slate-50">{{ b.current_stop ?? '—' }}</td>
                                    <td class="px-5 py-3 text-slate-400 text-sm border-b border-slate-50">{{ timeAgo(b.last_log?.logged_at) }}</td>
                                    <td class="px-5 py-3 border-b border-slate-50">
                                        <span :class="statusColor(b.status)" class="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize whitespace-nowrap">{{ b.status }}</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </template>
        </div>
    </AuthenticatedLayout>
</template>
