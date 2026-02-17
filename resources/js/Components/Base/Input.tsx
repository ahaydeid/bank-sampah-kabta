import { forwardRef, InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
    isFocused?: boolean;
}

export default forwardRef<HTMLInputElement, Props>(function Input(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    return (
        <input
            {...props}
            type={type}
            className={
                'border-slate-300 focus:border-kabta-purple focus:ring-kabta-purple rounded transition-all duration-200 ' +
                className
            }
            ref={ref}
            autoFocus={isFocused}
        />
    );
});
