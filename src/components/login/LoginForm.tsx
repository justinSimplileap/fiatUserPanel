import Link from "next/link";
import React, { Fragment, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import ExchangeInput from "../common/ExchangeInput";
import toast, { Toaster } from "react-hot-toast";
import { fetchCountries, fetchSecurity, login } from "~/service/ApiRequests";
import ErrorResponse from "~/service/ErrorResponse";
import { useRouter } from "next/router";
import localStorageService from "~/service/LocalstorageService";
import useGlobalStore from "~/store/useGlobalStore";
import { countryFlags, decryptResponse } from "~/helpers/helper";
import { ApiHandler } from "~/service/UtilService";
import MuiButton from "../MuiButton";
import Image from "next/image";

import blktrade from "../../assets/navicons/blktrade.png";
import { Autocomplete, TextField } from "@mui/material";
import {
  type DropDownOptionsResponseType,
  type DropDownOptionsType,
} from "~/types/Common";
import AuthScreen from "../common/AuthScreen";

interface FormData {
  emailOrPhone: string;
  password: string;
  countryCode: string;
}

const LoginForm: React.FC = () => {
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

  const router = useRouter();

  const [showEmailField, setShowEmailField] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string>("email");
  const [countryList, setCountryList] = useState<DropDownOptionsType[]>([]);

  const admin = useGlobalStore((state) => state.admin);
  const countryId = watch("countryCode");
  const submitData = async (data: FormData) => {
    const { emailOrPhone, password } = data;
    setIsLoading(true);
    try {
      const myIp = localStorageService.getIPAddress();
      const res_en = await login({
        phone: emailOrPhone,
        password,
        ipAddress: myIp ?? "",
      });

      const res = decryptResponse(res_en.data);

      if (res.success) {
        const [sec_res, error]: APIResult<Security> =
          await ApiHandler(fetchSecurity);
        localStorageService.setSecurityBody(sec_res?.body);
        const switchAccounts = [];

        if (res?.body?.id) {
          switchAccounts.push({
            id: res?.body?.id,
            fullname: res?.body?.fullname,
            email: res.body?.email,
            profileImgLink: res.body?.profileImgLink,
            token: res.body?.token,
            phone: res.body?.phone,
            isUserVerified: res.body?.isUserVerified,
            isCompanyVerified: res.body?.isCompanyVerified,
            tfaEnabled: res.body?.tfaEnabled,
            isAddressVerified: res.body?.isAddressVerified,
            isIdentityVerified: res.body?.isIdentityVerified,
            isEmailVerified: res.body?.isEmailVerified,
            priceList: res.body?.priceList,
            countryCode: res.body?.countryCode,
            userType: res.body?.userType,
          });
        }

        if (res?.body?.userType === "COMPANY") {
          res?.body?.projectUsers?.map((item: any) => {
            switchAccounts.push({
              fullname: item?.firstname,
              // email: item?.email,
              profileImgLink: item?.profileImgLink,
              token: item?.token,
              phone: item?.phone,
              isUserVerified: item?.isUserVerified,
              tfaEnabled: item?.tfaEnabled,
              isCompanyVerified: item?.isCompanyVerified,
              isAddressVerified: item?.isAddressVerified,
              isIdentityVerified: item?.isIdentityVerified,
              isEmailVerified: item?.isEmailVerified,
              priceList: item?.priceList,
              id: item?.id,
              countryCode: item?.countyCode,
              userType: item?.userType,
            });
          });
        }

        res.body?.allStaffs?.map((item: any) => {
          switchAccounts.push({
            fullname: item?.User?.firstname + " " + item?.User?.lastname,
            email: item?.User?.email,
            profileImgLink: item?.User?.profileImgLink,
            token: item?.User?.token,
            phone: item?.User?.phone,
            isUserVerified: item?.User?.isUserVerified,
            tfaEnabled: item?.User?.tfaEnabled,
            isCompanyVerified: item?.User?.isCompanyVerified,
            isAddressVerified: item?.User?.isAddressVerified,
            isIdentityVerified: item?.User?.isIdentityVerified,
            isEmailVerified: item?.User?.isEmailVerified,
            priceList: item?.User?.priceList,
            id: item?.User?.id,
            countryCode: item?.User?.countyCode,
            userType: item?.User?.userType,
          });

          item?.projectUsers?.map((item: any) => {
            switchAccounts.push({
              fullname: item?.firstname,
              // email: item?.email,
              profileImgLink: item?.profileImgLink,
              token: item?.token,
              phone: item?.phone,
              isUserVerified: item?.isUserVerified,
              tfaEnabled: item?.tfaEnabled,
              isCompanyVerified: item?.isCompanyVerified,
              isAddressVerified: item?.isAddressVerified,
              isIdentityVerified: item?.isIdentityVerified,
              isEmailVerified: item?.isEmailVerified,
              priceList: item?.priceList,
              id: item?.id,
              countryCode: item?.countyCode,
              userType: item?.userType,
            });
          });
        });

        localStorageService.encodeSwitchAccounts(switchAccounts);

        localStorageService.encodeAuthBody(res.body);
        localStorageService.setLocalAccessToken(res.body?.token);
        useGlobalStore.setState((prev) => ({
          ...prev,
          user: res.body,
        }));
        setIsLoading(false);
        toast.success("Login successful");
        router.push("/app/dashboard");
      }
    } catch (error) {
      const message = ErrorResponse(error);

      if (message === "Ip blocked") {
        router.push("/auth/ipBlocked");
      }
      setIsLoading(false);
      toast.error(message);
    }
  };

  const onSubmit = async (data: FormData) => {
    console.log("callled");
    console.log("showEmailField: ", showEmailField);

    console.log(" data.password: ", data.password);
    data.password && (await submitData(data));
  };

  const formattedData = (data: any) => {
    if (data.length > 0) {
      const finalList = data.map((val: DropDownOptionsResponseType) => ({
        value: val.countryCode,
        label: `+${val.countryCode}`,
        flag: countryFlags.find(
          (obj) => obj.countryCode === Number(val.countryCode),
        )?.flag,
      }));

      return finalList;
    }
  };

  const getCountryList = async () => {
    const [data] = await ApiHandler(fetchCountries);

    if (data?.success) {
      const body = data.body as Country[];

      if (body) {
        body.sort((a, b) => a.countryCode - b.countryCode);
        setCountryList(formattedData(body));
      }
    }

    return [];
  };

  const emailOrPhone = watch("emailOrPhone");

  useEffect(() => {
    getCountryList();
  }, []);

  const countryValue = countryList?.find(
    (item) => Number(item.value) === Number(countryId),
  ) ?? {
    flag: "https://twemoji.maxcdn.com/2/svg/1f1e8-1f1e6.svg",
    label: "+1",
    value: 1,
  };

  return (
    <>
      <Toaster />
      <div className="grid h-screen grid-cols-1 bg-white lg:grid-cols-2">
        {/* Left side: Form */}
        <div className="m-auto rounded  md:w-[50%]">
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
            <p className="text-center text-[32px] font-medium">
              Login to Your Account
            </p>

            <div className="flex space-x-4 bg-[#F9F9F9] p-2">
              <MuiButton
                color={`${selectedOption === "email" ? "white" : "black"}`}
                background={`${
                  selectedOption === "email" ? "#C1922E" : "white"
                }`}
                borderColor={`${
                  selectedOption === "email" ? "#C1922E" : "white"
                }`}
                className="w-1/2"
                name="Email ID"
                borderRadius="0.1rem"
                type="button"
                onClick={() => setSelectedOption("email")}
              />
              <MuiButton
                color={`${selectedOption === "phone" ? "white" : "black"}`}
                background={`${
                  selectedOption === "phone" ? "#C1922E" : "white"
                }`}
                borderColor={`${
                  selectedOption === "phone" ? "#C1922E" : "white"
                }`}
                className="w-1/2"
                name="Mobile Number"
                borderRadius="0.1rem"
                type="button"
                onClick={() => setSelectedOption("phone")}
              />
            </div>

            <form className="" onSubmit={handleSubmit(onSubmit)}>
              {selectedOption === "email" ? (
                <div className="">
                  <ExchangeInput
                    control={control}
                    placeholder="Enter your email address..."
                    label="Email Address"
                    name="emailOrPhone"
                    type="text"
                    rules={{
                      required: "Email is required",
                    }}
                  />
                </div>
              ) : (
                <div className="mt-4">
                  <label htmlFor="mobileNumber" className="mb-0 block ">
                    Mobile number
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
                              className="w-[120px]"
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
                    <div className="w-full rounded border border-[#c4c4c4]">
                      <Controller
                        name="emailOrPhone"
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
                          <div className="w-1/2">
                            <input
                              id="emailOrPhone"
                              className="rounded-md  px-4 py-2  outline-none placeholder:text-sm placeholder:font-normal"
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
                    {errors?.emailOrPhone?.message}
                  </p>
                </div>
              )}

              <div className="">
                <ExchangeInput
                  control={control}
                  label="Enter password"
                  name="password"
                  type="password"
                  rules={{
                    required: "Password is required",
                  }}
                />
              </div>

              <div className="my-3 flex items-center justify-between">
                <label className="cursor-pointer text-gray-400">
                  <input type="checkbox" /> Remember me
                </label>
                <p className="cursor-pointer font-semibold  text-[#C3922E]">
                  Forget Password?
                </p>
              </div>

              <div className="grid grid-flow-col">
                <MuiButton
                  name="Login"
                  loading={isLoading}
                  disabled={isLoading}
                  borderColor="black"
                  background="black"
                  color="white"
                  borderRadius="0.3rem"
                  type="submit"
                />
              </div>
            </form>

            <p className=" text-sm">
              Not registered?
              <Link
                className="mx-2 font-bold text-[#C3922E]"
                href="/auth/signup"
              >
                Signup here
              </Link>
            </p>
          </div>
        </div>

        {/* Right side: Image */}
        <AuthScreen />
      </div>
    </>
  );
};

export default LoginForm;
