import cookie from "cookie";

import type { GetServerSidePropsContext } from "next";
import Image from "next/image";
import { useRouter } from "next/router";

import React, { useCallback, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";

import { AvatarUploader, Button, CoverUploader } from "@votewise/ui";
import { FiX as CloseIcon } from "@votewise/ui/icons";

import { AuthScreenLayout, IllustrationSection, StepOne, StepTwo } from "components";

import { getCookie } from "server/lib/getCookie";
import { getServerSession } from "server/lib/getServerSession";

import { getOnboardingStatus } from "server/services/onboarding";
import { onboardUser } from "services/user";

import type { NextPageWithLayout } from "./_app";

const TOTAL_STEPS = 2;

type FormValues = {
  username: string;
  name: string;
  gender: {
    value: string;
  };
  about: string;
  location: string;
  twitter: string;
  instagram: string;
  facebook: string;
  apiError: string;
};

const Page: NextPageWithLayout = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const methods = useForm<FormValues>();
  const {
    formState: { errors },
    clearErrors,
  } = methods;

  const handleOnNextClick: SubmitHandler<FormValues> = (data) => {
    const { trigger } = methods;
    trigger().then((isValid) => {
      if (isValid) {
        if (currentStep === TOTAL_STEPS) {
          onboardUser({ ...data, gender: data.gender.value })
            .then(() => {
              router.push("/");
            })
            .catch((err: any) => {
              methods.setError("apiError", {
                message: err.response.data.message,
              });
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
                      <div className="mb-2 flex items-center justify-center text-red-600">
                        <p>{errors.apiError.message}</p>
                        <button type="button" onClick={resetErrors} className="ml-2">
                          <CloseIcon className="text-gray-500" />
                        </button>
                      </div>
                    )}
                    <h2 className="mb-5 text-center text-3xl font-bold text-gray-800">
                      Tell us more about you
                    </h2>

                    {/* TODO: Move Avatar picker and Cover picker to UI package */}
                    {currentStep === 1 && <AvatarUploader />}
                    {currentStep === 2 && <CoverUploader />}
                  </div>

                  <div className="flex flex-col gap-5">
                    {currentStep === 1 && <StepOne onFetchingUsername={handleOnFetchingUsername} />}
                    {currentStep === 2 && <StepTwo />}
                  </div>
                </div>

                <div>
                  <Button type="submit" disabled={isLoading}>
                    Next
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

  const onboarded = await getOnboardingStatus(session.userId, session.accessToken);
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
