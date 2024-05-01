import type { ErrorResponse } from "@votewise/types";
import type { AxiosError } from "axios";

import React, { forwardRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Controller, useFormContext } from "react-hook-form";
import { useQuery } from "react-query";
import { checkUsernameAvailability } from "services/user";

import { Loader, SelectField, TextAreaField, TextField } from "@votewise/ui";

import { useDebounce } from "lib/hooks/useDebounce";

const options = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

type StepOneProps = {
  onFetchingUsername: (isLoading: boolean) => void;
  onError: (isError: boolean) => void;
} & {
  containerProps?: React.HTMLAttributes<HTMLDivElement>;
};

export const StepOne = forwardRef<HTMLDivElement, StepOneProps>((props, ref) => {
  const { onFetchingUsername, onError, containerProps } = props;
  const { register, control, watch } = useFormContext();
  const debouncedUsername = useDebounce(watch("username"), 500);
  const { data, isLoading, isSuccess, isError, error } = useQuery<
    Awaited<ReturnType<typeof checkUsernameAvailability>>,
    AxiosError<ErrorResponse>
  >(
    ["checkUsernameAvailability", debouncedUsername],
    () => {
      onError(false);
      return checkUsernameAvailability(debouncedUsername);
    },
    {
      refetchOnWindowFocus: false,
      enabled: !!debouncedUsername,
      retry: false,
      onError: () => {
        onError(true);
      },
    }
  );

  useEffect(() => {
    onFetchingUsername(isLoading);
  }, [isLoading, onFetchingUsername]);

  return (
    <div className="flex flex-col gap-5" {...containerProps} ref={ref}>
      <TextField
        label="Username"
        type="text"
        labelProps={{
          className: "font-medium",
        }}
        {...register("username", {
          required: "Username is required",
        })}
      >
        {isLoading && (
          <motion.div
            className="mt-1 flex items-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-sm text-gray-500">Checking username availability...</span>
            <Loader loaderColor="#1763AB" className="ml-2 h-4 w-4" />
          </motion.div>
        )}
        {isSuccess && (
          <motion.span
            className="text-sm text-green-600"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {data.data.message}
          </motion.span>
        )}
        {isError && error && (
          <motion.span
            className="text-sm text-red-600"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {error.response?.data.error.message}
          </motion.span>
        )}
      </TextField>

      <TextField
        label="Name"
        type="text"
        labelProps={{
          className: "font-medium",
        }}
        {...register("name", {
          required: "Name is required",
        })}
      />

      <Controller
        name="gender"
        control={control}
        rules={{
          required: "Gender is required",
        }}
        render={({ field }) => (
          <SelectField
            label="Gender"
            labelProps={{
              className: "font-medium",
            }}
            options={options}
            placeholder=""
            required
            instanceId="gender"
            {...field}
          />
        )}
      />

      <TextAreaField
        label="About yourself"
        className="resize-none"
        labelProps={{
          className: "font-medium",
        }}
        {...register("about", {
          required: "About yourself is required",
          minLength: {
            value: 10,
            message: "About yourself must be at least 10 characters long",
          },
        })}
      />
    </div>
  );
});

export const StepTwo = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => {
  const { register } = useFormContext();

  return (
    <div className="flex flex-col gap-5" {...props} ref={ref}>
      <TextField
        label="Location"
        type="text"
        labelProps={{
          className: "font-medium",
        }}
        {...register("location", {
          required: "Location is required",
        })}
      />

      <TextField
        label="Twitter (optional)"
        type="text"
        labelProps={{
          className: "font-medium",
        }}
        {...register("twitter")}
      />

      <TextField
        label="Facebook (optional)"
        type="text"
        labelProps={{
          className: "font-medium",
        }}
        {...register("facebook")}
      />

      <TextField
        label="Instagram (optional)"
        type="text"
        labelProps={{
          className: "font-medium",
        }}
        {...register("instagram")}
      />
    </div>
  );
});
