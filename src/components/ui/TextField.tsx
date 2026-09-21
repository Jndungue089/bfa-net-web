import { Field, inputClass } from "./Field";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

/** Works directly with react-hook-form: <TextField label="…" {...register("x")} error={errors.x?.message} /> */
export function TextField({ label, error, hint, className, ...rest }: Props) {
  return (
    <Field label={label} error={error} hint={hint} className={className}>
      {({ id, describedBy, invalid }) => (
        <input id={id} aria-invalid={invalid} aria-describedby={describedBy} className={inputClass(invalid)} {...rest} />
      )}
    </Field>
  );
}
