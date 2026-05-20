    import './bootstrap';
    import '../css/app.css';

    import { createApp, h } from 'vue';
    import { createInertiaApp } from '@inertiajs/vue3';
    import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
    import { ZiggyVue } from '../../vendor/tightenco/ziggy';
    import axios from 'axios';

    axios.defaults.baseURL        = '/api';
    axios.defaults.withCredentials = true;       // send the session cookie
    axios.defaults.withXSRFToken  = true;        // send the XSRF-TOKEN cookie as header
    // ─────────────────────────────────────────────────────────────────────────────

    const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

    createInertiaApp({
        title: (title) => `${title} - ${appName}`,
        resolve: (name) =>
            resolvePageComponent(
                `./Pages/${name}.vue`,
                import.meta.glob('./Pages/**/*.vue'),
            ),
        setup({ el, App, props, plugin }) {
            return createApp({ render: () => h(App, props) })
                .use(plugin)
                .use(ZiggyVue)
                .mount(el);
        },
        progress: {
            color: '#1a56db',
        },
    });