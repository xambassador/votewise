import { useStore } from "zustand";

import React, { useEffect, useRef, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";
import type { InfiniteData } from "react-query";

import type { GetMyPostsResponse, PostStatus } from "@votewise/types";
import { Avatar, Button, Image, Input } from "@votewise/ui";
import { Picture } from "@votewise/ui/icons";

import { ErrorMessage } from "components/ErrorMessage";

import { usePicker } from "lib/hooks/usePicker";
import store from "lib/store";

import { updatePost } from "services/user";

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

type Post = GetMyPostsResponse["data"]["posts"][0];

type FormValues = {
  title: string;
  content: string;
  status: PostStatus;
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
  children,
  className,
}: {
  files: File[];
  children?: React.ReactNode;
  className?: string;
  onSuccess: (url: string, file: File) => void;
}) {
  return (
    <PostModalFilesContainer className={className}>
      {files.map((file) => (
        <PostAsset file={file} key={file.name} onSuccess={onSuccess} />
      ))}
      {children}
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
  const defaultAssets = getValues("postAssets");
  const { current: assets } = useRef<{ url: string; type: string }[]>(defaultAssets);
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
          placeholder={`What's on your mind, ${user?.name}?`}
          {...register("content", {
            required: "Content is required",
            minLength: {
              value: 10,
              message: "Content must be at least 10 characters",
            },
          })}
        />
        <PostAssetsContainer
          files={files}
          onSuccess={handleOnSuccess}
          className={!files.length && !defaultAssets.length ? "mb-0" : ""}
        >
          {assets.map((asset) => (
            <div
              key={asset.url}
              className="relative h-[calc((100/16)*1rem)] w-[calc((100/16)*1rem)] overflow-hidden rounded-lg"
            >
              <Image src={asset.url} alt="Post Asset" width={100} height={100} className="rounded-lg" />
            </div>
          ))}
        </PostAssetsContainer>
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

type UpdatePostProps = {
  setOpen: (open: boolean) => void;
  post: Post;
  postStatus: "open" | "closed" | "archived" | "inprogress";
};

export function UpdatePost(props: UpdatePostProps) {
  const { setOpen, post, postStatus } = props;
  const user = useStore(store, (state) => state.user);
  const methods = useForm<FormValues>({
    defaultValues: {
      status: post.status,
      title: post.title,
      content: post.content,
      postAssets: post.post_assets,
      type: { ...options.find((o) => o.value === post.type) },
    },
  });
  const oldPost = useRef<typeof post | null>(post);

  const {
    register,
    setError,
    formState: { errors },
    clearErrors,
  } = methods;

  const queryClient = useQueryClient();

  const mutation = useMutation(
    (data: {
      title: string;
      content: string;
      status: PostStatus;
      type: "PUBLIC" | "GROUP_ONLY";
      postAssets: { url: string; type: string }[];
    }) =>
      updatePost(post.id, {
        content: data.content,
        post_assets: data.postAssets,
        status: data.status,
        title: data.title,
        type: data.type,
      }),
    {
      onMutate: (variables) => {
        queryClient.cancelQueries(["my-posts", postStatus]);
        const previousPosts = queryClient.getQueryData<InfiniteData<GetMyPostsResponse>>([
          "my-posts",
          postStatus,
        ]);
        queryClient.setQueryData<InfiniteData<GetMyPostsResponse>>(["my-posts", postStatus], (old) => ({
          ...(old as InfiniteData<GetMyPostsResponse>),
          pages: old?.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              posts: page.data.posts.map((p) => {
                if (p.id === post.id) {
                  return {
                    ...p,
                    title: variables.title,
                    content: variables.content,
                    post_assets: variables.postAssets,
                    updated_at: new Date(),
                    type: variables.type,
                    status: variables.status,
                  };
                }
                return p;
              }),
            },
          })) as GetMyPostsResponse[],
        }));

        return { previousPosts };
      },
      onSuccess: () => {
        setOpen(false);
      },
      onError: (error: any, variables, context) => {
        const msg = error?.response.data.error.message || "Something went wrong";
        setError("apiError", msg);
        if (context?.previousPosts) {
          queryClient.setQueryData(["my-posts", postStatus], context.previousPosts);
        }
      },
    }
  );

  const handleOnSubmit = async (data: FormValues) => {
    const newChanges = {
      content: data.content,
      postAssets: data.postAssets,
      status: data.status,
      title: data.title,
      type: data.type.value,
    };
    mutation.mutate(newChanges);
  };

  useEffect(
    () => () => {
      oldPost.current = null;
    },
    []
  );

  return (
    <PostModalContainer>
      <PostModalTitle>Update Post</PostModalTitle>
      <PostModalContent>
        <FormProvider {...methods}>
          <PostModalForm onSubmit={methods.handleSubmit(handleOnSubmit)}>
            <div className="flex gap-4">
              <Avatar src={user?.profile_image as string} rounded width={60} height={60} />
              <div className="flex flex-1 flex-col items-start">
                <h4 className="text-xl font-semibold text-gray-600">{user?.name}</h4>
                <PostTypeSelectMenu
                  options={options}
                  defaultOption={options.find((o) => o.value === post.type)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Input
                type="text"
                className="w-full rounded text-gray-600 placeholder:text-base placeholder:text-gray-400"
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
            <Button type="submit" isLoading={mutation.isLoading} disabled={mutation.isLoading}>
              Update
            </Button>
          </PostModalForm>
        </FormProvider>
      </PostModalContent>
    </PostModalContainer>
  );
}
