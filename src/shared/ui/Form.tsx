import { forwardRef, type ReactNode } from 'react';
import {
  Controller,
  FormProvider,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
  type SubmitHandler,
  type UseFormReturn,
} from 'react-hook-form';

export interface FormProps<TFieldValues extends FieldValues> {
  methods: UseFormReturn<TFieldValues>;
  onSubmit: SubmitHandler<TFieldValues>;
  className?: string;
  children: ReactNode;
}

export function Form<TFieldValues extends FieldValues>({
  methods,
  onSubmit,
  className,
  children,
}: FormProps<TFieldValues>) {
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={(event) => {
          const result = methods.handleSubmit(onSubmit)(event);
          if (result instanceof Promise) {
            result.catch(() => {
              /* errors handled by react-hook-form */
            });
          }
        }}
        className={className}
        noValidate
      >
        {children}
      </form>
    </FormProvider>
  );
}

export interface FormFieldRenderProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> {
  field: ControllerRenderProps<TFieldValues, TName> & { id: string };
  error?: string;
}

export interface FormFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> {
  control: UseFormReturn<TFieldValues>['control'];
  name: TName;
  label: string;
  description?: string;
  render: (props: FormFieldRenderProps<TFieldValues, TName>) => React.ReactNode;
}

export function FormField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
  control,
  name,
  label,
  description,
  render,
}: FormFieldProps<TFieldValues, TName>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700" htmlFor={field.name}>
            {label}
          </label>
          {render({ field: { ...field, id: field.name }, error: fieldState.error?.message })}
          {description ? <p className="text-xs text-slate-500">{description}</p> : null}
          {fieldState.error ? (
            <p className="text-xs text-red-600" role="alert">
              {fieldState.error.message}
            </p>
          ) : null}
        </div>
      )}
    />
  );
}

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function InputComponent(props, ref) {
    return (
      <input
        ref={ref}
        className="w-full rounded border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
        {...props}
      />
    );
  },
);

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function SelectComponent(props, ref) {
    return (
      <select
        ref={ref}
        className="w-full rounded border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
        {...props}
      />
    );
  },
);

export interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isSubmitting?: boolean;
}

export function SubmitButton({ isSubmitting, children, ...props }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      className="flex items-center justify-center rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      disabled={isSubmitting || props.disabled}
      {...props}
    >
      {isSubmitting ? 'Saving…' : children}
    </button>
  );
}
