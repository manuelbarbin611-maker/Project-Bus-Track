<script setup>
import GuestLayout from '@/Layouts/GuestLayout.vue';
import InputError from '@/Components/InputError.vue';
import InputLabel from '@/Components/InputLabel.vue';
import TextInput from '@/Components/TextInput.vue';
import { Head, useForm } from '@inertiajs/vue3';

const form = useForm({
    password: '',
});

const submit = () => {
    form.post(route('password.confirm'), {
        onFinish: () => form.reset(),
    });
};
</script>

<template>
    <GuestLayout>
        <Head title="Confirm Password" />

        <!-- Header -->
        <div class="mb-8 text-center">
          
            <h1 class="text-2xl font-bold text-slate-900">Confirm your identity</h1>
            <p class="mt-1 text-sm text-slate-500 leading-relaxed">
                This is a secure area. Please re-enter<br/>your password to continue.
            </p>
        </div>

        <form @submit.prevent="submit" class="flex flex-col gap-5">

            <div>
                <InputLabel for="password" value="Password" class="text-sm font-semibold text-slate-700 mb-1.5" />
                <TextInput
                    id="password"
                    type="password"
                    class="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white transition"
                    v-model="form.password"
                    placeholder="••••••••"
                    required
                    autofocus
                    autocomplete="current-password"
                />
                <InputError class="mt-1.5" :message="form.errors.password" />
            </div>

            <button
                type="submit"
                :disabled="form.processing"
                :class="{ 'opacity-60 cursor-not-allowed': form.processing }"
                class="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm"
            >
                <span v-if="form.processing">Confirming…</span>
                <span v-else>Confirm password</span>
            </button>

        </form>

    </GuestLayout>
</template>