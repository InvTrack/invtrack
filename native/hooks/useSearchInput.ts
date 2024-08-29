import { useForm } from "react-hook-form";

type SearchInputForm = { searchText: string };
export const useSearchInput = () => {
  const { control, watch, reset } = useForm<SearchInputForm>({
    defaultValues: {
      searchText: "",
    },
    mode: "onChange",
  });

  const searchText = watch("searchText");

  return {
    control,
    searchText,
    reset,
  };
};
