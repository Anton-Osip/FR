import { type ChangeEvent, type FC, type ReactNode, useState } from 'react';

import clsx from 'clsx';

import styles from './FileUploadField.module.scss';

interface FileUploadFieldProps {
  id: string;
  label?: string;
  placeholder?: string;
  noFileText?: string;
  accept?: string;
  className?: string;
  icon?: ReactNode;
}

export const FileUploadField: FC<FileUploadFieldProps> = ({
  id,
  label,
  placeholder,
  noFileText = 'Файл не выбран',
  accept,
  className,
  icon,
}) => {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0] ?? null;

    setFileName(file ? file.name : null);
  };

  return (
    <div className={clsx(styles.root, className)}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}

      <label className={styles.control}>
        <input id={id} type="file" accept={accept} className={styles.fileInput} onChange={handleChange} />

        <div className={styles.textWrapper}>
          {placeholder && <p className={styles.placeholder}>{placeholder}</p>}
          <p className={styles.fileName}>{fileName ?? noFileText}</p>
        </div>

        {icon && <div className={styles.icon}>{icon}</div>}
      </label>
    </div>
  );
};
