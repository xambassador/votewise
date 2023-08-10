import { useStore } from "zustand";

import { useRouter } from "next/router";

import React, { useEffect, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";

import type { MyDetailsResponse } from "@votewise/types";
import { Avatar, Button, Image, Input, makeToast } from "@votewise/ui";
import { Picture } from "@votewise/ui/icons";

import { ErrorMessage } from "components/ErrorMessage";

import { usePicker } from "lib/hooks/usePicker";
import store from "lib/store";

import { createPost } from "services/user";

import {
  PostModalContainer,
  PostModalContent,
  PostModalEditor,
  PostModalFileUploaderInput,
  PostModalFilesContainer,
  PostModalForm,
  PostModalImagePreview,
  PostModalLoader,
  PostModalTextArea,
  PostModalTitle,
  PostTypeSelectMenu,
} from "./Post";

const options = [
  { label: "Public", value: "PUBLIC" },
  { label: "Group Only", value: "GROUP_ONLY" },
] as { label: string; value: "PUBLIC" | "GROUP_ONLY" }[];

type FormValues = {
  title: string;
  content: string;
  status: "OPEN"; // NOTE: Right now sending status as OPEN, it can be change from profile page
  type: {
    label: string;
    value: "PUBLIC" | "GROUP_ONLY";
  };
  postAssets: { url: string; type: string }[];
  apiError: string;
};

function PostAsset({ file, onSuccess }: { file: File; onSuccess: (url: string, file: File) => void }) {
  const onFileUploadSuccess = (url: string) => {
    onSuccess(url, file);
  };

  const { handleOnReady, status } = usePicker(onFileUploadSuccess);

  useEffect(() => {
    handleOnReady(file);
  }, [file, handleOnReady]);

  return (
    <div className="relative h-[calc((100/16)*1rem)] w-[calc((100/16)*1rem)] overflow-hidden rounded-lg">
      {status === "pending" && <PostModalLoader />}
      <PostModalImagePreview
        file={file}
        render={(url) =>
          url && <Image src={url} alt="Post Asset" width={100} height={100} className="rounded-lg" />
        }
      />
    </div>
  );
}

function PostAssetsContainer({
  files,
  onSuccess,
}: {
  files: File[];
  onSuccess: (url: string, file: File) => void;
}) {
  return (
    <PostModalFilesContainer>
      {files.map((file) => (
        <PostAsset file={file} key={file.name} onSuccess={onSuccess} />
      ))}
    </PostModalFilesContainer>
  );
}

function PostEditor() {
  const user = useStore(store, (state) => state.user);
  const {
    register,
    formState: { errors },
    setValue,
    getValues,
  } = useFormContext<FormValues>();
  const [files, setFiles] = useState<File[]>([]);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const handleOnSuccess = (url: string, file: File) => {
    const values = getValues("postAssets");
    const newValues = values ? [...values, { url, type: file.type }] : [{ url, type: file.type }];
    setValue("postAssets", newValues);
  };

  return (
    <>
      <PostModalEditor>
        <PostModalTextArea
          placeholder={`What's in your mind, ${user?.name}?`}
          {...register("content", {
            required: "Content is required",
            minLength: {
              value: 10,
              message: "Content must be at least 10 characters",
            },
          })}
        />
        {files.length > 0 && <PostAssetsContainer files={files} onSuccess={handleOnSuccess} />}
        <div className="flex items-center gap-2 pb-4 pl-4">
          <Picture />
          <PostModalFileUploaderInput
            inputProps={{
              onChange: handleOnChange,
            }}
          />
        </div>
      </PostModalEditor>
      {errors.content && <p className="text-left text-red-600">{errors.content.message}</p>}
    </>
  );
}

export function CreatePost({ setOpen }: { setOpen: (open: boolean) => void }) {
  const user = useStore(store, (state) => state.user);
  const router = useRouter();
  const methods = useForm<FormValues>({
    defaultValues: {
      status: "OPEN",
    },
  });
  const {
    register,
    setError,
    formState: { errors },
    clearErrors,
  } = methods;

  const queryClient = useQueryClient();
  const mutation = useMutation(
    (data: FormValues) =>
      createPost({
        title: data.title,
        content: data.content,
        type: data.type.value,
        status: data.status,
        postAssets: data.postAssets,
      }),
    {
      onMutate: () => {
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        queryClient.cancelQueries("user-info");

        // Snapshot the previous value
        const previousUserInfo = queryClient.getQueryData<MyDetailsResponse>("user-info");

        // Optimistically update to the new value
        if (previousUserInfo) {
          queryClient.setQueryData<MyDetailsResponse>("user-info", (old) => ({
            ...(old as MyDetailsResponse),
            data: {
              ...(old?.data as MyDetailsResponse["data"]),
              user: {
                ...(old?.data.user as MyDetailsResponse["data"]["user"]),
                posts: old?.data ? old.data.user.posts + 1 : 0,
              },
            },
          }));
        }

        // Return a context object with the snapshotted value
        return { previousUserInfo };
      },
      onSuccess: (data, formValues) => {
        makeToast(`Your post ${formValues.title} has been published.`, "success");
        const { pathname } = router;
        if (pathname !== "/") {
          router.push("/");
        }
        setOpen(false);
      },
      onError: (error: any, variables, context) => {
        const message = error?.response.data.error.message || "Something went wrong";
        setError("apiError", { message });
        // If the mutation fails, use the context returned from onMutate to roll back
        queryClient.setQueryData("user-info", context?.previousUserInfo);
      },
      onSettled: () => {
        // Always refetch after error or success:
        queryClient.invalidateQueries("posts");
        queryClient.invalidateQueries("user-info");
      },
    }
  );

  const handleOnSubmit = async (data: FormValues) => {
    mutation.mutate(data);
  };

  const { isLoading } = mutation;

  return (
    <PostModalContainer>
      <PostModalTitle>Create Post</PostModalTitle>
      <PostModalContent>
        <FormProvider {...methods}>
          <PostModalForm onSubmit={methods.handleSubmit(handleOnSubmit)}>
            <div className="flex gap-4">
              <Avatar src={user?.profile_image as string} rounded width={60} height={60} />
              <div className="flex flex-1 flex-col items-start">
                <h4 className="text-xl font-semibold text-gray-600">{user?.name}</h4>
                <PostTypeSelectMenu options={options} defaultOption={options[0]} />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Input
                type="text"
                className="w-full rounded text-gray-600 placeholder:text-base placeholder:text-gray-400"
                placeholder="Give the title to your idea."
                // eslint-disable-next-line jsx-a11y/tabindex-no-positive
                tabIndex={1}
                {...register("title", {
                  required: "Title is required",
                  minLength: {
                    value: 10,
                    message: "Title must be at least 10 characters",
                  },
                })}
              />
              {errors.title && <p className="text-left text-red-600">{errors.title.message}</p>}
              <PostEditor />
            </div>

            {errors.apiError && (
              <ErrorMessage resetErrors={() => clearErrors("apiError")} className="items-start">
                {errors.apiError.message}
              </ErrorMessage>
            )}
            <Button type="submit" isLoading={isLoading} disabled={isLoading}>
              Create
            </Button>
          </PostModalForm>
        </FormProvider>
      </PostModalContent>
    </PostModalContainer>
  );
}
