import { Item, ItemQuantity, Inventory } from "./types";
export const items: Item[] = [
    {
        id: "1",
        name: "łyżeczki",
        unit: "opak",
    },
    {
        id: "2",
        name: "talerzyki",
        unit: "szt",
    },
    {
        id: "3",
        name: "mydło do rąk",
        unit: "L",
    },
];

export const inventories: Inventory[] = [
    {
        id: "a",
        name: "22.04.2022",
        items: [
            {
                item_id: "1",
                quantity: 61
            },
            {
                item_id: "2",
                quantity: 38
            },
            {
                item_id: "3",
                quantity: 8
            }
        ]
    },
    {
        id: "b",
        name: "23.04.2022",
        items: [
            {
                item_id: "1",
                quantity: 53
            },
            {
                item_id: "2",
                quantity: 34
            },
            {
                item_id: "3",
                quantity: 7
            }
        ]
    },
    {
        id: "c",
        name: "24.04.2022",
        items: [
            {
                item_id: "1",
                quantity: 51
            },
            {
                item_id: "2",
                quantity: 13
            },
            {
                item_id: "3",
                quantity: 4
            }
        ]
    }
]

