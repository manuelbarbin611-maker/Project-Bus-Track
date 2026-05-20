<script setup>
import Checkbox from '@/Components/Checkbox.vue';
import GuestLayout from '@/Layouts/GuestLayout.vue';
import InputError from '@/Components/InputError.vue';
import InputLabel from '@/Components/InputLabel.vue';
import TextInput from '@/Components/TextInput.vue';
import { Head, Link, useForm } from '@inertiajs/vue3';

defineProps({
    canResetPassword: { type: Boolean },
    status: { type: String },
});

const form = useForm({
    email: '',
    password: '',
    remember: false,
});

const submit = () => {
    form.post(route('login'), {
        onFinish: () => form.reset('password'),
    });
};
</script>

<template>
    <GuestLayout>
        <Head title="Log in" />

        <!-- Back to home -->
        <div class="mb-6">
            <Link
                href="/"
                class="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600 no-underline transition-colors group"
            >
                <svg class="h-4 w-4 transition-transform group-hover:-translate-x-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Back to home
            </Link>
        </div>

        <!-- Brand header -->
        <div class="mb-8 text-center">
            <h1 class="text-2xl font-bold text-slate-900">Welcome back</h1>
            <p class="mt-1 text-sm text-slate-500">Sign in to your fleet dashboard</p>
        </div>

        <!-- Status -->
        <div v-if="status" class="mb-5 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm font-medium text-green-700">
            {{ status }}
        </div>

        <form @submit.prevent="submit" class="flex flex-col gap-5">

            <!-- Email -->
            <div>
                <InputLabel for="email" value="Email address" class="text-sm font-semibold text-slate-700 mb-1.5" />
                <TextInput
                    id="email"
                    type="email"
                    class="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white transition"
                    v-model="form.email"
                    placeholder="you@example.com"
                    required
                    autofocus
                    autocomplete="username"
                />
                <InputError class="mt-1.5" :message="form.errors.email" />
            </div>

            <!-- Password -->
            <div>
                <div class="flex items-center justify-between mb-1.5">
                    <InputLabel for="password" value="Password" class="text-sm font-semibold text-slate-700" />
                    <Link
                        v-if="canResetPassword"
                        :href="route('password.request')"
                        class="text-xs font-medium text-blue-600 hover:text-blue-800 no-underline"
                    >
                        Forgot password?
                    </Link>
                </div>
                <TextInput
                    id="password"
                    type="password"
                    class="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white transition"
                    v-model="form.password"
                    placeholder="••••••••"
                    required
                    autocomplete="current-password"
                />
                <InputError class="mt-1.5" :message="form.errors.password" />
            </div>

            <!-- Remember me -->
            <label class="flex items-center gap-2.5 cursor-pointer select-none">
                <Checkbox name="remember" v-model:checked="form.remember" class="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span class="text-sm text-slate-600">Remember me</span>
            </label>

            <!-- Submit -->
            <button
                type="submit"
                :disabled="form.processing"
                :class="{ 'opacity-60 cursor-not-allowed': form.processing }"
                class="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm"
            >
                <span v-if="form.processing">Signing in…</span>
                <span v-else>Sign in</span>
            </button>

        </form>

        <!-- Register link -->
        <p class="mt-6 text-center text-sm text-slate-500">
            Don't have an account?
            <Link :href="route('register')" class="font-semibold text-blue-600 hover:text-blue-800 no-underline">
                Create one
            </Link>
        </p>

    </GuestLayout>
</template>