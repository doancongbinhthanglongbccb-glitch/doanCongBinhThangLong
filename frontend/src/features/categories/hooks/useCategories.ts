import { useQuery } from "@tanstack/react-query";
import { getCategoriesTree } from "../services/categories.service";

export const useCategoriesTree = (options?: { visible?: boolean }) => {
  const visible = options?.visible;

  return useQuery({
    queryKey: ["categories", "tree", { visible }],
    queryFn: () => getCategoriesTree(options),
    staleTime: 60_000,
  });
};
