export * from "./sessionContext";
export * from "./useGetUser";
export * from "./useListInventories";
export * from "./useRecordPanel";
export * from "./useUpdateUser";
export * from "./useGetRecord";
export * from "./useListRecords";

/**
 * Konwenja nazewnictwa hooków backendowych
 *
 * useGet... - hooki do fetchowania jednej rzeczy np jednego użytkownika
 * useList... - hooki do fetchowania zwykłych list rzeczy np list produktów w przedsiębiorstwie
 * useFind... - hooki do fetchowania list z parametrami, np paginacja albo warunki jakie muszą spelniać encje
 * useUpdate... - hooki mutujące dane serwerowe
 */
