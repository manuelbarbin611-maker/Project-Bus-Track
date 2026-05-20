<script setup>
import { ref, computed, onMounted } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import axios from 'axios';

// ── State ──────────────────────────────────────────────────────────────────
const routes     = ref([]);
const loading    = ref(true);
const search     = ref('');
const deleting   = ref(null);
const showConfirm = ref(false);
const deleteTarget = ref(null);
const error      = ref(null);

// ── Fetch ──────────────────────────────────────────────────────────────────
async function fetchRoutes() {
    loading.value = true;
    error.value   = null;
    try {
        const { data } = await axios.get('/routes');
        routes.value = Array.isArray(data.data) ? data.data : [];
    } catch (e) {
        error.value = 'Failed to load routes. Please try again.';
    } finally {
        loading.value = false;
    }
}

onMounted(fetchRoutes);

// ── Computed ───────────────────────────────────────────────────────────────
const filtered = computed(() => {
    const q = search.value.toLowerCase().trim();
    if (!q) return routes.value;
    return routes.value.filter(r =>
        r.name?.toLowerCase().includes(q) ||
        r.code?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
    );
});

const stats = computed(() => ({
    total:  routes.value.length,
    active: routes.value.filter(r => r.status === 'active').length,
    stops:  routes.value.reduce((acc, r) => acc + (r.stops_count ?? 0), 0),
}));

// ── Delete ─────────────────────────────────────────────────────────────────
function confirmDelete(route) {
    deleteTarget.value = route;
    showConfirm.value  = true;
}

async function doDelete() {
    if (!deleteTarget.value) return;
    deleting.value = deleteTarget.value.id;
    showConfirm.value = false;
    try {
        await axios.delete(`/routes/${deleteTarget.value.id}`);
        routes.value = routes.value.filter(r => r.id !== deleteTarget.value.id);
    } catch {
        error.value = 'Could not delete route.';
    } finally {
        deleting.value    = null;
        deleteTarget.value = null;
    }
}

// ── Helpers ────────────────────────────────────────────────────────────────
function statusClass(status) {
    return {
        active:   'ri-badge ri-badge--green',
        inactive: 'ri-badge ri-badge--gray',
        draft:    'ri-badge ri-badge--yellow',
    }[status] ?? 'ri-badge ri-badge--gray';
}
</script>

<template>
    <AuthenticatedLayout>
        <template #header>Routes</template>

        <div class="ri-page">

            <!-- ── Page heading ─────────────────────────────────────────── -->
            <div class="ri-heading">
                <div>
                    <h1 class="ri-title">Bus Routes</h1>
                    <p class="ri-subtitle">Manage all transit routes and their stops</p>
                </div>
                <Link :href="route('routes.create')" class="ri-btn ri-btn--primary">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"/>
                    </svg>
                    New Route
                </Link>
            </div>

            <!-- ── Stats strip ──────────────────────────────────────────── -->
            <div class="ri-stats">
                <div class="ri-stat">
                    <span class="ri-stat-value">{{ stats.total }}</span>
                    <span class="ri-stat-label">Total Routes</span>
                </div>
                <div class="ri-stat-divider" />
                <div class="ri-stat">
                    <span class="ri-stat-value ri-stat-value--green">{{ stats.active }}</span>
                    <span class="ri-stat-label">Active</span>
                </div>
                <div class="ri-stat-divider" />
                <div class="ri-stat">
                    <span class="ri-stat-value">{{ stats.stops }}</span>
                    <span class="ri-stat-label">Total Stops</span>
                </div>
            </div>

            <!-- ── Toolbar ──────────────────────────────────────────────── -->
            <div class="ri-toolbar">
                <div class="ri-search-wrap">
                    <svg class="ri-search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd"/>
                    </svg>
                    <input
                        v-model="search"
                        class="ri-search"
                        type="text"
                        placeholder="Search routes…"
                    />
                </div>
                <button class="ri-btn ri-btn--ghost" @click="fetchRoutes">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.389zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clip-rule="evenodd"/>
                    </svg>
                    Refresh
                </button>
            </div>

            <!-- ── Error ────────────────────────────────────────────────── -->
            <div v-if="error" class="ri-error">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
                </svg>
                {{ error }}
                <button class="ri-error-close" @click="error = null">✕</button>
            </div>

            <!-- ── Loading skeleton ─────────────────────────────────────── -->
            <div v-if="loading" class="ri-table-wrap">
                <table class="ri-table">
                    <thead>
                        <tr>
                            <th>Route</th><th>Code</th><th>Stops</th><th>Status</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="i in 5" :key="i" class="ri-skeleton-row">
                            <td><div class="ri-skeleton ri-skeleton--w60" /></td>
                            <td><div class="ri-skeleton ri-skeleton--w24" /></td>
                            <td><div class="ri-skeleton ri-skeleton--w16" /></td>
                            <td><div class="ri-skeleton ri-skeleton--w20" /></td>
                            <td><div class="ri-skeleton ri-skeleton--w28" /></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- ── Empty state ──────────────────────────────────────────── -->
            <div v-else-if="!loading && filtered.length === 0" class="ri-empty">
                <div class="ri-empty-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"/>
                    </svg>
                </div>
                <h3 class="ri-empty-title">
                    {{ search ? 'No routes match your search' : 'No routes yet' }}
                </h3>
                <p class="ri-empty-text">
                    {{ search ? 'Try a different keyword.' : 'Create your first bus route to get started.' }}
                </p>
                <Link v-if="!search" :href="route('routes.create')" class="ri-btn ri-btn--primary">
                    Create Route
                </Link>
            </div>

            <!-- ── Table ────────────────────────────────────────────────── -->
            <div v-else class="ri-table-wrap">
                <table class="ri-table">
                    <thead>
                        <tr>
                            <th>Route Name</th>
                            <th>Code</th>
                            <th>Description</th>
                            <th>Stops</th>
                            <th>Status</th>
                            <th class="ri-th--right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="(r, i) in filtered"
                            :key="r.id"
                            class="ri-row"
                            :style="{ animationDelay: `${i * 40}ms` }"
                        >
                            <!-- Name -->
                            <td>
                                <Link :href="route('routes.show', r.id)" class="ri-route-name">
                                    <span class="ri-route-dot" />
                                    {{ r.name }}
                                </Link>
                            </td>

                            <!-- Code -->
                            <td>
                                <span class="ri-code-chip">{{ r.code ?? '—' }}</span>
                            </td>

                            <!-- Description -->
                            <td class="ri-desc">
                                {{ r.description ?? '—' }}
                            </td>

                            <!-- Stops count -->
                            <td>
                                <span class="ri-stops-pill">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                                        <path fill-rule="evenodd" d="M8 1.5a.75.75 0 01.75.75V7h4.75a.75.75 0 010 1.5H8.75v4.75a.75.75 0 01-1.5 0V8.5H2.5a.75.75 0 010-1.5h4.75V2.25A.75.75 0 018 1.5z" clip-rule="evenodd"/>
                                    </svg>
                                    {{ r.stops_count ?? 0 }}
                                </span>
                            </td>

                            <!-- Status -->
                            <td>
                                <span :class="statusClass(r.status)">
                                    {{ r.status ?? 'draft' }}
                                </span>
                            </td>

                            <!-- Actions -->
                            <td class="ri-actions">
                                <Link
                                    :href="`/routes/${r.id}`"
                                    class="ri-action-btn ri-action-btn--view"
                                    title="View"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"/>
                                        <path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41z" clip-rule="evenodd"/>
                                    </svg>
                                </Link>
                                <Link
                                    :href="route('routes.edit', r.id)"
                                    class="ri-action-btn ri-action-btn--edit"
                                    title="Edit"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z"/>
                                        <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z"/>
                                    </svg>
                                </Link>
                                <button
                                    class="ri-action-btn ri-action-btn--del"
                                    title="Delete"
                                    :disabled="deleting === r.id"
                                    @click="confirmDelete(r)"
                                >
                                    <svg v-if="deleting !== r.id" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd"/>
                                    </svg>
                                    <svg v-else class="ri-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- Row count -->
                <div class="ri-footer">
                    Showing <strong>{{ filtered.length }}</strong> of <strong>{{ routes.length }}</strong> routes
                </div>
            </div>

        </div>

        <!-- ── Delete confirm modal ─────────────────────────────────────── -->
        <Teleport to="body">
            <Transition name="modal">
                <div v-if="showConfirm" class="ri-modal-backdrop" @click.self="showConfirm = false">
                    <div class="ri-modal">
                        <div class="ri-modal-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 1.998-.303 4.5-2.599 4.5H4.645c-2.296 0-3.752-2.502-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                        <h3 class="ri-modal-title">Delete Route</h3>
                        <p class="ri-modal-text">
                            Are you sure you want to delete
                            <strong>{{ deleteTarget?.name }}</strong>?
                            This will also remove all associated stops. This action cannot be undone.
                        </p>
                        <div class="ri-modal-actions">
                            <button class="ri-btn ri-btn--ghost" @click="showConfirm = false">Cancel</button>
                            <button class="ri-btn ri-btn--danger" @click="doDelete">Delete</button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

    </AuthenticatedLayout>
</template>

<style scoped>
/* ── Page shell ──────────────────────────────────────────────────────────── */
.ri-page {
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-width: 1100px;
}

/* ── Heading ─────────────────────────────────────────────────────────────── */
.ri-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
}

.ri-title {
    font-size: 22px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
    letter-spacing: -0.4px;
}

.ri-subtitle {
    font-size: 13px;
    color: #64748b;
    margin: 3px 0 0;
}

/* ── Stats strip ─────────────────────────────────────────────────────────── */
.ri-stats {
    display: flex;
    align-items: center;
    gap: 0;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 14px 24px;
    width: fit-content;
}

.ri-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 24px;
}

.ri-stat:first-child { padding-left: 0; }
.ri-stat:last-child  { padding-right: 0; }

.ri-stat-value {
    font-size: 22px;
    font-weight: 700;
    color: #0f172a;
    line-height: 1;
}

.ri-stat-value--green { color: #16a34a; }

.ri-stat-label {
    font-size: 11px;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    font-weight: 500;
    margin-top: 3px;
}

.ri-stat-divider {
    width: 1px;
    height: 32px;
    background: #e2e8f0;
}

/* ── Toolbar ─────────────────────────────────────────────────────────────── */
.ri-toolbar {
    display: flex;
    gap: 10px;
    align-items: center;
}

.ri-search-wrap {
    position: relative;
    flex: 1;
    max-width: 340px;
}

.ri-search-icon {
    position: absolute;
    left: 11px;
    top: 50%;
    transform: translateY(-50%);
    width: 15px;
    height: 15px;
    color: #94a3b8;
    pointer-events: none;
}

.ri-search {
    width: 100%;
    padding: 8px 12px 8px 34px;
    font-size: 13.5px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #fff;
    color: #0f172a;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
}

.ri-search:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
}

/* ── Buttons ─────────────────────────────────────────────────────────────── */
.ri-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    font-size: 13.5px;
    font-weight: 600;
    border-radius: 8px;
    cursor: pointer;
    border: 1px solid transparent;
    text-decoration: none;
    white-space: nowrap;
    transition: background 0.15s, box-shadow 0.15s, opacity 0.15s;
}

.ri-btn svg { width: 15px; height: 15px; }

.ri-btn--primary {
    background: #1a56db;
    color: #fff;
    border-color: #1a56db;
}
.ri-btn--primary:hover { background: #1e429f; }

.ri-btn--ghost {
    background: #fff;
    color: #475569;
    border-color: #e2e8f0;
}
.ri-btn--ghost:hover { background: #f8fafc; }

.ri-btn--danger {
    background: #dc2626;
    color: #fff;
    border-color: #dc2626;
}
.ri-btn--danger:hover { background: #b91c1c; }

/* ── Error banner ────────────────────────────────────────────────────────── */
.ri-error {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    color: #dc2626;
    font-size: 13.5px;
    padding: 10px 14px;
}

.ri-error svg { width: 16px; height: 16px; flex-shrink: 0; }

.ri-error-close {
    margin-left: auto;
    background: none;
    border: none;
    cursor: pointer;
    color: #dc2626;
    font-size: 13px;
    line-height: 1;
}

/* ── Table ───────────────────────────────────────────────────────────────── */
.ri-table-wrap {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
}

.ri-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13.5px;
}

.ri-table thead tr {
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
}

.ri-table th {
    padding: 11px 16px;
    text-align: left;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: #64748b;
    white-space: nowrap;
}

.ri-th--right { text-align: right; }

.ri-row {
    border-bottom: 1px solid #f1f5f9;
    animation: rowIn 0.25s ease both;
    transition: background 0.12s;
}

.ri-row:last-child { border-bottom: none; }
.ri-row:hover { background: #fafbff; }

@keyframes rowIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
}

.ri-table td {
    padding: 12px 16px;
    color: #334155;
    vertical-align: middle;
}

/* Route name cell */
.ri-route-name {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: #0f172a;
    text-decoration: none;
    transition: color 0.12s;
}
.ri-route-name:hover { color: #1a56db; }

.ri-route-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #3b82f6;
    flex-shrink: 0;
}

/* Code chip */
.ri-code-chip {
    display: inline-block;
    font-size: 11.5px;
    font-weight: 700;
    font-family: 'Fira Code', 'Cascadia Code', monospace;
    background: #eff6ff;
    color: #1d4ed8;
    padding: 2px 8px;
    border-radius: 5px;
    border: 1px solid #dbeafe;
    letter-spacing: 0.5px;
}

/* Description */
.ri-desc {
    color: #64748b;
    max-width: 260px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* Stops pill */
.ri-stops-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 600;
    color: #475569;
    background: #f1f5f9;
    padding: 3px 9px;
    border-radius: 99px;
}
.ri-stops-pill svg { width: 10px; height: 10px; }

/* Status badges */
.ri-badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    text-transform: capitalize;
    padding: 3px 9px;
    border-radius: 99px;
}
.ri-badge--green  { background: #dcfce7; color: #15803d; }
.ri-badge--gray   { background: #f1f5f9; color: #475569; }
.ri-badge--yellow { background: #fef9c3; color: #a16207; }

/* Actions cell */
.ri-actions {
    text-align: right;
    white-space: nowrap;
}

.ri-action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 7px;
    border: 1px solid transparent;
    cursor: pointer;
    background: transparent;
    text-decoration: none;
    transition: background 0.12s, color 0.12s;
    margin-left: 4px;
}

.ri-action-btn svg { width: 14px; height: 14px; }

.ri-action-btn--view { color: #64748b; }
.ri-action-btn--view:hover { background: #eff6ff; color: #1d4ed8; border-color: #dbeafe; }

.ri-action-btn--edit { color: #64748b; }
.ri-action-btn--edit:hover { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }

.ri-action-btn--del { color: #64748b; }
.ri-action-btn--del:hover { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
.ri-action-btn--del:disabled { opacity: 0.5; cursor: not-allowed; }

/* Spin animation */
.ri-spin {
    animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Table footer */
.ri-footer {
    padding: 10px 16px;
    font-size: 12px;
    color: #94a3b8;
    border-top: 1px solid #f1f5f9;
    background: #fafbff;
}

/* ── Skeleton ─────────────────────────────────────────────────────────────── */
.ri-skeleton-row td { padding: 14px 16px; }

.ri-skeleton {
    height: 14px;
    border-radius: 6px;
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
}

.ri-skeleton--w16 { width: 16%; }
.ri-skeleton--w20 { width: 20%; }
.ri-skeleton--w24 { width: 24%; }
.ri-skeleton--w28 { width: 28%; }
.ri-skeleton--w60 { width: 60%; }

@keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

/* ── Empty state ─────────────────────────────────────────────────────────── */
.ri-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 24px;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    text-align: center;
    gap: 8px;
}

.ri-empty-icon {
    width: 56px;
    height: 56px;
    background: #eff6ff;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #3b82f6;
    margin-bottom: 4px;
}

.ri-empty-icon svg { width: 28px; height: 28px; }

.ri-empty-title {
    font-size: 16px;
    font-weight: 600;
    color: #0f172a;
    margin: 0;
}

.ri-empty-text {
    font-size: 13px;
    color: #64748b;
    margin: 0 0 8px;
}

/* ── Delete confirm modal ────────────────────────────────────────────────── */
.ri-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15,23,42,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 16px;
    backdrop-filter: blur(2px);
}

.ri-modal {
    background: #fff;
    border-radius: 14px;
    padding: 28px;
    max-width: 400px;
    width: 100%;
    box-shadow: 0 20px 60px rgba(0,0,0,0.18);
    text-align: center;
}

.ri-modal-icon {
    width: 48px;
    height: 48px;
    background: #fef2f2;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #dc2626;
    margin: 0 auto 14px;
}

.ri-modal-icon svg { width: 24px; height: 24px; }

.ri-modal-title {
    font-size: 17px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 8px;
}

.ri-modal-text {
    font-size: 13.5px;
    color: #475569;
    line-height: 1.6;
    margin: 0 0 20px;
}

.ri-modal-actions {
    display: flex;
    gap: 10px;
    justify-content: center;
}

/* ── Modal transition ────────────────────────────────────────────────────── */
.modal-enter-active, .modal-leave-active {
    transition: opacity 0.2s, transform 0.2s;
}
.modal-enter-from, .modal-leave-to {
    opacity: 0;
    transform: scale(0.95);
}

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
    .ri-stats { padding: 12px 16px; }
    .ri-stat  { padding: 0 12px; }

    .ri-table th:nth-child(3),
    .ri-table td:nth-child(3) { display: none; }

    .ri-heading { flex-direction: column; align-items: stretch; }
    .ri-btn--primary { text-align: center; justify-content: center; }
}
</style>