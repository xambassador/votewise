import { createContext } from "./createContext";

const [GlobalProvider, useGlobal] = createContext("Layout");

export { GlobalProvider, useGlobal };
