import { AuthScreenLayout, IllustrationSection, StepOne, StepTwo } from "components";
import Image from "next/image";

import React, { useState } from "react";

import { AvatarUploader, Button, CoverUploader } from "@votewise/ui";

import type { NextPageWithLayout } from "./_app";

const TOTAL_STEPS = 2;

const Page: NextPageWithLayout = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const handleOnNextClick = () => {
    if (currentStep === TOTAL_STEPS) {
      // TODO: Make request to backend
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handleOnPrevious = () => {
    setCurrentStep((state) => state - 1);
  };

  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="flex flex-col items-center">
          <figure>
            <Image src="/logo.png" alt="Logo" width={202} height={16} />
          </figure>
          <div className="mt-7 text-gray-800">
            <form className="shadow-auth-form flex w-[calc((546/16)*1rem)] flex-col gap-7 rounded-lg bg-white p-12">
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="mb-5 text-center text-3xl font-bold text-gray-800">
                    Tell us more about you
                  </h2>

                  {/* TODO: Move Avatar picker and Cover picker to UI package */}
                  {currentStep === 1 && <AvatarUploader />}
                  {currentStep === 2 && <CoverUploader />}
                </div>

                <div className="flex flex-col gap-5">
                  {currentStep === 1 && <StepOne />}
                  {currentStep === 2 && <StepTwo />}
                </div>
              </div>

              <div>
                <Button onClick={handleOnNextClick} type="button">
                  Next
                </Button>
                {currentStep !== 1 && (
                  <Button className="bg-transparent text-gray-600" onClick={handleOnPrevious}>
                    Previous
                  </Button>
                )}
              </div>
            </form>
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
