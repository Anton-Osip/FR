export interface BettingTableItem {
    id: number;
    user: string;
    game: string;
    betAmount: string;
    multiplier: string;
    payout: string;
    isWin: boolean;
}

export const TABLE_DATA: BettingTableItem[] = [
    {
        id: 1323989,
        user: "Label",
        game: "Label",
        betAmount: "10 000,05 ₽",
        multiplier: "5,00×",
        payout: "50 000,25 ₽",
        isWin: true,
    },
    {
        id: 1323962,
        user: "Label",
        game: "Label",
        betAmount: "10 000,05 ₽",
        multiplier: "5,00×",
        payout: "0,00 ₽",
        isWin: false,
    },
    {
        id: 1323935,
        user: "Label",
        game: "Label",
        betAmount: "10 000,05 ₽",
        multiplier: "5,00×",
        payout: "0,00 ₽",
        isWin: false,
    },
    {
        id: 1323855,
        user: "Label",
        game: "Label",
        betAmount: "15 000,00 ₽",
        multiplier: "3,00×",
        payout: "45 000,00 ₽",
        isWin: true,
    },
    {
        id: 1323632,
        user: "Label",
        game: "Label",
        betAmount: "5 000,20 ₽",
        multiplier: "6,00×",
        payout: "30 001,20 ₽",
        isWin: true,
    },
    {
        id: 1323234,
        user: "Label",
        game: "Label",
        betAmount: "20 000,75 ₽",
        multiplier: "4,00×",
        payout: "0,00 ₽",
        isWin: false,
    },
    {
        id: 1323197,
        user: "Label",
        game: "Label",
        betAmount: "12 500,50 ₽",
        multiplier: "2,50×",
        payout: "0,00 ₽",
        isWin: false,
    },
    {
        id: 1316088,
        user: "Label",
        game: "Label",
        betAmount: "8 000,00 ₽",
        multiplier: "7,00×",
        payout: "56 000,00 ₽",
        isWin: true,
    },
    {
        id: 1316086,
        user: "Label",
        game: "Label",
        betAmount: "25 000,00 ₽",
        multiplier: "1,00×",
        payout: "0,00 ₽",
        isWin: false,
    },
    {
        id: 1316084,
        user: "Label",
        game: "Label",
        betAmount: "8 000,00 ₽",
        multiplier: "7,00×",
        payout: "56 000,00 ₽",
        isWin: true,
    },
];