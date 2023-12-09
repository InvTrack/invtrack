import { beforeNavigate, goto } from "$app/navigation";
import { onMount } from "svelte";
import type { BeforeNavigate } from "@sveltejs/kit";

// TODO: not quite yet there but I leave it here for now
type ModalHandler<T extends string | number> = {
  [K in
    | `onFormChange${T}`
    | `onDestructiveAction${T}`
    | `onNeutralAction${T}`
    | `isShown${T}`]: K extends `isShown${T}` ? boolean : () => void;
};

const modalHandler = <T extends string | number>(modalSymbol: T): ModalHandler<T> => {
  let shouldShowModal = false;
  let isModalShown = false;
  let navigateTo: URL | undefined;

  const onDestructiveAction = () => {
    shouldShowModal = false;
    isModalShown = false;
    if (navigateTo) {
      goto(navigateTo);
    }
  };
  const onNeutralAction = () => {
    isModalShown = false;
  };
  const onFormChange = () => {
    shouldShowModal = true;
  };

  onMount(() => {
    const navigateHandler = ({ cancel, to }: BeforeNavigate) => {
      if (!shouldShowModal) {
        return;
      }
      cancel();
      isModalShown = true;
      navigateTo = to?.url;
      return;
    };

    beforeNavigate(navigateHandler);
  });

  return {
    [`onFormChange${modalSymbol}`]: onFormChange,
    [`onDestructiveAction${modalSymbol}`]: onDestructiveAction,
    [`onNeutralAction${modalSymbol}`]: onNeutralAction,
    [`isShown${modalSymbol}`]: isModalShown,
  } as ModalHandler<T>;
};

export const createModalHandler = <T extends string | number>(modalSymbol: T) =>
  modalHandler(modalSymbol);
