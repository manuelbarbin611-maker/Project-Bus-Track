<script setup>
import { Head, Link } from '@inertiajs/vue3';

defineProps({
    canLogin: Boolean,
    canRegister: Boolean,
    laravelVersion: String,
    phpVersion: String,
});
</script>

<template>
    <Head title="Passenger Management System" />

    <!-- Main Container -->
    <div class="min-h-screen bg-[#0b0e17] text-[#e8eaf0] font-sans relative overflow-hidden">
        
        <!-- Background Grid -->
        <div class="fixed inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none z-0"></div>

        <!-- Background Blobs -->
        <div class="fixed w-[600px] h-[600px] -top-52 -left-40 bg-violet-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
        <div class="fixed w-[500px] h-[500px] -bottom-28 -right-28 bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none z-0"></div>

        <div class="relative z-10 max-w-[1100px] mx-auto px-6">
            
            <!-- HEADER -->
            <header class="py-6 border-b border-white/10">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <span class="text-xl font-semibold tracking-tight">ProjectBustracking</span>
                    </div>

                    <nav v-if="canLogin" class="flex items-center gap-3">
                        <Link
                            v-if="$page.props.auth?.user"
                            :href="route('dashboard')"
                            class="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-2xl transition-colors"
                        >
                            Dashboard →
                        </Link>
                        <template v-else>
                            <Link :href="route('login')" 
                                  class="px-6 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
                                Log in
                            </Link>
                            <Link v-if="canRegister" :href="route('register')" 
                                  class="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-2xl transition-colors">
                                Get started
                            </Link>
                        </template>
                    </nav>
                </div>
            </header>

            <!-- HERO -->
            <section class="text-center pt-20 pb-16">
            

                <h1 class="text-5xl md:text-6xl font-bold tracking-tighter leading-tight mb-6">
                    Track every passenger,<br>
                    <span class="bg-gradient-to-r from-violet-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                        every step of the way
                    </span>
                </h1>

                <p class="max-w-lg mx-auto text-lg text-slate-400 leading-relaxed mb-12">
                    Manage passenger records • Real-time boarding status • Powerful search &amp; filtering
                </p>

                <div class="flex flex-wrap gap-4 justify-center mb-16">
                    <Link v-if="canRegister" :href="route('register')"
                          class="inline-flex items-center gap-3 px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-2xl transition-all hover:-translate-y-px">
                        Start managing passengers
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </Link>

                    <Link v-if="canLogin && !$page.props.auth?.user" :href="route('login')"
                          class="px-8 py-4 border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium rounded-2xl transition-all">
                        Sign in
                    </Link>
                </div>

            
            </section>


            <!-- FOOTER
            <footer class="py-8 text-center text-sm text-slate-600 border-t border-white/10">
                Laravel v{{ laravelVersion }} • PHP v{{ phpVersion }} • Passenger Management System
            </footer> -->
        </div>
    </div>
</template>