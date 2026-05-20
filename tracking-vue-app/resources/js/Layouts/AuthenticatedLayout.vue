<script setup>
import { ref, computed } from 'vue';
import { Link, usePage } from '@inertiajs/vue3';

const page = usePage();
const user = computed(() => page.props.auth.user);

const mobileMenuOpen = ref(false);

const navLinks = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        routeName: 'dashboard',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
               </svg>`,
    },
    {
        label: 'Routes',
        href: '/routes',
        routeName: 'routes.',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
               </svg>`,
    },
    {
        label: 'Buses',
        href: '/buses',
        routeName: 'buses.',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
               </svg>`,
    },
    {
        label: 'Passengers',
        href: '/passengers',
        routeName: 'passengers.',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
               </svg>`,
    },
    {
        label: 'Stops',
        href: '/stops',
        routeName: 'stops.',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                 <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
               </svg>`,
    },
   {
    label: 'Live Tracking',
    href: '/tracking',
    routeName: 'tracking.',
    badge: 'Live',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round"
                d="M3 17l6-6 4 4 7-7" />
            <circle cx="3" cy="17" r="1.5" />
            <circle cx="9" cy="11" r="1.5" />
            <circle cx="13" cy="15" r="1.5" />
            <circle cx="20" cy="8" r="1.5" />
        </svg>`,
}
];

function isActive(routeName) {
    return route().current(routeName + '*') || route().current(routeName);
}
</script>

<template>
    <div class="min-h-screen flex flex-col bg-slate-50">

        <!-- Mobile overlay -->
        <transition
            enter-active-class="transition-opacity duration-200"
            enter-from-class="opacity-0"
            leave-active-class="transition-opacity duration-200"
            leave-to-class="opacity-0"
        >
            <div
                v-if="mobileMenuOpen"
                class="fixed inset-0 bg-black/50 z-40 md:hidden"
                @click="mobileMenuOpen = false"
            />
        </transition>

        <!-- ── Top nav ────────────────────────────────────────────────── -->
        <header class="sticky top-0 z-50 bg-slate-900 border-b border-white/[0.06] h-[62px] flex-shrink-0">
            <div class="h-full max-w-screen-xl mx-auto px-4 sm:px-6 grid grid-cols-[auto_1fr_auto] items-center gap-4">

                <!-- Left: Brand -->
                <Link href="/dashboard" class="flex items-center gap-2.5 flex-shrink-0">
                    <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5">
                            <path d="M6 22L10 10H22L26 22H6Z" stroke="white" stroke-width="1.8" stroke-linejoin="round"/>
                            <circle cx="10" cy="23.5" r="2" fill="white"/>
                            <circle cx="22" cy="23.5" r="2" fill="white"/>
                            <path d="M8 16H24" stroke="white" stroke-width="1.5"/>
                        </svg>
                    </div>
                    <div class="hidden sm:flex flex-col leading-tight">
                        <span class="text-[15px] font-bold text-slate-100 tracking-tight">BusTrack</span>
                        <span class="text-[9px] font-medium text-slate-500 uppercase tracking-widest">Fleet Management</span>
                    </div>
                </Link>

                <!-- Center: Desktop nav links -->
                <nav class="hidden lg:flex items-center justify-center gap-0.5">
                    <Link
                        v-for="link in navLinks"
                        :key="link.label"
                        :href="link.href"
                        :class="[
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13.5px] font-medium whitespace-nowrap transition-colors duration-150 border-b-2',
                            isActive(link.routeName)
                                ? 'bg-blue-500/15 text-blue-400 border-blue-500'
                                : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-100 border-transparent'
                        ]"
                    >
                        <span class="flex-shrink-0 w-4 h-4" v-html="link.icon" />
                        <span>{{ link.label }}</span>
                        <span
                            v-if="link.badge"
                            class="text-[9px] font-bold uppercase tracking-wide bg-red-500 text-white px-1.5 py-0.5 rounded-full animate-pulse"
                        >{{ link.badge }}</span>
                    </Link>
                </nav>

                <!-- Center: Tablet icon-only nav -->
                <nav class="hidden md:flex lg:hidden items-center justify-center gap-0.5">
                    <Link
                        v-for="link in navLinks"
                        :key="link.label"
                        :href="link.href"
                        :title="link.label"
                        :class="[
                            'relative flex items-center justify-center p-2 rounded-lg transition-colors duration-150',
                            isActive(link.routeName)
                                ? 'bg-blue-500/15 text-blue-400'
                                : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-100'
                        ]"
                    >
                        <span class="w-4 h-4" v-html="link.icon" />
                        <span v-if="link.badge" class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    </Link>
                </nav>

                <!-- Mobile: empty center so grid stays balanced -->
                <div class="md:hidden" />

                <!-- Right: actions -->
                <div class="flex items-center justify-end gap-2 flex-shrink-0">
                    <!-- Live pill -->
                    <Link
                        :href="route('tracking.live')"
                        class="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-red-300 bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-full hover:bg-red-500/20 transition-colors whitespace-nowrap"
                    >
                        <span class="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></span>
                        Live
                    </Link>

                    <!-- Avatar -->
                    <Link
                        :href="route('profile.edit')"
                        :title="user?.name"
                        class="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 hover:opacity-85 transition-opacity"
                    >
                        {{ user?.name?.charAt(0)?.toUpperCase() }}
                    </Link>

                    <!-- Logout -->
                    <Link
                        :href="route('logout')"
                        method="post"
                        as="button"
                        title="Sign out"
                        class="hidden sm:flex w-8 h-8 items-center justify-center text-slate-500 rounded-lg hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer bg-transparent border-0"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                    </Link>

                    <!-- Hamburger (mobile only) -->
                    <button
                        class="flex md:hidden flex-col gap-[5px] p-1.5 bg-transparent border-0 cursor-pointer"
                        @click="mobileMenuOpen = !mobileMenuOpen"
                        aria-label="Toggle menu"
                    >
                        <span :class="['block w-5 h-0.5 bg-slate-400 rounded transition-all duration-200 origin-center', mobileMenuOpen ? 'translate-y-[7px] rotate-45' : '']" />
                        <span :class="['block w-5 h-0.5 bg-slate-400 rounded transition-all duration-200', mobileMenuOpen ? 'opacity-0 scale-x-0' : '']" />
                        <span :class="['block w-5 h-0.5 bg-slate-400 rounded transition-all duration-200 origin-center', mobileMenuOpen ? '-translate-y-[7px] -rotate-45' : '']" />
                    </button>
                </div>

            </div>
        </header>

        <!-- ── Mobile drawer ──────────────────────────────────────────── -->
        <transition
            enter-active-class="transition-transform duration-250 ease-out"
            enter-from-class="-translate-x-full"
            leave-active-class="transition-transform duration-200 ease-in"
            leave-to-class="-translate-x-full"
        >
            <aside
                v-if="mobileMenuOpen"
                class="fixed top-[62px] left-0 bottom-0 w-64 bg-slate-900 z-50 flex flex-col border-r border-white/[0.06] shadow-2xl md:hidden"
            >
                <nav class="flex-1 overflow-y-auto p-3 flex flex-col gap-0.5">
                    <Link
                        v-for="link in navLinks"
                        :key="link.label"
                        :href="link.href"
                        :class="[
                            'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium border-l-2 transition-colors duration-150',
                            isActive(link.routeName)
                                ? 'bg-blue-500/15 text-blue-400 border-blue-500'
                                : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-100 border-transparent'
                        ]"
                        @click="mobileMenuOpen = false"
                    >
                        <span class="flex-shrink-0 w-4 h-4" v-html="link.icon" />
                        <span class="flex-1">{{ link.label }}</span>
                        <span
                            v-if="link.badge"
                            class="text-[9px] font-bold uppercase tracking-wide bg-red-500 text-white px-1.5 py-0.5 rounded-full animate-pulse"
                        >{{ link.badge }}</span>
                    </Link>
                </nav>

                <!-- Drawer footer: user + logout -->
                <div class="p-3 border-t border-white/[0.06] flex items-center gap-2">
                    <Link
                        :href="route('profile.edit')"
                        class="flex items-center gap-2.5 flex-1 min-w-0 p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
                        @click="mobileMenuOpen = false"
                    >
                        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {{ user?.name?.charAt(0)?.toUpperCase() }}
                        </div>
                        <div class="flex flex-col min-w-0">
                            <span class="text-[13px] font-semibold text-slate-200 truncate">{{ user?.name }}</span>
                            <span class="text-[11px] text-slate-500 truncate">{{ user?.email }}</span>
                        </div>
                    </Link>
                    <Link
                        :href="route('logout')"
                        method="post"
                        as="button"
                        class="w-8 h-8 flex items-center justify-center text-slate-500 rounded-lg hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer border-0 bg-transparent flex-shrink-0"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                    </Link>
                </div>
            </aside>
        </transition>

        <!-- ── Page content ───────────────────────────────────────────── -->
        <main class="flex-1 w-full max-w-screen-xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div v-if="$slots.header" class="mb-6 text-xl font-bold text-slate-800">
                <slot name="header" />
            </div>
            <slot />
        </main>

    </div>
</template>