<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, usePage } from '@inertiajs/vue3';
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const props = defineProps({ busId: [String, Number] });

const page = usePage();
const can  = computed(() => page.props.auth.can);

const bus          = ref(null);
const queue        = ref([]);
const passengers   = ref([]);
const loading      = ref(true);
const loadError    = ref(null);
const notification = ref(null);
const newStatus    = ref('');
const changingStatus = ref(false);
const selectedPassenger = ref('');
const addingToQueue = ref(false);

const notify = (type, message) => {
    notification.value = { type, message };
    setTimeout(() => notification.value = null, 3500);
};

const fetchAll = async () => {
    loading.value = true;
    loadError.value = null;
    try {
        // 1) The bus itself: everyone can view it
        const busRes = await axios.get(`/buses/${props.busId}`);
        bus.value       = busRes.data.data;
        newStatus.value = bus.value.status;
    } catch (e) {
        loadError.value = e.response?.status === 404
            ? 'This bus was not found.'
            : 'Failed to load this bus.';
        loading.value = false;
        return;
    }

    // 2) Queue and passengers: admin and operator only
    if (can.value?.manageOperations) {
        try {
            const [queueRes, passRes] = await Promise.all([
                axios.get(`/buses/${props.busId}/queue`),
                axios.get('/passengers?status=waiting'),
            ]);
            queue.value      = queueRes.data.data ?? [];
            passengers.value = passRes.data.data ?? [];
        } catch {
            notify('error', 'Failed to load the passenger queue.');
        }
    }

    loading.value = false;
};

onMounted(fetchAll);

const changeStatus = async () => {
    changingStatus.value = true;
    try {
        await axios.patch(`/buses/${props.busId}/status`, { status: newStatus.value });
        bus.value.status = newStatus.value;
        notify('success', `Status updated to ${newStatus.value}.`);
    } catch (e) {
        notify('error', e.response?.status === 403
            ? 'You do not have permission to change the status.'
            : 'Failed to update status.');
    }
    finally  { changingStatus.value = false; }
};

const addToQueue = async () => {
    if (!selectedPassenger.value) return;
    addingToQueue.value = true;
    try {
        const res = await axios.post(`/buses/${props.busId}/queue`, { passenger_id: selectedPassenger.value });
        queue.value.push(res.data.data);
        selectedPassenger.value = '';
        notify('success', 'Passenger added to queue.');
    } catch (e) {
        notify('error', e.response?.data?.message ?? 'Failed to add to queue.');
    } finally { addingToQueue.value = false; }
};

const removeFromQueue = async (passenger) => {
    try {
        await axios.delete(`/buses/${props.busId}/queue/${passenger.id}`);
        queue.value = queue.value.filter(q => q.passenger_id !== passenger.id);
        notify('success', 'Removed from queue.');
    } catch { notify('error', 'Failed to remove.'); }
};

const board = async (passenger) => {
    try {
        await axios.patch(`/buses/${props.busId}/queue/${passenger.id}/board`);
        queue.value = queue.value.filter(q => q.passenger_id !== passenger.id);
        bus.value.available_seats = Math.max(0, (bus.value.available_seats ?? 1) - 1);
        notify('success', `${passenger.first_name} boarded.`);
    } catch (e) {
        notify('error', e.response?.data?.message ?? 'Failed to board.');
    }
};

const statusColor = (s) => ({
    active:      'badge-green',
    inactive:    'badge-grey',
    maintenance: 'badge-amber',
}[s] ?? 'badge-grey');

// Passengers not already in queue
const availablePassengers = () => {
    const inQueue = new Set(queue.value.map(q => q.passenger_id));
    return passengers.value.filter(p => !inQueue.has(p.id));
};
</script>

<template>
    <Head :title="bus ? `Bus ${bus.bus_number}` : 'Bus'" />
    <AuthenticatedLayout>
        <div class="page-wrap">

            <Transition name="notif">
                <div v-if="notification" :class="notification.type === 'success' ? 'notif-success' : 'notif-error'" class="notif">
                    {{ notification.message }}
                </div>
            </Transition>

            <div class="breadcrumb">
                <a href="/buses" class="bc-link">← Buses</a>
                <span class="bc-sep">/</span>
                <span class="bc-current">{{ bus?.bus_number ?? '…' }}</span>
            </div>

            <div v-if="loading" class="loading">Loading…</div>
            <div v-else-if="loadError" class="notif notif-error">{{ loadError }}</div>

            <template v-else-if="bus">
                <!-- Info card -->
                <div class="card">
                    <div class="bus-hero">
                        <div>
                            <div class="bus-icon">🚌</div>
                            <h1 class="page-title">Bus {{ bus.bus_number }}</h1>
                            <div class="meta-row">
                                <span :class="statusColor(bus.status)" class="badge">{{ bus.status }}</span>
                                <span class="meta-chip">{{ bus.route?.name ?? 'No route' }}</span>
                                <span class="meta-chip">{{ bus.available_seats ?? '?' }} / {{ bus.capacity }} seats</span>
                            </div>
                            <p v-if="bus.current_stop" class="current-stop">📍 {{ bus.current_stop.stop_name }}</p>
                        </div>
                        <a v-if="can.manageOperations" :href="`/buses/${busId}/edit`" class="btn-edit">Edit Bus</a>
                    </div>

                    <!-- Status change (admin + operator only) -->
                    <div v-if="can.manageOperations" class="status-row">
                        <label class="label">Change Status</label>
                        <div class="status-controls">
                            <select v-model="newStatus" class="input-sm">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                            <button @click="changeStatus" :disabled="changingStatus || newStatus === bus.status" class="btn-primary-sm">
                                {{ changingStatus ? '…' : 'Apply' }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Queue (admin + operator only) -->
                <div v-if="can.manageOperations" class="card">
                    <div class="card-header">
                        <h2 class="card-title">Passenger Queue</h2>
                        <span class="count-chip">{{ queue.length }} waiting</span>
                    </div>

                    <!-- Add to queue -->
                    <div class="add-queue-row">
                        <select v-model="selectedPassenger" class="input" style="flex:1">
                            <option value="">— Select waiting passenger —</option>
                            <option v-for="p in availablePassengers()" :key="p.id" :value="p.id">
                                {{ p.first_name }} {{ p.last_name }}
                            </option>
                        </select>
                        <button @click="addToQueue" :disabled="addingToQueue || !selectedPassenger" class="btn-primary">
                            {{ addingToQueue ? '…' : 'Add to Queue' }}
                        </button>
                    </div>

                    <div v-if="queue.length === 0" class="empty-state">Queue is empty.</div>
                    <div v-else class="queue-list">
                        <div v-for="(entry, idx) in queue" :key="entry.id" class="queue-row">
                            <div class="queue-order">#{{ idx + 1 }}</div>
                            <div class="queue-info">
                                <span class="queue-name">{{ entry.passenger?.first_name }} {{ entry.passenger?.last_name }}</span>
                            </div>
                            <div class="queue-actions">
                                <button @click="board(entry.passenger)" class="act act-board" :disabled="(bus.available_seats ?? 0) <= 0">
                                    ✓ Board
                                </button>
                                <button @click="removeFromQueue(entry.passenger)" class="act act-del">Remove</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Onboarded passengers (admin + operator only) -->
                <div v-if="can.manageOperations && bus.passengers?.filter(p => p.status === 'onboarded').length" class="card">
                    <div class="card-header">
                        <h2 class="card-title">Onboarded Passengers</h2>
                        <span class="count-chip">{{ bus.passengers.filter(p=>p.status==='onboarded').length }}</span>
                    </div>
                    <div class="table-wrap">
                        <table class="tbl">
                            <thead><tr><th>Name</th><th>Status</th><th></th></tr></thead>
                            <tbody>
                                <tr v-for="p in bus.passengers.filter(p=>p.status==='onboarded')" :key="p.id">
                                    <td>{{ p.first_name }} {{ p.last_name }}</td>
                                    <td><span class="badge badge-green">Onboarded</span></td>
                                    <td><a :href="`/passengers/${p.id}`" class="act act-view">View</a></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </template>
        </div>
    </AuthenticatedLayout>
</template>

<style scoped>
.page-wrap   { max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
.breadcrumb  { display: flex; align-items: center; gap: 8px; font-size: 13.5px; }
.bc-link     { color: #64748b; text-decoration: none; } .bc-link:hover { color: #0f172a; }
.bc-sep      { color: #cbd5e1; }
.bc-current  { color: #0f172a; font-weight: 500; }
.loading     { text-align: center; color: #94a3b8; padding: 48px; }

.card        { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; }
.card-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid #f1f5f9; }
.card-title  { font-size: 15px; font-weight: 700; color: #0f172a; }
.count-chip  { background: #eff6ff; color: #1a56db; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 99px; }

.bus-hero    { display: flex; align-items: flex-start; justify-content: space-between; padding: 24px; gap: 16px; flex-wrap: wrap; }
.bus-icon    { font-size: 28px; margin-bottom: 6px; }
.page-title  { font-size: 22px; font-weight: 700; color: #0f172a; }
.meta-row    { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
.badge       { display: inline-block; padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 600; text-transform: capitalize; }
.badge-green { background: #dcfce7; color: #16a34a; }
.badge-grey  { background: #f1f5f9; color: #94a3b8; }
.badge-amber { background: #fef3c7; color: #d97706; }
.meta-chip   { background: #f1f5f9; color: #475569; font-size: 12px; font-weight: 500; padding: 4px 12px; border-radius: 99px; }
.current-stop{ font-size: 13px; color: #64748b; margin-top: 8px; }
.btn-edit    { padding: 8px 16px; background: #eff6ff; color: #1a56db; border-radius: 10px; font-size: 13px; font-weight: 600; text-decoration: none; }
.btn-edit:hover { background: #dbeafe; }

.status-row  { display: flex; align-items: center; gap: 12px; padding: 12px 24px; border-top: 1px solid #f1f5f9; }
.label       { font-size: 13px; font-weight: 500; color: #64748b; }
.status-controls { display: flex; gap: 8px; }
.input-sm    { padding: 6px 10px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; outline: none; }
.btn-primary-sm { padding: 6px 14px; background: #1a56db; color: #fff; border: none; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }
.btn-primary-sm:disabled { opacity: .5; cursor: not-allowed; }

.add-queue-row{ display: flex; gap: 10px; padding: 14px 20px; border-bottom: 1px solid #f1f5f9; }
.input       { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 9px; font-size: 13px; outline: none; }
.input:focus { border-color: #1a56db; }
.btn-primary { padding: 8px 16px; background: #1a56db; color: #fff; border: none; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; }
.btn-primary:disabled { opacity: .5; cursor: not-allowed; }

.empty-state { padding: 32px; text-align: center; color: #94a3b8; font-size: 14px; }
.queue-list  { display: flex; flex-direction: column; }
.queue-row   { display: flex; align-items: center; gap: 12px; padding: 12px 20px; border-bottom: 1px solid #f8fafc; }
.queue-row:last-child { border-bottom: none; }
.queue-row:hover { background: #fafbff; }
.queue-order { width: 28px; height: 28px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #1a56db; flex-shrink: 0; }
.queue-info  { flex: 1; }
.queue-name  { font-size: 13.5px; font-weight: 500; color: #1e293b; }
.queue-actions{ display: flex; gap: 6px; }

.act         { font-size: 12px; padding: 4px 10px; border-radius: 7px; font-weight: 500; text-decoration: none; border: none; cursor: pointer; }
.act-view    { background: #eff6ff; color: #1a56db; } .act-view:hover { background: #dbeafe; }
.act-board   { background: #f0fdf4; color: #16a34a; } .act-board:hover:not(:disabled) { background: #dcfce7; }
.act-board:disabled { opacity: .5; cursor: not-allowed; }
.act-del     { background: #fff5f5; color: #dc2626; } .act-del:hover { background: #fee2e2; }

.table-wrap  { overflow-x: auto; }
.tbl         { width: 100%; border-collapse: collapse; font-size: 13.5px; }
.tbl th      { padding: 10px 16px; text-align: left; font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .5px; border-bottom: 1px solid #f1f5f9; }
.tbl td      { padding: 12px 16px; color: #334155; border-bottom: 1px solid #f8fafc; }
.tbl tr:last-child td { border-bottom: none; }

.notif        { padding: 12px 16px; border-radius: 10px; font-size: 13.5px; border: 1px solid; }
.notif-success{ background: #f0fdf4; border-color: #bbf7d0; color: #15803d; }
.notif-error  { background: #fff5f5; border-color: #fecaca; color: #dc2626; }
.notif-enter-active, .notif-leave-active { transition: opacity .3s, transform .3s; }
.notif-enter-from, .notif-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
