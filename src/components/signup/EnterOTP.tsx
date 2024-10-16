import Link from "next/link";
import React, { Fragment, useState, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { fetchSecurity, login } from "~/service/ApiRequests";
import ErrorResponse from "~/service/ErrorResponse";
import { useRouter } from "next/router";
import localStorageService from "~/service/LocalstorageService";
import useGlobalStore from "~/store/useGlobalStore";
import { decryptResponse } from "~/helpers/helper";
import { ApiHandler } from "~/service/UtilService";
import MuiButton from "../MuiButton";
import blktrade from "../../assets/navicons/blktrade.png";
import { useForm, Controller } from "react-hook-form";
import ExchangeInput from "../common/ExchangeInput";
import Button from "../common/Button";
import { type DropDownOptionsType } from "~/types/Common";
import { Autocomplete, Dialog, TextField } from "@mui/material";
import Image, { type StaticImageData } from "next/image";

import Close from "~/assets/general/close.svg";
import AuthScreen from "../common/AuthScreen";

interface OtpInputProps {
  onOtpSubmit: (otp: string) => void;
  changeScreen: (screen: string) => void;
  phone: string;
  disableResendButton: boolean;
  resendOTP: () => void;
  time: string;
}

const OtpInput: React.FC<OtpInputProps> = ({
  phone,
  onOtpSubmit,
  changeScreen,
  disableResendButton,
  resendOTP,
  time,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const onSubmit = (data: any) => {
    const enteredOtp = Object.values(data).join("");
    onOtpSubmit(enteredOtp);
  };

  const focusNextInput = (index: number) => {
    if (inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const focusPrevInput = (index: number) => {
    if (inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <>
      <Toaster />
      <div className="grid h-screen grid-cols-1 bg-white p-4 lg:grid-cols-2">
        {/* Left side: Form */}
        <div className="m-auto my-6  rounded lg:w-[60%]">
          <div className="flex flex-col gap-2">
            <div className="logo relative flex items-center justify-center py-8 ">
              <Image
                alt={"Profile"}
                className=" object-cover"
                src={blktrade}
                width={"200"}
                height={"200"}
                priority={true}
              />
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4 text-3xl font-bold">Signup</div>
              <div className="mb-4 text-lg font-semibold">
                Verify your phone number
              </div>
              <div className="text-xs font-bold text-gray-400">
                Please enter a 6-digit number sent to {phone}
              </div>

              <div className="mb-2 mt-2 text-xs">
                OTP is valid for 10 minutes
              </div>
              <div className="mt-10 space-x-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <Controller
                    key={index}
                    name={`otp${index}`}
                    control={control}
                    defaultValue=""
                    rules={{
                      required: true,
                    }}
                    render={({ field }) => (
                      <input
                        {...field}
                        value={field.value || ""}
                        type="text"
                        maxLength={1}
                        className={`h-10 w-10 rounded-md border text-center xl:h-16 xl:w-16 ${
                          errors["otp" + index]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        onKeyDown={(e: any) => {
                          if (e.key === "Backspace") {
                            e.target.value === "" &&
                              setTimeout(() => focusPrevInput(index), 0);
                          } else if (/^\d$/.test(e.key)) {
                            setTimeout(() => focusNextInput(index), 0);
                          }
                        }}
                      />
                    )}
                  />
                ))}
              </div>
              {errors.otp0 && (
                <div className="text-sm text-red-500">OTP is required</div>
              )}
              <div className="mt-10 flex">
                <button
                  disabled={disableResendButton}
                  className={
                    disableResendButton
                      ? "text-gray-400"
                      : "text-yellow-600 hover:text-yellow-500"
                  }
                  type="button"
                  onClick={resendOTP}
                >
                  Resend
                </button>
                <span className="ml-auto text-yellow-600">{time}</span>
              </div>
              <div className="mt-20 flex">
                <button
                  type="button"
                  onClick={() => changeScreen("formScreen")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ml-auto rounded-md bg-[#000000] px-20 py-2 text-white hover:bg-yellow-500"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right side: Image */}
        <div className="hidden h-full w-full lg:block">
          {/* <Image
            src={loginicon}
            alt="Login illustration"
            className="h-full w-full"
          /> */}
          <AuthScreen />
        </div>
      </div>
    </>
  );
};

export default OtpInput;
