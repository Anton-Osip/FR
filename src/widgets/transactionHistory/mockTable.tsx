
export interface TransactionTableItem {
    id: number;
    transactionType: 'Депозит' | "Вывод";
    amount: string;
    date: string;
    status: "Отказ" | "Успешно";
}

export const TABLE_DATA: TransactionTableItem[] = [
    {
        id: 1323989,
        transactionType: "Депозит",
        amount: "10 000,05",
        date: '01.02.2025',
        status: 'Успешно'
    },
    {
        id: 1323990,
        transactionType: "Вывод",
        amount: "10 000,05",
        date: '01.02.2025',
        status: 'Отказ'
    },
    {
        id: 1323991,
        transactionType: "Депозит",
        amount: "10 000,05",
        date: '01.02.2025',
        status: 'Успешно'
    },
    {
        id: 1323992,
        transactionType: "Вывод",
        amount: "10 000,05",
        date: '01.02.2025',
        status: 'Отказ'
    },
    {
        id: 1323993,
        transactionType: "Депозит",
        amount: "10 000,05",
        date: '01.02.2025',
        status: 'Успешно'
    },
    {
        id: 1323994,
        transactionType: "Вывод",
        amount: "10 000,05",
        date: '01.02.2025',
        status: 'Отказ'
    },
    {
        id: 1323995,
        transactionType: "Депозит",
        amount: "10 000,05",
        date: '01.02.2025',
        status: 'Успешно'
    },
    {
        id: 1323996,
        transactionType: "Вывод",
        amount: "10 000,05",
        date: '01.02.2025',
        status: 'Отказ'
    },
    {
        id: 1323997,
        transactionType: "Депозит",
        amount: "10 000,05",
        date: '01.02.2025',
        status: 'Успешно'
    },
    {
        id: 1323998,
        transactionType: "Вывод",
        amount: "10 000,05",
        date: '01.02.2025',
        status: 'Отказ'
    },

];