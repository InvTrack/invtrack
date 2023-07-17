import { Dispatch, FC, ReactNode } from "react";

export interface BottomSheetProviderProps {
  children?: ReactNode;
}

export type BottomSheetExternalContextValue = {
  dispatch: Dispatch<BottomSheetAction>;
};

export type BottomSheetInternalContextValue = {
  isOpen: boolean;
  content: FC | null;
  newContent: FC | null;
};

export type BottomSheetActionType =
  | "OPEN"
  | "CLOSE"
  | "RESET"
  | "REMOVE"
  | "REPLACE";

export type BottomSheetActionPayload = FC | null;

export type BottomSheetAction = {
  type: BottomSheetActionType;
  payload?: BottomSheetActionPayload;
};
