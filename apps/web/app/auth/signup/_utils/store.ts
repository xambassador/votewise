import { atom, useAtom, useAtomValue } from "jotai";

export type FormStore = {
  firstName?: string;
  lastName?: string;
  userName?: string;
  email?: string;
  password?: string;
};

const stepsAtom = atom(1);
const formAtom = atom<FormStore>();

export function useStepsAtom() {
  return useAtom(stepsAtom);
}

export function useGetSteps() {
  const steps = useAtomValue(stepsAtom);
  return steps;
}

export function useFormAtom() {
  return useAtom(formAtom);
}
