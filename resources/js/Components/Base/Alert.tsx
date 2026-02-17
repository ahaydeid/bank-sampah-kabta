import Swal from 'sweetalert2';

/**
 * Custom SweetAlert2 Wrapper for Bank Sampah
 * Adheres to the mission-critical and clean UI design.
 */
const Alert = Swal.mixin({
    customClass: {
        confirmButton: 'bg-slate-800 text-white px-6 py-2 rounded-sm uppercase tracking-widest font-semibold text-xs hover:bg-slate-700 transition ease-in-out duration-150 mx-2',
        cancelButton: 'bg-white text-slate-700 px-6 py-2 rounded-sm border border-slate-300 uppercase tracking-widest font-semibold text-xs hover:bg-slate-50 transition ease-in-out duration-150 mx-2',
        popup: 'rounded-sm border border-slate-100 shadow-xl p-8',
        title: 'text-2xl font-bold text-slate-800',
        htmlContainer: 'text-slate-600 text-base',
    },
    buttonsStyling: false,
    confirmButtonText: 'OK',
    cancelButtonText: 'Batal',
});

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
