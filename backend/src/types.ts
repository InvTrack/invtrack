export type UUID = string

export type ItemQuantity = {
    item_id: UUID,
    quantity: number,
}

export type Inventory = {
    id: UUID,
    name: string,
    items: ItemQuantity[],
}

export type Item = {
    id: UUID,
    name: string,
    unit: string,
}


