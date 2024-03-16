import type { DndEvent } from "svelte-dnd-action";

export type Item = { id: number; name: string };
export type Items = Item[];
export type Column = { id: number; name: string; items: Item[] };
export type Columns = Column[];

export type DndItemEvent = CustomEvent<DndEvent<Item>>;
export type DndColumnEvent = CustomEvent<DndEvent<Column>>;