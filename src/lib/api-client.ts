import { useMutation } from "@tanstack/react-query";

export const useAnalyzeSeo = () => {
  return useMutation({
    mutationFn: async (url: string) => {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!response.ok) throw new Error("Analysis failed");
      return response.json();
    },
  });
};
