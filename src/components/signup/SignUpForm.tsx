import Link from "next/link";
import React, { Fragment, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { fetchSecurity, login } from "~/service/ApiRequests";
import ErrorResponse from "~/service/ErrorResponse";
import { useRouter } from "next/router";
import localStorageService from "~/service/LocalstorageService";
import useGlobalStore from "~/store/useGlobalStore";
import { decryptResponse } from "~/helpers/helper";
import { ApiHandler } from "~/service/UtilService";
import MuiButton from "../MuiButton";
import loginicon from "../../assets/auth/login.svg";
import blktrade from "../../assets/navicons/blktrade.png";



import { useForm, Controller } from "react-hook-form";
import ExchangeInput from "../common/ExchangeInput";
import Button from "../common/Button";
import { type DropDownOptionsType } from "~/types/Common";
import { Autocomplete, Dialog, TextField } from "@mui/material";
import Image, { type StaticImageData } from "next/image";

import Close from "~/assets/general/close.svg";


interface FormData {
  firstName: string;
  lastName: string;
  dob: string;
  countryCode: string;
  mobileNumber: string;
  password: string;
  reEnterPassword: string;
  checkbox?: string;
}

interface SignupFormProps {
  setData: (data: FormData) => void;
  data: FormData;
  loading: boolean;
  countryList: DropDownOptionsType[];
  legalDocument: LegalDocuments[];
}


const SignupForm: React.FC<SignupFormProps> = ({
  setData,
  loading,
  countryList,
  legalDocument,
}) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    defaultValues: {
      countryCode: "1",
    },
  });

  const [open, setOpen] = useState<string>("");
  const [selectedLegalDocument, setSelectedLegalDocument] =
    useState<LegalDocuments | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = (data: FormData) => {
    setData(data);
  };
  const countryId = watch("countryCode");
  const password = watch("password");
  const countryValue = countryList?.find(
    (item) => Number(item.value) === Number(countryId),
  ) ?? {
    flag: "https://twemoji.maxcdn.com/2/svg/1f1e8-1f1e6.svg",
    label: "+1",
    value: 1,
  };

  const renderSections = (content: string) => {
    const sections = content.split(/<\/?h[1-6]>/g);

    return sections.map((section, index) => (
      <div key={index}>
        {section.startsWith("<h") ? (
          <h2
            className="my-4 text-lg font-medium"
            dangerouslySetInnerHTML={{ __html: section }}
          />
        ) : (
          <p dangerouslySetInnerHTML={{ __html: section }} />
        )}
      </div>
    ));
  };

  return (
    <>
      <Toaster />
      <div className="grid h-screen grid-cols-1 bg-white lg:grid-cols-2 p-4">
        <Dialog
          fullScreen
          open={open === "legalDocPopup"}
          onClose={() => {
            setOpen("");
            setSelectedLegalDocument(null);
          }}
        >
          <div className="">
            <div className=" m-auto w-[90%]">
              <div className="mt-8 flex justify-between pb-4">
                <p className=" m-auto text-sm font-bold sm:text-base lg:text-lg">
                  {selectedLegalDocument?.PolicyDocumentType?.displayName}
                </p>
                <button
                  onClick={() => {
                    setOpen("");
                  }}
                >
                  <div>
                    <Image src={Close as StaticImageData} alt="Close" />
                  </div>
                </button>
              </div>
              <div className="">
                <div className=" flex flex-col justify-between py-4 text-xs sm:text-sm lg:text-base">
                  {/* ================================== */}
                  {selectedLegalDocument ? (
                    <div>
                      <p className="my-4 text-xl font-semibold">
                        {selectedLegalDocument.title}
                      </p>
                      {renderSections(selectedLegalDocument.documentText)}
                    </div>
                  ) : null}

                  {/* =================================== */}
                </div>
              </div>
            </div>
          </div>
        </Dialog>
        {/* Left side: Form */}
        <div className="m-auto rounded  lg:w-[60%] my-6">
          <div className="flex flex-col gap-2">
            {/* {admin?.profileImgLink && ( */}
            <div className="logo relative flex items-center justify-center py-1 ">
              <Image
                alt={"Profile"}
                className=" object-cover"
                src={blktrade}
                width={"200"}
                height={"200"}
                priority={true}
              />
            </div>
            {/* )} */}
            <p className="text-center lg:text-[32px] font-medium text-xl pb-4">Signup</p>
            <p className="font-medium text-md lg:text-[20px]">Enter basic details</p>

            <form className="" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-2 lg:grid-cols-2 ">
                <div className="">
                  <ExchangeInput
                    control={control}
                    label="First name"
                    placeholder="Enter your first name"
                    name="firstName"
                    rules={{
                      required: "First name is required",
                      validate: (value: string) =>
                        value.trim() !== "" || "This field cannot be blank",
                    }}
                    type="text"
                  />
                </div>
                <div className="">
                  <ExchangeInput
                    control={control}
                    label="Last name"
                    placeholder="Enter your last name"
                    name="lastName"
                    rules={{
                      required: "First name is required",
                      validate: (value: string) =>
                        value.trim() !== "" || "This field cannot be blank",
                    }}
                    type="text"
                  />
                </div>
              </div>

              <div className=" grid grid-cols-1 gap-4 sm:flex-row">
                <ExchangeInput
                  control={control}
                  label="Date of birth"
                  name="dob"
                  rules={{ required: "Date of birth is required" }}
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="mt-4">
                <label htmlFor="mobileNumber" className="mb-0 block ">
                  Mobile number<span className="text-sm text-red-500 ps-1">*</span>
                </label>
                <div className="flex items-center  ">
                  <div style={{ height: "100%" }}>
                    <Controller
                      control={control}
                      name="countryCode"
                      rules={{
                        required: "Please select an asset",
                      }}
                      render={({
                        field: { value, onChange },
                        fieldState: { error },
                      }) => (
                        <Fragment>
                          <Autocomplete
                            size="small"
                            className="w-[150px]"
                            options={countryList}
                            onChange={(_, nextValue) => {
                              onChange(nextValue?.value ?? "");
                            }}
                            disableClearable
                            value={countryValue ? countryValue : undefined}
                            renderOption={(props, option) => (
                              <li
                                {...props}
                                className="flex cursor-pointer items-center gap-2 p-2"
                              >
                                <Image
                                  src={option.flag ?? ""}
                                  alt={option.label}
                                  width={30}
                                  height={30}
                                />
                                {option.label}
                              </li>
                            )}
                            renderInput={(params) => (
                              <TextField
                                className=" flex items-center gap-2  "
                                {...params}
                                placeholder="Country "
                                InputProps={{
                                  ...params.InputProps,
                                  startAdornment: (() => {
                                    return (
                                      <Fragment>
                                        {countryValue?.label && (
                                          <Image
                                            className="ml-2 h-5 w-4"
                                            src={countryValue?.flag ?? ""}
                                            alt={countryValue?.label ?? ""}
                                            width={30}
                                            height={30}
                                          />
                                        )}
                                      </Fragment>
                                    );
                                  })(),
                                }}
                                variant="outlined"
                              />
                            )}
                          />
                          <p className="text-sm text-red-500">
                            {error?.message}
                          </p>
                        </Fragment>
                      )}
                    />
                  </div>
                  <div className="rounded border border-[#c4c4c4] w-[100%]">
                    <Controller
                      name="mobileNumber"
                      control={control}
                      rules={{
                        required: "Mobile number is required",
                        pattern: {
                          value: /^[0-9]*$/,
                          message:
                            "Mobile number should contain only numbers",
                        },
                        minLength: {
                          value: 3,
                          message:
                            "Mobile number should contain only 10 digits",
                        },
                      }}
                      render={({ field }) => (
                        <div className="w-100">
                          <input
                            id="mobileNumber"
                            className="rounded-md w-[100%]  px-4 py-2  outline-none placeholder:text-sm placeholder:font-normal"
                            {...field}
                            value={field.value || ""}
                            placeholder="9999 999 999"
                          />
                        </div>
                      )}
                    />
                  </div>
                </div>
                <p className="text-xs text-red-500">
                  {errors?.mobileNumber?.message}
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-2 mt-4">
                <div>
                  <ExchangeInput
                    control={control}
                    label="Enter password"
                    name="password"
                    rules={{
                      required: "Password is required",
                      validate: (value: string) => {
                        const hasSmallLetter = /[a-z]/.test(value);
                        const hasCapitalLetter = /[A-Z]/.test(value);
                        const hasNumber = /\d/.test(value);
                        const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(value);

                        return (
                          (value.length >= 6 &&
                            hasSmallLetter &&
                            hasCapitalLetter &&
                            hasNumber &&
                            hasSymbol) ||
                          "Password should meet the specified criteria"
                        );
                      },
                    }}
                    type="password"
                    placeholder="**************"
                  />
                </div>

                <div>
                  <ExchangeInput
                    control={control}
                    label="Re-enter password"
                    name="reEnterPassword"
                    rules={{
                      required: "Please re-enter your password",
                      validate: (value: string) =>
                        value === password || "Passwords do not match",
                    }}
                    type="password"
                    placeholder="**************"
                  />
                </div>
                <p className=" break-all text-xs font-normal text-gray-400">
                  <span className=" font-bold">Password Criteria:</span>{" "}
                  Should contain at least one Capital Letter,
                  <br /> one Small Letter, one Number & one Symbol
                </p>
              </div>

              <div className="mt-4">
                <Controller
                  name="checkbox"
                  control={control}
                  rules={{
                    required:
                      "You must agree to terms and conditions and privacy policy",
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          {...field}
                          value={field.value ?? ""}
                          className="mt-[2px] cursor-pointer"
                        />
                        <div className="flex items-center flex-wrap md:text-sm text-xs">
                          I agree to the{" "}
                          {legalDocument
                            .filter(
                              (item) => item?.PolicyDocumentType?.id === 1,
                            )
                            .map((item, i) => (
                              <div key={i}>
                                <span className="md:text-sm text-xs"> </span>
                                {item?.documentText !== "" ? (
                                  <span
                                    onClick={() => {
                                      setSelectedLegalDocument(item);
                                      setOpen("legalDocPopup");
                                    }}
                                    className=" mx-1 cursor-pointer md:text-sm text-xs text-[#C1922E]"
                                  >
                                    Terms and conditions
                                  </span>
                                ) : (
                                  <Link
                                    target="_blank"
                                    href={item?.documentLink}
                                    className="mx-1 md:text-sm text-xs font-semibold text-[#C1922E]"
                                  >
                                    Terms and conditions
                                  </Link>
                                )}
                              </div>
                            ))}
                          {legalDocument
                            .filter(
                              (item) => item?.PolicyDocumentType?.id === 2,
                            )
                            .map((item, i) => (
                              <div key={i}>
                                {item?.documentText !== "" ? (
                                  <p
                                    onClick={() => {
                                      setSelectedLegalDocument(item);
                                      setOpen("legalDocPopup");
                                    }}
                                    className=" cursor-pointer md:text-sm text-xs text-[#C1922E]"
                                  >
                                    <span className=" mx-1 text-black">
                                      and
                                    </span>
                                    Privacy policy
                                  </p>
                                ) : (
                                  <Link
                                    target="_blank"
                                    href={item.documentLink}
                                    className="md:text-sm text-xs font-semibold text-[#C1922E]"
                                  >
                                    <span className=" mx-1 text-black">
                                      and
                                    </span>
                                    Privacy policy
                                  </Link>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                      <p className="mt-4 text-xs text-red-500">
                        {error?.message}
                      </p>
                    </div>
                  )}
                />
              </div>

              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <p>
                  Already registered?{" "}
                  <Link
                    className=" font-semibold text-[#C1922E]"
                    href="/auth/login"
                  >
                    Login
                  </Link>{" "}
                </p>
                <MuiButton
                  name="Continue"
                  loading={isLoading}
                  borderColor="black"
                  background="black"
                  color="white"
                  borderRadius="0.3rem"
                  type="submit"
                  style={{ padding: "10px 50px", marginBottom: '10px' }}
                  className="sm:w-[0%] w-full"
                />
              </div>
            </form>
          </div>
        </div>

        {/* Right side: Image */}
        <div className="hidden h-full w-full lg:block">
          <Image
            src={loginicon}
            alt="Login illustration"
            className="h-full w-full"
          />
        </div>
      </div>
    </>
  );
};

export default SignupForm;
