import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useReducer,
} from "react";
import {
  SnackbarAction,
  SnackbarItem,
  SnackbarMessage,
  SnackbarType,
} from "./types";

const SnackbarContext = createContext<{
  dispatch: React.Dispatch<SnackbarAction>;
  state: { id: number; message: SnackbarMessage; type: SnackbarType }[];
  showSuccess: (message: SnackbarMessage) => void;
  showError: (message: SnackbarMessage) => void;
  showInfo: (message: SnackbarMessage) => void;
}>({
  dispatch: () => {},
  state: [],
  showSuccess: () => {},
  showError: () => {},
  showInfo: () => {},
});

const initialSnackbarMsgState: SnackbarItem[] = [];

const snackbarReducer = (
  state = initialSnackbarMsgState,
  action: SnackbarAction
) => {
  const { type, payload } = action;
  if (type === "SHOW_SNACKBAR") {
    return [
      ...state,
      {
        ...payload,
        id: state.reduce((sum, it) => sum + it.id, 1),
      },
    ];
  } else if (type === "HIDE_SNACKBAR") {
    return state.filter((it) => it.id !== payload.id);
  }
  return state;
};

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(snackbarReducer, []);
  const showSuccess = useCallback(
    (message: SnackbarMessage) => {
      dispatch({
        type: "SHOW_SNACKBAR",
        payload: { message, type: "success" },
      });
    },
    [dispatch]
  );
  const showError = useCallback(
    (message: SnackbarMessage) => {
      dispatch({
        type: "SHOW_SNACKBAR",
        payload: { message, type: "error" },
      });
    },
    [dispatch]
  );
  const showInfo = useCallback(
    (message: SnackbarMessage) => {
      dispatch({
        type: "SHOW_SNACKBAR",
        payload: { message, type: "info" },
      });
    },
    [dispatch]
  );
  return (
    <SnackbarContext.Provider
      value={{ showSuccess, showError, showInfo, dispatch, state }}
    >
      {children}
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => useContext(SnackbarContext);
