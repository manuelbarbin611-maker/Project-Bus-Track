<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head } from '@inertiajs/vue3';
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const passengers   = ref([]);
const loading      = ref(true);
const search       = ref('');
const filterStatus = ref('');
const notification = ref(null);

const notify = (type, message) => {
    notification.value = { type, message };
    setTimeout(() => notification.value = null, 3500);
};

const fetchPassengers = async () => {
    loading.value = true;
    try {
        const res = await axios.get('/passengers');
        passengers.value = res.data.data ?? [];
    } catch (e) {
        notify('error' , e.response?.status === 403
            ? 'You do not have permission to view passengers.'
            : 'Failed to load passengers.')
    }
    finally  { loading.value = false; }
};

onMounted(fetchPassengers);

const filtered = computed(() => {
    return passengers.value.filter(p => {
        const matchStatus = !filterStatus.value || p.status === filterStatus.value;
        const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
        const matchSearch = !search.value || fullName.includes(search.value.toLowerCase());
        return matchStatus && matchSearch;
    });
});

const statusColor = (s) => ({
    waiting:   'badge-amber',
    onboarded: 'badge-green',
    cancelled: 'badge-red',
}[s] ?? 'badge-grey');

const deletePassenger = async (p) => {
    if (!confirm(`Delete ${p.first_name} ${p.last_name}?`)) return;
    try {
        await axios.delete(`/passengers/${p.id}`);
        passengers.value = passengers.value.filter(x => x.id !== p.id);
        notify('success', 'Passenger deleted.');
    } catch (e) {
        notify('error', e.response?.status === 403
            ? 'You do not have permission to delete passengers.'
            : 'Failed to delete passenger.');
    }
};
</script>

<template>
    <Head title="Passengers" />
    <AuthenticatedLayout>
        <div class="page-wrap">

            <Transition name="notif">
                <div v-if="notification" :class="notification.type === 'success' ? 'notif-success' : 'notif-error'" class="notif">
                    {{ notification.message }}
                </div>
            </Transition>

            <div class="page-header">
                <div>
                    <h1 class="page-title">Passengers</h1>
                    <p class="page-sub">Manage all registered passengers</p>
                </div>
                <a href="/passengers/create" class="btn-primary">+ New Passenger</a>
            </div>

            <!-- Stats -->
            <div class="stats-row">
                <div class="stat-pill"><span class="stat-num">{{ passengers.length }}</span><span class="stat-lbl">Total</span></div>
                <div class="stat-pill"><span class="stat-num text-amber-500">{{ passengers.filter(p=>p.status==='waiting').length }}</span><span class="stat-lbl">Waiting</span></div>
                <div class="stat-pill"><span class="stat-num text-emerald-600">{{ passengers.filter(p=>p.status==='onboarded').length }}</span><span class="stat-lbl">Onboarded</span></div>
                <div class="stat-pill"><span class="stat-num text-red-500">{{ passengers.filter(p=>p.status==='cancelled').length }}</span><span class="stat-lbl">Cancelled</span></div>
            </div>

            <!-- Toolbar -->
            <div class="toolbar">
                <div class="search-wrap">
                    <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
                    </svg>
                    <input v-model="search" type="text" placeholder="Search passengers…" class="search-input" />
                </div>
                <select v-model="filterStatus" class="filter-select">
                    <option value="">All Status</option>
                    <option value="waiting">Waiting</option>
                    <option value="onboarded">Onboarded</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                <button @click="fetchPassengers" class="btn-ghost">↻ Refresh</button>
            </div>

            <!-- Table -->
            <div class="card">
                <div v-if="loading" class="empty-state">Loading…</div>
                <div v-else-if="filtered.length === 0" class="empty-state">No passengers found.</div>
                <div v-else class="table-wrap">
                    <table class="tbl">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Status</th>
                                <th>Assigned Bus</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="p in filtered" :key="p.id">
                                <td>
                                    <div class="font-semibold text-slate-800">{{ p.first_name }} {{ p.last_name }}</div>
                                    <div class="text-xs text-slate-400">#{{ p.id }}</div>
                                </td>
                                <td><span :class="statusColor(p.status)" class="badge">{{ p.status }}</span></td>
                                <td>{{ p.assigned_bus?.bus_number ?? '—' }}</td>
                                <td>
                                    <div class="action-row">
                                        <a :href="`/passengers/${p.id}`"      class="act act-view">View</a>
                                        <a :href="`/passengers/${p.id}/edit`" class="act act-edit">Edit</a>
                                        <button @click="deletePassenger(p)"   class="act act-del">Delete</button>
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
.page-wrap   { max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
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
.badge-amber { background: #fef3c7; color: #d97706; }
.badge-red   { background: #fff5f5; color: #dc2626; }
.badge-grey  { background: #f1f5f9; color: #94a3b8; }
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
