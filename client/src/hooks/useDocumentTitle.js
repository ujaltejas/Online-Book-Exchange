import { useEffect } from "react";

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | BookSwap` : "BookSwap: swap or give away your textbooks";
  }, [title]);
}
