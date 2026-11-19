<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, usePage } from '@inertiajs/vue3';
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const page = usePage();
const can  = computed(() => page.props.auth.can);

const buses        = ref([]);
const loading      = ref(true);
const search       = ref('');
const filterStatus = ref('');
const notification = ref(null);

const notify = (type, message) => {
    notification.value = { type, message };
    setTimeout(() => notification.value = null, 3500);
};

const fetchBuses = async () => {
    loading.value = true;
    try {
        const res = await axios.get('/buses');
        buses.value = res.data.data ?? [];
    } catch { notify('error', 'Failed to load buses.'); }
    finally  { loading.value = false; }
};

onMounted(fetchBuses);

const filtered = computed(() => {
    return buses.value.filter(b => {
        const matchStatus = !filterStatus.value || b.status === filterStatus.value;
        const matchSearch = !search.value || b.bus_number?.toLowerCase().includes(search.value.toLowerCase());
        return matchStatus && matchSearch;
    });
});

const statusColor = (s) => ({
    active:      'badge-green',
    inactive:    'badge-grey',
    maintenance: 'badge-amber',
}[s] ?? 'badge-grey');

const deleteBus = async (bus) => {
    if (!confirm(`Delete bus ${bus.bus_number}?`)) return;
    try {
        await axios.delete(`/buses/${bus.id}`);
        buses.value = buses.value.filter(b => b.id !== bus.id);
        notify('success', 'Bus deleted.');
    } catch (e) {
        notify('error', e.response?.status === 403
            ? 'You do not have permission to delete buses.'
            : 'Failed to delete bus.');
    }
};
</script>

<template>
    <Head title="Buses" />
    <AuthenticatedLayout>
        <div class="page-wrap">

            <Transition name="notif">
                <div v-if="notification" :class="notification.type === 'success' ? 'notif-success' : 'notif-error'" class="notif">
                    {{ notification.message }}
                </div>
            </Transition>

            <div class="page-header">
                <div>
                    <h1 class="page-title">Buses</h1>
                    <p class="page-sub">{{ can.manageOperations ? 'Manage your fleet of buses' : 'View the fleet of buses' }}</p>
                </div>
                <a v-if="can.manageOperations" href="/buses/create" class="btn-primary">+ New Bus</a>
            </div>

            <!-- Stats -->
            <div class="stats-row">
                <div class="stat-pill"><span class="stat-num">{{ buses.length }}</span><span class="stat-lbl">Total</span></div>
                <div class="stat-pill"><span class="stat-num text-emerald-600">{{ buses.filter(b=>b.status==='active').length }}</span><span class="stat-lbl">Active</span></div>
                <div class="stat-pill"><span class="stat-num text-amber-500">{{ buses.filter(b=>b.status==='maintenance').length }}</span><span class="stat-lbl">Maintenance</span></div>
                <div class="stat-pill"><span class="stat-num text-slate-400">{{ buses.filter(b=>b.status==='inactive').length }}</span><span class="stat-lbl">Inactive</span></div>
            </div>

            <!-- Toolbar -->
            <div class="toolbar">
                <div class="search-wrap">
                    <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
                    </svg>
                    <input v-model="search" type="text" placeholder="Search bus number…" class="search-input" />
                </div>
                <select v-model="filterStatus" class="filter-select">
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                </select>
                <button @click="fetchBuses" class="btn-ghost">↻ Refresh</button>
            </div>

            <!-- Table -->
            <div class="card">
                <div v-if="loading" class="empty-state">Loading…</div>
                <div v-else-if="filtered.length === 0" class="empty-state">No buses found.</div>
                <div v-else class="table-wrap">
                    <table class="tbl">
                        <thead>
                            <tr>
                                <th>Bus Number</th>
                                <th>Route</th>
                                <th>Current Stop</th>
                                <th>Capacity</th>
                                <th>Available</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="b in filtered" :key="b.id">
                                <td class="font-semibold">{{ b.bus_number }}</td>
                                <td>{{ b.route?.name ?? '—' }}</td>
                                <td>{{ b.current_stop?.stop_name ?? '—' }}</td>
                                <td>{{ b.capacity ?? '—' }}</td>
                                <td>{{ b.available_seats ?? '—' }}</td>
                                <td><span :class="statusColor(b.status)" class="badge">{{ b.status }}</span></td>
                                <td>
                                    <div class="action-row">
                                        <a :href="`/buses/${b.id}`" class="act act-view">View</a>
                                        <a v-if="can.manageOperations" :href="`/buses/${b.id}/edit`" class="act act-edit">Edit</a>
                                        <button v-if="can.manageOperations" @click="deleteBus(b)" class="act act-del">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>

<style scoped>
.page-wrap   { max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.page-title  { font-size: 22px; font-weight: 700; color: #0f172a; }
.page-sub    { font-size: 13px; color: #64748b; margin-top: 2px; }
.btn-primary { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; background: #1a56db; color: #fff; border-radius: 10px; font-size: 13.5px; font-weight: 600; text-decoration: none; }
.btn-primary:hover { background: #1e429f; }

.stats-row   { display: flex; gap: 16px; flex-wrap: wrap; }
.stat-pill   { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 24px; display: flex; flex-direction: column; align-items: center; min-width: 90px; }
.stat-num    { font-size: 26px; font-weight: 800; color: #0f172a; }
.stat-lbl    { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: .6px; margin-top: 2px; }

.toolbar     { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.search-wrap { position: relative; flex: 1; max-width: 280px; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #94a3b8; }
.search-input{ width: 100%; padding: 8px 12px 8px 34px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13.5px; outline: none; }
.search-input:focus { border-color: #1a56db; }
.filter-select{ padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13.5px; outline: none; color: #374151; }
.btn-ghost   { padding: 8px 14px; background: #f1f5f9; border: none; border-radius: 10px; font-size: 13px; color: #475569; cursor: pointer; }
.btn-ghost:hover { background: #e2e8f0; }

.card        { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; }
.empty-state { padding: 48px; text-align: center; color: #94a3b8; font-size: 14px; }
.table-wrap  { overflow-x: auto; }
.tbl         { width: 100%; border-collapse: collapse; font-size: 13.5px; }
.tbl th      { padding: 10px 16px; text-align: left; font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .5px; border-bottom: 1px solid #f1f5f9; background: #fafbff; }
.tbl td      { padding: 13px 16px; color: #334155; border-bottom: 1px solid #f8fafc; }
.tbl tr:last-child td { border-bottom: none; }
.tbl tr:hover td { background: #fafbff; }

.badge       { display: inline-block; padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 600; text-transform: capitalize; }
.badge-green { background: #dcfce7; color: #16a34a; }
.badge-grey  { background: #f1f5f9; color: #94a3b8; }
.badge-amber { background: #fef3c7; color: #d97706; }

.action-row  { display: flex; gap: 6px; }
.act         { font-size: 12px; padding: 4px 10px; border-radius: 7px; font-weight: 500; text-decoration: none; border: none; cursor: pointer; }
.act-view    { background: #eff6ff; color: #1a56db; } .act-view:hover { background: #dbeafe; }
.act-edit    { background: #f1f5f9; color: #475569; } .act-edit:hover { background: #e2e8f0; }
.act-del     { background: #fff5f5; color: #dc2626; } .act-del:hover { background: #fee2e2; }

.notif        { padding: 12px 16px; border-radius: 10px; font-size: 13.5px; border: 1px solid; }
.notif-success{ background: #f0fdf4; border-color: #bbf7d0; color: #15803d; }
.notif-error  { background: #fff5f5; border-color: #fecaca; color: #dc2626; }
.notif-enter-active, .notif-leave-active { transition: opacity .3s, transform .3s; }
.notif-enter-from, .notif-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
