import React, { HTMLProps } from 'react';
import cx from 'classnames';
import styles from './Checkbox.module.css';

type Props = {
  error?: string;
} & HTMLProps<HTMLInputElement>;

function Checkbox({ children, error, ...props }: Props) {
  return (
    <label className={cx(styles.root, props.disabled && styles.disabled)}>
      <input
        type="checkbox"
        {...props}
        aria-invalid={error ? 'true' : 'false'}
        className={styles.input}
      />
      <div className={cx(styles.checkbox, !!error && styles.error)} />
      <span className={styles.label}>{children}</span>
    </label>
  );
}

export default Checkbox;
