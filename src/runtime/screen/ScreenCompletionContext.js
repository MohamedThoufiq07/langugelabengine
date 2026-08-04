import { createContext, useContext } from "react";

export const ScreenCompletionContext = createContext(null);

export function useScreenCompletion() {

    return useContext(ScreenCompletionContext);

}
