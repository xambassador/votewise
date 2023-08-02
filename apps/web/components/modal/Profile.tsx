import { useStore } from "zustand";

import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { classNames } from "@votewise/lib";
import { Avatar, Button, EmailField, Image, Input, InputField, TextAreaField } from "@votewise/ui";
import { FiFacebook, FiInstagram, FiTwitter } from "@votewise/ui/icons";

import store from "lib/store";

type Form = {
  email: string;
  name: string;
  about: string;
  location: string;
  apiError: string;
};

const socials = [
  {
    name: "facebook",
    icon: FiFacebook,
  },
  {
    name: "instagram",
    icon: FiInstagram,
  },
  {
    name: "twitter",
    icon: FiTwitter,
  },
];

function SocialButtonPanel() {
  const user = useStore(store, (state) => state.user);
  const [currentSocial, setCurrentSocial] = useState("facebook");

  const getSocialUrl = (social: string) => {
    switch (social) {
      case "facebook":
        return user?.facebook;
      case "instagram":
        return user?.instagram;
      case "twitter":
        return user?.twitter;
      default:
        throw new Error("Invalid social");
    }
  };

  return (
    <>
      <div className="flex gap-6">
        {socials.map((social) => (
          <button
            key={social.name}
            type="button"
            className={classNames(
              "flex h-8 w-8 flex-col items-center justify-center rounded-full transition-colors duration-200 hover:bg-gray-200",
              currentSocial === social.name && "bg-gray-800 hover:bg-gray-600"
            )}
            onClick={() => setCurrentSocial(social.name)}
          >
            <social.icon
              className={classNames("h-5 w-5 text-gray-500", currentSocial === social.name && "text-white")}
            />
          </button>
        ))}
      </div>

      <div className="mt-2">
        <Input type="text" name="social-url" placeholder={getSocialUrl(currentSocial)} />
      </div>
    </>
  );
}

export function Profile({ setOpen }: { setOpen: (open: boolean) => void }) {
  const user = useStore(store, (state) => state.user);
  const methods = useForm<Form>({
    defaultValues: {
      email: user?.email,
      name: user?.name,
      about: user?.about,
      location: user?.location,
    },
  });

  const handleOnSubmit = () => {
    // TODO: Update user profile
  };

  const { handleSubmit, register } = methods;

  return (
    <div className="flex w-[calc((768/16)*1rem)] max-w-3xl flex-col gap-7 rounded-lg bg-white p-7">
      <div className="relative mb-7 w-full">
        <figure className="h-60 w-full overflow-hidden rounded-lg">
          <Image src={user?.cover_image as string} alt="Profile banner" width={768} height={240} />
        </figure>
        <div className="absolute left-1/2 -bottom-8 -translate-x-1/2">
          <Avatar src={user?.profile_image as string} width={80} height={80} withStroke />
        </div>
      </div>
      <FormProvider {...methods}>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit(handleOnSubmit)}>
          <div className="flex flex-col gap-5">
            <EmailField
              label="Email"
              placeholder={user?.email}
              className="text-gray-600"
              labelProps={{
                className: "text-left font-medium",
              }}
              {...register("email")}
            />
            <InputField
              type="text"
              placeholder={user?.name}
              label="Name"
              className="text-gray-600"
              labelProps={{
                className: "text-left font-medium",
              }}
              {...register("name")}
            />
            <TextAreaField
              label="About"
              labelProps={{
                className: "text-left font-medium",
              }}
              className="resize-none text-gray-600"
              placeholder={user?.about}
              {...register("about")}
            />
            <InputField
              type="text"
              placeholder={user?.location}
              label="Location"
              className="text-gray-600"
              labelProps={{
                className: "text-left font-medium",
              }}
              {...register("location")}
            />

            <SocialButtonPanel />
          </div>
          <div className="flex items-center justify-center gap-7">
            <Button secondary className="w-fit py-4 px-5" onClick={() => setOpen(false)}>
              Cancle
            </Button>
            <Button className="w-fit py-4 px-5">Save</Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
