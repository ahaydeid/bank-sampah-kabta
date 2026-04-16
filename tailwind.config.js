import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Poppins', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                sankara: {
                    // ─── Brand Colors ─────────────────────────────
                    green: '#5aba1a',
                    gold: '#fcd34d',

                    // ─── Semantic Action Colors ───────────────────
                    // Ganti warna di sini, otomatis berubah di seluruh app
                    danger: {
                        DEFAULT: '#dc2626',   // bg-sankara-danger → delete button, error
                        hover: '#b91c1c',     // bg-sankara-danger-hover
                        light: '#fef2f2',     // bg-sankara-danger-light → soft bg
                        text: '#991b1b',      // text-sankara-danger-text
                    },
                    warning: {
                        DEFAULT: '#f59e0b',   // bg-sankara-warning → edit button
                        hover: '#d97706',     // bg-sankara-warning-hover
                        light: '#fffbeb',     // bg-sankara-warning-light
                        text: '#92400e',      // text-sankara-warning-text
                    },
                    success: {
                        DEFAULT: '#10b981',   // bg-sankara-success → aktif, berhasil
                        hover: '#059669',     // bg-sankara-success-hover
                        light: '#ecfdf5',     // bg-sankara-success-light
                        text: '#065f46',      // text-sankara-success-text
                    },
                    info: {
                        DEFAULT: '#0284c7',   // bg-sankara-info → view, detail
                        hover: '#0369a1',     // bg-sankara-info-hover
                        light: '#f0f9ff',     // bg-sankara-info-light
                        text: '#075985',      // text-sankara-info-text
                    },

                    // ─── Badge / Status Colors ────────────────────
                    badge: {
                        organik: '#10b981',       // Organik
                        anorganik: '#3b82f6',     // Anorganik
                        admin: '#622a83',         // Peran admin (= brand green)
                        petugas: '#2563eb',       // Peran petugas
                        aktif: '#10b981',
                        nonaktif: '#ef4444',
                        tersedia: '#10b981',
                        'tidak-tersedia': '#94a3b8',
                    },

                    // ─── Dashboard Stat Card Colors ───────────────
                    stat: {
                        member: '#FF006E',
                        petugas: '#FB5607',
                        pos: '#3A86FF',
                        kategori: '#8338EC',
                    },
                },
            },
        },
    },

    plugins: [forms],
};
