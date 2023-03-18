import { useStore } from "zustand";

import React, { useEffect, useId, useState } from "react";
import { Controller, FormProvider, useForm, useFormContext } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";

import type { GetPostsResponse, MyDetailsResponse } from "@votewise/types";
import {
  Avatar,
  Button,
  Image,
  Input,
  ModalTitle,
  TextArea,
  Thumbnail,
  UnstyledSelect,
  makeToast,
} from "@votewise/ui";
import { FiGlobe, Picture } from "@votewise/ui/icons";

import { ErrorMessage } from "components/ErrorMessage";

import { usePicker } from "lib/hooks/usePicker";
import store from "lib/store";

import { createPost } from "services/user";

const options = [
  { label: "Public", value: "PUBLIC" },
  { label: "Group Only", value: "GROUP_ONLY" },
];

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

function PostTypeSelectMenu() {
  const { control } = useFormContext<FormValues>();
  return (
    <div className="flex items-center">
      <FiGlobe className="h-5 w-5 text-gray-500" />
      <div className="w-28">
        <Controller
          name="type"
          control={control}
          defaultValue={options[0] as { label: string; value: "PUBLIC" | "GROUP_ONLY" }}
          render={({ field }) => (
            <UnstyledSelect options={options} className="text-left" defaultValue={options[0]} {...field} />
          )}
        />
      </div>
    </div>
  );
}

function PostAsset({ file, onSuccess }: { file: File; onSuccess: (url: string, file: File) => void }) {
  const onFileUploadSuccess = (url: string) => {
    onSuccess(url, file);
  };

  const { handleOnReady } = usePicker(onFileUploadSuccess);

  useEffect(() => {
    handleOnReady(file);
  }, [file, handleOnReady]);

  return (
    <Thumbnail
      file={file}
      render={(url) =>
        url && <Image src={url} alt="Post Asset" width={100} height={100} className="rounded-lg" />
      }
    />
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
    <div className="mb-4 grid max-h-[calc((150/16)*1rem)] w-full grid-cols-4 gap-2 overflow-y-auto px-4">
      {files.map((file) => (
        <PostAsset file={file} key={file.name} onSuccess={onSuccess} />
      ))}
    </div>
  );
}

function PostEditor() {
  const {
    register,
    formState: { errors },
    setValue,
    getValues,
  } = useFormContext<FormValues>();
  const id = useId();
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
      <div className="relative overflow-hidden rounded-lg border border-gray-200">
        <TextArea
          placeholder="What's in your mind, Naomi?"
          className="h-[calc((120/16)*1rem)] resize-none border-none text-gray-600 placeholder:text-base placeholder:text-gray-400 focus:ring-0"
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
          <input
            type="file"
            accept="image/*,video/*"
            className="hidden"
            id={id}
            multiple
            onChange={handleOnChange}
          />
          <label htmlFor={id} className="cursor-pointer text-gray-600">
            Photo / Video
          </label>
        </div>
      </div>
      {errors.content && <p className="text-left text-red-600">{errors.content.message}</p>}
    </>
  );
}

export function CreatePost({ setOpen }: { setOpen: (open: boolean) => void }) {
  const user = useStore(store, (state) => state.user);
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
      onMutate: (variables) => {
        const { title, content, type, status, postAssets } = variables;
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        queryClient.cancelQueries("posts");
        queryClient.cancelQueries("user-info");

        // Snapshot the previous value
        const previousPosts = queryClient.getQueryData<GetPostsResponse>("posts");
        const previousUserInfo = queryClient.getQueriesData<MyDetailsResponse>("user-info");

        // Optimistically update to the new value
        if (previousPosts) {
          queryClient.setQueryData<GetPostsResponse>("posts", (old) => ({
            ...(old as GetPostsResponse),
            data: {
              ...(old?.data as GetPostsResponse["data"]),
              posts: [
                {
                  id: 1101,
                  title,
                  content,
                  upvotes_count: 0,
                  type: type.value,
                  status,
                  author: {
                    location: user?.location as string,
                    name: user?.name as string,
                    profile_image: user?.profile_image as string,
                  },
                  author_id: user?.id as number,
                  comments_count: 0,
                  created_at: new Date(),
                  group_id: null,
                  post_assets: [
                    ...(postAssets?.map((asset) => ({
                      id: 1101,
                      url: asset.url,
                    })) as { url: string }[]),
                  ],
                  slug: title,
                  updated_at: new Date(),
                },
                ...(old?.data.posts as GetPostsResponse["data"]["posts"]),
              ],
            },
          }));
        }

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
        return { previousPosts, previousUserInfo };
      },
      onSuccess: () => {
        makeToast("Post created successfully", "success");
        setOpen(false);
      },
      onError: (error: any, variables, context) => {
        const message = error?.response.data.error.message || "Something went wrong";
        setError("apiError", { message });
        // If the mutation fails, use the context returned from onMutate to roll back
        queryClient.setQueryData("posts", context?.previousPosts);
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
    <div className="shadow-notification-container flex w-[calc((510/16)*1rem)] flex-col items-start gap-7 rounded-lg bg-white p-8">
      <ModalTitle>Create Post</ModalTitle>
      <div className="flex w-full flex-col gap-8">
        <FormProvider {...methods}>
          <form className="flex w-full flex-col gap-8" onSubmit={methods.handleSubmit(handleOnSubmit)}>
            <div className="flex gap-4">
              <Avatar src={user?.profile_image as string} rounded width={60} height={60} />
              <div className="flex flex-1 flex-col items-start">
                <h4 className="text-xl font-semibold text-gray-600">Naomi Yosida</h4>
                <PostTypeSelectMenu />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <Input
                type="text"
                className="w-full rounded placeholder:text-base placeholder:text-gray-400"
                placeholder="Give the title to your idea."
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
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
