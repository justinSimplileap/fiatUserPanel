"use client";

import React, { Fragment } from "react";
import Image, { type StaticImageData } from "next/image";
import ProfileCompleted from "../../assets/general/profile-complete.svg";
import Button from "../../components/common/Button";
import { useState, useEffect, useRef } from "react";
import { ApiHandler } from "../../service/UtilService";
import {
  updatePassword,
  updateProfilePicture,
  get2FAQRCode,
  submit2FAOtp,
} from "../../service/ApiRequests";
import toast from "react-hot-toast";
import localStorageService from "../../service/LocalstorageService";
import { Divider, Modal } from "@mui/material";
import ChangePassword from "./ChangePassword";
import TwoFactorAuthentication from "./TwoFactorAuthentication";
import useGlobalStore from "~/store/useGlobalStore";
import DefaultProfile from "~/assets/images/defaultProfileImage.png";
import ChangeAuth from "./ChangeMobileEmail";
import {
  getTransferFeesByPricelistId,
  getOperationTypeUserpanel,
} from "../../service/api/pricelists";
import LoaderIcon from "../LoaderIcon";
import TransfersIcon from "../../assets/general/any-transfer.svg";
import { cards, dateValidation } from "~/helpers/helper";
import MuiButton from "../MuiButton";

interface Form {
  currentPassword?: string;
  newPassword?: string;
  twoFactorCode?: string;
}

const Profile = () => {
  const fileInputRef: any = useRef(null);
  const profileImgLink = useGlobalStore((state) => state.user.profileImgLink);
  const pricelistTrans = useGlobalStore((state) => state.user.priceList);
  // const test = useGlobalStore((state) => state.user);
  //
  const [loading, setLoading] = useState<boolean>(false);
  const [twofaModal, setTwofaModal] = useState<boolean>(false);
  const [twofaQR, setTwofaQR] = useState<string>("");
  const [otpValidated, setOtpValidated] = useState<boolean>(false);

  const [changePasswordModal, setChangePasswordModal] =
    useState<boolean>(false);

  const dashboard = useGlobalStore((state) => state.dashboard);
  useEffect(() => {
    useGlobalStore.getState().syncAdminProfile();
  }, [dashboard]);

  const submitProfilePic = async (file: any) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    const [data, error]: APIResult<{ profileImgLink: string; userId: string }> =
      await ApiHandler(updateProfilePicture, formData);
    if (error) {
      toast.error(error);
    }

    if (data?.success) {
      localStorageService.updateAuthBody({
        profileImgLink: data?.body?.profileImgLink,
      });

      localStorageService.updateSwitchAccounts({
        profileImgLink: data?.body?.profileImgLink,
        id: data?.body?.userId,
      });

      useGlobalStore.setState((prev) => ({
        ...prev,
        user: { ...prev.user, profileImgLink: data?.body?.profileImgLink },
      }));
      toast.success(data?.message ?? "");
    }
    setLoading(false);
  };

  const changePassword = async (values: Form) => {
    setLoading(true);
    const [data, error]: APIResult<{ token: string }> = await ApiHandler(
      updatePassword,
      values,
    );
    if (error) {
      toast.error(error);
    }
    if (data?.success) {
      toast.success(data?.message ?? "");
      localStorageService.setLocalAccessToken(data?.body?.token);
      setChangePasswordModal(false);
    }
    setLoading(false);
  };

  const get2FAQR = async () => {
    setLoading(true);
    const [data, error]: APIResult<{ qrImage: string }> =
      await ApiHandler(get2FAQRCode);
    if (error) {
      toast.error(error);
    }
    if (data?.success) {
      setTwofaQR(data?.body?.qrImage);
      setTwofaModal(true);
    }
    setLoading(false);
  };

  const submit2FACode = async (value: Form) => {
    const { twoFactorCode } = value;
    setLoading(true);
    const [data, error]: APIResult<{ userId: string }> = await ApiHandler(
      submit2FAOtp,
      {
        otp: twoFactorCode,
      },
    );
    if (error) {
      toast.error(error);
    }
    if (data?.success) {
      localStorageService.updateSwitchAccounts({
        tfaEnabled: true,
        id: data?.body?.userId,
      });

      localStorageService.updateAuthBody({ tfaEnabled: true });
      useGlobalStore.setState((prev) => ({
        ...prev,
        user: { ...prev.user, tfaEnabled: true },
      }));
      toast.success(data?.message ?? "");
      setTwofaModal(false);
      setOtpValidated(true);
    }
    setLoading(false);
  };

  const [userDetails, setUserDetails] = useState<any>({
    countryCode: "",
    phone: "",
    email: "",
    fullname: "",
    isUserVerified: "SUBMITTED",
    tfaEnabled: "",
  });

  const { countryCode, phone, email, fullname, isUserVerified, tfaEnabled } =
    userDetails || {};

  useEffect(() => {
    const data = localStorageService.decodeAuthBody();

    setUserDetails(data);
  }, [dashboard]);

  const findColorCode = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500";

      case "SUBMITTED":
        return "bg-orange-500";

      case "REJECTED":
        return "bg-red-500";

      case "APPROVED":
        return "bg-green-500";
    }
  };

  const [open, setOpen] = useState("");

  const handleOpen = (value: string) => {
    if (value) setOpen(value);
  };

  const [transferFees, setTransferFees] = useState<TransferFees[]>([]);
  const [operationType, setoperationType] = useState<TransferFees[]>([]);

  useEffect(() => {
    const getOperationType = async () => {
      const [res] = await getOperationTypeUserpanel();

      if (res !== null && "body" in res) {
        setoperationType(res.body);
      }
    };
    const getTransferFees = async () => {
      const [res] = await getTransferFeesByPricelistId(dashboard.priceList);
      if (res !== null && "body" in res) {
        setTransferFees(res.body);
      }
    };

    getOperationType();
    if (dashboard.priceList) getTransferFees();
  }, [dashboard.priceList]);

  function oprationName(id: any) {
    const name = operationType.find((item) => item.id === id);
    return name?.displayName ? name?.displayName : "";
  }

  return (
    <Fragment>
      <ChangeAuth open={open} handleClose={() => setOpen("")} />

      <div className="m-auto w-full gap-10 lg:flex lg:w-[95%]">
        {/* Left Section */}
        <div className="relative mt-4 w-full rounded-md bg-white p-6 shadow-[0px_16px_32px_0px_rgba(0,0,0,0.04)] xl:w-[40%]">
          {/* Profile Section */}
          <div>
            <div className="m-auto aspect-square w-24 rounded-full border-[3px]">
              <Image
                alt="Profile"
                className="aspect-square w-full rounded-full object-cover"
                src={
                  profileImgLink
                    ? `${profileImgLink}?t=${new Date().getTime()}`
                    : DefaultProfile
                }
                width="100"
                height="100"
              />
            </div>
            <div className="mt-4 text-center">
              <p className="text-2xl font-bold">{fullname}</p>
            </div>

            {/* Profile Photo */}
            <div className="mt-10 flex items-center justify-between border-b-2 border-[#D9D9D9] pb-6">
              <div>
                <p className="text-base font-bold">Profile photo</p>
                <p className="mt-2 text-xs font-semibold text-[#99B2C6]">
                  Please upload a profile picture
                </p>
              </div>
              <div className="cursor-pointer">
                <input
                  ref={fileInputRef}
                  onChange={(e: any) => {
                    submitProfilePic(e.target.files[0]);
                  }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                />
                <MuiButton
                  name="Change"
                  type="button"
                  background="white"
                  color="#C2912E"
                  loading={loading}
                  onClick={() => fileInputRef.current.click()}
                />
              </div>
            </div>

            {/* Email Authentication */}
            <div className="mt-6 flex items-center justify-between border-b-2 border-[#D9D9D9] pb-6">
              <div className="w-4/5">
                <p className="text-base font-bold">Email Authentication</p>
                <p className="mt-2 text-xs font-bold">{"Justin@yopmail.com"}</p>
                <p className="mt-2 text-xs font-semibold text-[#99B2C6]">
                  For login, withdrawal, password retrieval, security settings
                  changes and API management verification. You can{" "}
                  <span className="cursor-pointer text-[#C2912E]">
                    Unlink here
                  </span>
                </p>
              </div>
              <MuiButton
                background="white"
                color="#C2912E"
                onClick={() => handleOpen("email")}
                type="submit"
                name="Change"
              />
            </div>

            {/* SMS Authentication */}
            <div className="mt-6 flex items-center justify-between border-b-2 border-[#D9D9D9] pb-6">
              <div className="w-4/5">
                <p className="text-base font-bold">SMS authentication</p>
                <p className="mt-2 text-xs font-bold">{`${countryCode ?? ""} ${
                  phone ?? "+91 9877878778"
                }`}</p>
                <p className="mt-2 text-xs font-semibold text-[#99B2C6]">
                  For login, withdrawal, password reset and change of security
                  settings
                </p>
              </div>
              <MuiButton
                background="white"
                color="#C2912E"
                onClick={() => handleOpen("sms")}
                type="submit"
                name="Change"
              />
            </div>

            {/* Identity Verification */}
            <div className="mt-6 flex items-center justify-between border-b-2 border-[#D9D9D9] pb-6">
              <div className="w-4/5">
                <p className="text-base font-bold">Identity verification</p>
                <p className="mt-2 text-xs font-semibold text-[#99B2C6]">
                  Complete verification to increase daily withdrawal count
                </p>
              </div>
              <MuiButton
                type="submit"
                borderColor="#F9E3B8BD"
                background="#F9E3B8BD"
                color="black"
                name={
                  isUserVerified === "APPROVED" ? "Approved" : isUserVerified
                }
              />
            </div>

            {/* Password */}
            <div className="mt-6 flex items-center justify-between border-b-2 border-[#D9D9D9] pb-6">
              <div className="w-4/5">
                <p className="text-base font-bold">Password</p>
                <p className="mt-2 text-xs font-semibold text-[#99B2C6]">
                  Change password in settings
                </p>
              </div>
              <MuiButton
                background="white"
                color="#C2912E"
                onClick={() => setChangePasswordModal(true)}
                type="submit"
                name="Change"
              />
            </div>

            {/* Google Authenticator */}
            <div className="mt-6 flex items-center justify-between border-b-2 border-[#D9D9D9] pb-6">
              <div className="w-4/5">
                <p className="text-base font-bold">Google authenticator</p>
                <p className="mt-2 text-xs font-semibold text-[#99B2C6]">
                  Change password in settings
                </p>
              </div>
              <MuiButton
                type="submit"
                name={tfaEnabled || otpValidated ? "Verified" : "Enable"}
                onClick={() => get2FAQR()}
                disabled={tfaEnabled || otpValidated}
                loading={loading}
                borderColor="#F9E3B8BD"
                background="#F9E3B8BD"
                color="black"
              />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="mt-4 flex w-full flex-col gap-10  xl:w-[60%]">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {cards.map((item, i) => (
              <div
                key={i}
                className=" w-full text-ellipsis  break-all rounded-md bg-white p-6 shadow-[0px_16px_32px_0px_rgba(0,0,0,0.04)]"
              >
                <div className="my-2 flex items-center gap-2">
                  <Image src={item.icon} className="h-5 w-5" alt="" />{" "}
                  <p>{item.name}</p>
                </div>
                <span className="text-gray-500">Virtual Account Name</span>
                <p className=" font-semibold">{item.accountName}</p>
                <div className="m-1"></div>
                <span className="text-gray-500">BIC</span>
                <p className="font-semibold">{item.bic}</p>
                <div className="m-1"></div>
                <span className="text-gray-500">vIBAN</span>
                <p className="font-semibold ">{item.vIBAN}</p>
                <div className="m-1"></div>

                <span className="text-gray-500">Bank Name</span>
                <p className="font-semibold">{item.bankName}</p>
                <div className="m-1"></div>

                <span className="text-gray-500">Bank Address</span>
                <p className="font-semibold">{item.bankAddress}</p>
                <div className="m-1"></div>

                <span className="text-gray-500">Bank Country</span>
                <p className="font-semibold">{item.country}</p>
              </div>
            ))}
          </div>
          <div className="relative w-full rounded-md bg-white p-6 shadow-[0px_16px_32px_0px_rgba(0,0,0,0.04)]">
            <div className="w-full">
              <div className="mb-6 flex justify-between">
                <p className="text-base font-bold">Fees</p>
              </div>

              <Divider />

              {transferFees.map((item) => (
                <div className="mt-4 flex justify-between" key={item.id}>
                  <div className="flex gap-2">
                    <Image src={TransfersIcon} alt="transfer logo" />
                    <span className="mt-1">
                      {oprationName(item?.operationType)} ({item.currencyId})
                    </span>
                  </div>
                  <p className="mt-1">
                    {item.percent}% + {item.fixedFee} {item.currencyId}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal open={changePasswordModal}>
        <div className="flex h-screen items-center justify-center">
          <div className="w-full max-w-2xl rounded bg-white p-10 shadow-md">
            <ChangePassword
              close={() => setChangePasswordModal(false)}
              submitData={changePassword}
              loading={loading}
            />
          </div>
        </div>
      </Modal>

      <Modal open={twofaModal}>
        <div className="flex h-screen items-center justify-center">
          <div className="mx-2 rounded bg-white p-8 shadow-md md:max-w-md">
            <TwoFactorAuthentication
              submitData={submit2FACode}
              close={() => setTwofaModal(false)}
              loading={loading}
              twofaQR={twofaQR}
            />
          </div>
        </div>
      </Modal>
    </Fragment>
  );
};

export default Profile;
