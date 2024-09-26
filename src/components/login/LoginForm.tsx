import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import ExchangeInput from "../common/ExchangeInput";
import Button from "../common/Button";
import toast, { Toaster } from "react-hot-toast";
import { fetchSecurity, login } from "~/service/ApiRequests";
import ErrorResponse from "~/service/ErrorResponse";
import { useRouter } from "next/router";
import localStorageService from "~/service/LocalstorageService";
import useGlobalStore from "~/store/useGlobalStore";
import { decryptResponse } from "~/helpers/helper";
import { ApiHandler } from "~/service/UtilService";
import MuiButton from "../MuiButton";
import Image from "next/image";
import loginicon from "../../assets/auth/login.svg";
import blktrade from "../../assets/navicons/blktrade.png";

interface FormData {
  emailOrPhone: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const { handleSubmit, control, watch } = useForm<FormData>();

  const router = useRouter();

  const [showEmailField, setShowEmailField] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string>("email");

  const admin = useGlobalStore((state) => state.admin);

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

  const onSubmit = (data: FormData) => {
    data.password && !showEmailField
      ? submitData(data)
      : setShowEmailField(false);
  };

  const emailOrPhone = watch("emailOrPhone");

  return (
    <>
      <Toaster />
      <div className="grid h-screen grid-cols-1 bg-white md:grid-cols-2">
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
                <div className="">
                  <ExchangeInput
                    control={control}
                    placeholder="Enter your phone number"
                    label="Phone Number"
                    name="emailOrPhone"
                    type="text"
                    rules={{
                      required: "Phone number is required",
                    }}
                  />
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
        <div className="hidden h-full w-full md:block">
          {/* <Image
            src={loginicon} // Replace with your actual image path
            alt="Login illustration"
            className="h-full w-full object-cover"
          /> */}
        </div>
      </div>
    </>
  );
};

export default LoginForm;
