import type { AxiosError } from "axios";

import React, { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useQuery } from "react-query";

import type { ErrorResponse } from "@votewise/types";
import { Loader, SelectField, TextAreaField, TextField } from "@votewise/ui";

import { useDebounce } from "lib/hooks/useDebounce";

import { checkUsernameAvailability } from "services/user";

const options = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

export function StepOne({
  onFetchingUsername,
  onError,
}: {
  onFetchingUsername: (isLoading: boolean) => void;
  onError: (isError: boolean) => void;
}) {
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
    <>
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
          <div className="mt-1 flex items-center">
            <span className="text-sm text-gray-500">Checking username availability...</span>
            <Loader loaderColor="#1763AB" className="ml-2 h-4 w-4" />
          </div>
        )}
        {isSuccess && <span className="text-sm text-green-600">{data.data.message}</span>}
        {isError && error && (
          <span className="text-sm text-red-600">{error.response?.data.error.message}</span>
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
    </>
  );
}

export function StepTwo() {
  const { register } = useFormContext();

  return (
    <>
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
    </>
  );
}
