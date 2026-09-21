import { Field, inputClass } from "./Field";

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function SelectField({ label, error, hint, className, children, ...rest }: Props) {
  return (
    <Field label={label} error={error} hint={hint} className={className}>
      {({ id, describedBy, invalid }) => (
        <select id={id} aria-invalid={invalid} aria-describedby={describedBy} className={inputClass(invalid)} {...rest}>{children}</select>
      )}
    </Field>
  );
}
