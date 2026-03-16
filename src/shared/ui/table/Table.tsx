import { type HTMLAttributes, forwardRef } from 'react';

import clsx from 'clsx';

import styles from './Table.module.scss';

const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(({ className, ...props }, ref) => (
  <div className={styles.container}>
    <table className={clsx(styles.table, className)} ref={ref} {...props} />
  </div>
));

Table.displayName = 'Table';

const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, children, ...props }, ref) => (
    <thead className={clsx(styles.thead, className)} ref={ref} {...props}>
      <tr className={styles.tr}>{children}</tr>
    </thead>
  ),
);

TableHeader.displayName = 'TableHeader';

const TableFooter = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <tfoot className={clsx(styles.tfoot, className)} ref={ref} {...props} />,
);

TableFooter.displayName = 'TableFooter';

const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <tbody className={clsx(styles.tbody, className)} ref={ref} {...props} />,
);

TableBody.displayName = 'TableBody';

const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => <tr className={clsx(styles.tr, className)} ref={ref} {...props} />,
);

TableRow.displayName = 'TableRow';

const TableHead = forwardRef<HTMLTableCellElement, HTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => <th className={clsx(styles.th, className)} ref={ref} {...props} />,
);

TableHead.displayName = 'TableHead';

const TableCell = forwardRef<HTMLTableCellElement, HTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => <td className={clsx(styles.td, className)} ref={ref} {...props} />,
);

TableCell.displayName = 'TableCell';

export { Table, TableHeader, TableHead, TableBody, TableRow, TableCell, TableFooter };
