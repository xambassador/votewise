import cookie from "cookie";

import type { GetServerSidePropsContext } from "next";
import Image from "next/image";
import { useRouter } from "next/router";

import React, { useCallback, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";

import { Button, makeToast } from "@votewise/ui";

import { AuthScreenLayout } from "components/AuthScreenLayout";
import { ErrorMessage } from "components/ErrorMessage";
import { IllustrationSection } from "components/IllustrationSection";
import { StepOne, StepTwo } from "components/onboarding";
import { AvatarPicker } from "components/onboarding/AvatarPicker";
import { CoverPicker } from "components/onboarding/CoverPicker";

import { getCookie } from "server/lib/getCookie";
import { getServerSession } from "server/lib/getServerSession";

import { getOnboardingStatus } from "server/services/onboarding";
import { onboardUser } from "services/onboarding";

import type { NextPageWithLayout } from "./_app";

const TOTAL_STEPS = 2;

type FormValues = {
  username: string;
  name: string;
  gender: {
    value: "MALE" | "FEMALE" | "OTHER";
  };
  about: string;
  location: string;
  twitter: string;
  instagram: string;
  facebook: string;
  apiError: string;
  profile_image: string;
  cover_image: string;
};

const Page: NextPageWithLayout = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [status, setStatus] = useState<"idle" | "pending" | "resolved" | "rejected">("idle");

  const methods = useForm<FormValues>();
  const {
    formState: { errors },
    clearErrors,
    setValue,
  } = methods;

  const handleOnNextClick: SubmitHandler<FormValues> = (data) => {
    const { trigger } = methods;
    trigger().then((isValid) => {
      if (isValid) {
        if (currentStep === TOTAL_STEPS) {
          setStatus("pending");
          onboardUser({ ...data, gender: data.gender.value })
            .then(() => {
              router.push("/");
              setStatus("resolved");
              makeToast(`Hello, ${data.name}. Welcome to votewise.`, "success");
            })
            .catch((err: any) => {
              methods.setError("apiError", {
                message: err.response.data.message,
              });
              setStatus("rejected");
            });
          return;
        }
        setCurrentStep((prev) => prev + 1);
      }
    });
  };

  const handleOnPrevious = () => {
    setCurrentStep((state) => state - 1);
  };

  const handleOnFetchingUsername = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const resetErrors = () => {
    clearErrors("apiError");
  };

  const handleOnUploadSuccess = (url: string, type: "profile" | "cover") => {
    if (type === "profile") {
      setValue("profile_image", url);
    }
    setValue("cover_image", url);
  };

  const handleOnError = useCallback((isErr: boolean) => {
    setIsError(isErr);
  }, []);

  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="flex flex-col items-center">
          <figure>
            <Image src="/logo.png" alt="Logo" width={202} height={16} />
          </figure>
          <div className="mt-7 text-gray-800">
            <FormProvider {...methods}>
              <form
                className="shadow-auth-form flex w-[calc((546/16)*1rem)] flex-col gap-7 rounded-lg bg-white p-12"
                onSubmit={methods.handleSubmit(handleOnNextClick)}
              >
                <div className="flex flex-col gap-5">
                  <div>
                    {errors.apiError && (
                      <ErrorMessage resetErrors={resetErrors}>{errors.apiError.message}</ErrorMessage>
                    )}
                    <h2 className="mb-5 text-center text-3xl font-bold text-gray-800">
                      Tell us more about you
                    </h2>

                    {currentStep === 1 && (
                      <AvatarPicker onSuccess={(url) => handleOnUploadSuccess(url, "profile")} />
                    )}
                    {currentStep === 2 && (
                      <CoverPicker onSuccess={(url) => handleOnUploadSuccess(url, "cover")} />
                    )}
                  </div>

                  <div className="flex flex-col gap-5">
                    {currentStep === 1 && (
                      <StepOne onFetchingUsername={handleOnFetchingUsername} onError={handleOnError} />
                    )}
                    {currentStep === 2 && <StepTwo />}
                  </div>
                </div>

                <div>
                  <Button
                    type="submit"
                    isLoading={status === "pending"}
                    disabled={isLoading || isError || status === "pending"}
                  >
                    {currentStep === TOTAL_STEPS ? "Finish" : "Next"}
                  </Button>
                  {currentStep !== 1 && (
                    <Button className="bg-transparent text-gray-600" onClick={handleOnPrevious}>
                      Previous
                    </Button>
                  )}
                </div>
              </form>
            </FormProvider>
          </div>
        </div>
      </div>
      <div className="flex-1">
        <IllustrationSection />
      </div>
    </>
  );
};

Page.getLayout = (page) => <AuthScreenLayout>{page}</AuthScreenLayout>;

export default Page;

// TODO: Replace with auth guard
export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const { req, res } = context;
  const session = await getServerSession({ req, res });

  if (!session) {
    return {
      redirect: {
        destination: "/signin",
      },
    };
  }

  const { COOKIE_IS_ONBOARDED_KEY } = process.env;
  const isOnboarded = getCookie(req, "IS_ONBOARDED");
  if (isOnboarded === "true") {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const onboarded = await getOnboardingStatus(session.accessToken);
  if (onboarded) {
    res.setHeader("Set-Cookie", [
      cookie.serialize(COOKIE_IS_ONBOARDED_KEY as string, "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      }),
    ]);

    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
