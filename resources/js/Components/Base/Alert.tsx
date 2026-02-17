import Swal, { SweetAlertOptions } from 'sweetalert2';

const BASE_CONFIRM_BTN = 'text-white px-6 py-3 rounded-sm uppercase tracking-widest font-semibold text-xs transition ease-in-out duration-150 mx-2 focus:outline-none';

const VARIANTS = {
    default: {
        confirmButton: `bg-slate-700 hover:bg-slate-800 ${BASE_CONFIRM_BTN}`,
        title: 'text-slate-800',
    },
    danger: {
        confirmButton: `bg-red-600 hover:bg-red-700 ${BASE_CONFIRM_BTN}`,
        title: 'text-red-600',
    },
    success: {
        confirmButton: `bg-emerald-600 hover:bg-emerald-700 ${BASE_CONFIRM_BTN}`,
        title: 'text-emerald-600',
    },
    info: {
        confirmButton: `bg-sky-600 hover:bg-sky-700 ${BASE_CONFIRM_BTN}`,
        title: 'text-sky-700',
    },
    primary: {
        confirmButton: `bg-kabta-purple hover:bg-kabta-purple/90 ${BASE_CONFIRM_BTN}`,
        title: 'text-kabta-purple',
    },
};

const ALERT_CUSTOM_CLASSES = {
    cancelButton: 'bg-white text-slate-700 px-6 py-3 rounded-sm border border-slate-300 uppercase tracking-widest font-semibold text-xs hover:bg-slate-50 transition ease-in-out duration-150 mx-2 focus:outline-none',
    popup: 'rounded-sm border border-slate-100 shadow-lg p-8',
    htmlContainer: 'text-slate-600 text-base',
};

/**
 * Custom SweetAlert2 Wrapper for Bank Sampah
 */
const AlertBase = Swal.mixin({
    customClass: ALERT_CUSTOM_CLASSES,
    buttonsStyling: false,
    confirmButtonText: 'OK',
    cancelButtonText: 'Batal',
});

type AlertVariant = keyof typeof VARIANTS;

type AlertOptions = SweetAlertOptions & {
    variant?: AlertVariant;
};

const Alert = {
    fire: (options: AlertOptions) => {
        const { variant = 'default', ...swalOptions } = options;
        const config = VARIANTS[variant];

        return AlertBase.fire({
            ...swalOptions,
            customClass: {
                ...ALERT_CUSTOM_CLASSES,
                confirmButton: config.confirmButton,
                title: `text-2xl font-bold ${config.title}`,
                ...(swalOptions.customClass as Record<string, string> || {}),
            },
        });
    },
    
    // Convenience methods
    success: (options: SweetAlertOptions) => Alert.fire({ icon: 'success', variant: 'success', ...options }),
    error: (options: SweetAlertOptions) => Alert.fire({ icon: 'error', variant: 'danger', ...options }),
    info: (options: SweetAlertOptions) => Alert.fire({ icon: 'info', variant: 'info', ...options }),
    confirm: (options: SweetAlertOptions) => Alert.fire({ icon: 'question', variant: 'info', showCancelButton: true, ...options }),
    delete: (options: SweetAlertOptions) => Alert.fire({ icon: 'warning', variant: 'danger', showCancelButton: true, ...options }),
};

export const toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
    customClass: {
        popup: 'rounded-sm shadow-lg border border-slate-100',
    }
});

export default Alert;
