<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head } from '@inertiajs/vue3';
import { ref, onMounted } from 'vue';
import axios from 'axios';

const routes       = ref([]);
const loading      = ref(true);
const notification = ref(null);
const editing      = ref(null);
const editForm     = ref({ stop_name: '', latitude: '', longitude: '' });
const saving       = ref(false);

const notify = (type, message) => {
    notification.value = { type, message };
    setTimeout(() => notification.value = null, 3500);
};

onMounted(async () => {
    loading.value = true;
    try {
        const res = await axios.get('/routes');
        const routeList = res.data.data ?? [];
        const details = await Promise.all(routeList.map(r => axios.get(`/routes/${r.id}`)));
        routes.value = details.map(d => d.data.data);
    } catch { notify('error', 'Failed to load stops.'); }
    finally { loading.value = false; }
});

const startEdit = (stop) => {
    editing.value = stop.id;
    editForm.value = { stop_name: stop.stop_name, latitude: stop.latitude ?? '', longitude: stop.longitude ?? '' };
};

const saveStop = async (stop) => {
    saving.value = true;
    try {
        const res = await axios.put(`/stops/${stop.id}`, editForm.value);
        Object.assign(stop, res.data.data);
        editing.value = null;
        notify('success', 'Stop updated.');
    } catch { notify('error', 'Failed to update stop.'); }
    finally  { saving.value = false; }
};

const deleteStop = async (route, stop) => {
    if (!confirm(`Delete "${stop.stop_name}"?`)) return;
    try {
        await axios.delete(`/stops/${stop.id}`);
        route.stops = route.stops.filter(s => s.id !== stop.id);
        notify('success', 'Stop deleted.');
    } catch { notify('error', 'Failed to delete stop.'); }
};
</script>

<template>
    <Head title="Track Stops" />
    <AuthenticatedLayout>
        <div class="page-wrap">

            <Transition name="notif">
                <div v-if="notification" :class="notification.type === 'success' ? 'notif-success' : 'notif-error'" class="notif">
                    {{ notification.message }}
                </div>
            </Transition>

            <div class="page-header">
                <div>
                    <h1 class="page-title">Track Stops</h1>
                    <p class="page-sub">All stops grouped by route</p>
                </div>
                <a href="/routes" class="btn-ghost">Manage via Routes →</a>
            </div>

            <div v-if="loading" class="loading">Loading stops…</div>
            <div v-else-if="routes.length === 0" class="empty-global">No routes or stops found.</div>

            <div v-else v-for="route in routes" :key="route.id" class="card">
                <div class="card-header">
                    <div>
                        <h2 class="card-title">{{ route.name }}</h2>
                        <p class="card-sub">{{ route.stops?.length ?? 0 }} stops</p>
                    </div>
                    <a :href="`/routes/${route.id}`" class="act act-view">+ Add Stop</a>
                </div>

                <div v-if="!route.stops?.length" class="empty-state">No stops on this route.</div>

                <div v-else class="stops-list">
                    <div v-for="stop in route.stops" :key="stop.id" class="stop-row">
                        <!-- View mode -->
                        <template v-if="editing !== stop.id">
                            <div class="stop-order">{{ stop.stop_order }}</div>
                            <div class="stop-info">
                                <span class="stop-name">{{ stop.stop_name }}</span>
                                <span v-if="stop.latitude" class="stop-coords">{{ stop.latitude }}, {{ stop.longitude }}</span>
                            </div>
                            <div class="stop-actions">
                                <button @click="startEdit(stop)" class="act act-edit">Edit</button>
                                <button @click="deleteStop(route, stop)" class="act act-del">Delete</button>
                            </div>
                        </template>
                        <!-- Edit mode -->
                        <template v-else>
                            <div class="stop-order">{{ stop.stop_order }}</div>
                            <div class="stop-edit-row">
                                <input v-model="editForm.stop_name" class="input" style="flex:2" />
                                <input v-model="editForm.latitude"  type="number" step="any" class="input" placeholder="Lat" style="flex:1" />
                                <input v-model="editForm.longitude" type="number" step="any" class="input" placeholder="Lng" style="flex:1" />
                                <button @click="saveStop(stop)" :disabled="saving" class="btn-primary">{{ saving ? '…' : 'Save' }}</button>
                                <button @click="editing = null" class="act act-edit">Cancel</button>
                            </div>
                        </template>
                    </div>
                </div>
            </div>

        </div>
    </AuthenticatedLayout>
</template>

<style scoped>
.page-wrap   { max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.page-title  { font-size: 22px; font-weight: 700; color: #0f172a; }
.page-sub    { font-size: 13px; color: #64748b; margin-top: 2px; }
.loading     { text-align: center; color: #94a3b8; padding: 48px; animation: pulse 1.5s infinite; }
@keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
.empty-global{ text-align: center; color: #94a3b8; padding: 48px; }
.btn-ghost   { padding: 8px 14px; background: #f1f5f9; border: none; border-radius: 10px; font-size: 13px; color: #475569; cursor: pointer; text-decoration: none; }
.btn-ghost:hover { background: #e2e8f0; }

.card        { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; }
.card-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid #f1f5f9; gap: 12px; }
.card-title  { font-size: 15px; font-weight: 700; color: #0f172a; }
.card-sub    { font-size: 12px; color: #94a3b8; margin-top: 2px; }

.empty-state { padding: 24px 20px; color: #94a3b8; font-size: 13.5px; }
.stops-list  { display: flex; flex-direction: column; }
.stop-row    { display: flex; align-items: center; gap: 12px; padding: 12px 20px; border-bottom: 1px solid #f8fafc; }
.stop-row:last-child { border-bottom: none; }
.stop-row:hover { background: #fafbff; }
.stop-order  { width: 28px; height: 28px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #1a56db; flex-shrink: 0; }
.stop-info   { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.stop-name   { font-size: 13.5px; font-weight: 500; color: #1e293b; }
.stop-coords { font-size: 11px; color: #94a3b8; }
.stop-actions{ display: flex; gap: 6px; }
.stop-edit-row{ flex: 1; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.input       { padding: 7px 10px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; outline: none; }
.input:focus { border-color: #1a56db; }
.btn-primary { padding: 7px 14px; background: #1a56db; color: #fff; border: none; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap; }
.btn-primary:disabled { opacity: .5; cursor: not-allowed; }
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
