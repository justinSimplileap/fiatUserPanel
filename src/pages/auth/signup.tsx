import React, { useEffect, useState } from "react";
import SignUpForm from "~/components/signup/SignUpForm";
import EnterOTP from "~/components/signup/EnterOTP";
import SuccessMessage from "~/components/signup/SucessMsg";

import toast, { Toaster } from "react-hot-toast";
import {
  signup,
  verifyOtp,
  resendOtp,
  fetchCountries,
  getLegalDocuments,
} from "~/service/ApiRequests";
import { ApiHandler } from "~/service/UtilService";
import {
  DropDownOptionsResponseType,
  DropDownOptionsType,
} from "~/types/Common";
import { StaticImageData } from "next/image";
import { countryFlags, findIp } from "~/helpers/helper";
import localStorageService from "~/service/LocalstorageService";
interface FormData {
  firstName: string;
  lastName: string;
  dob: string;
  countryCode: string;
  mobileNumber: string;
  password: string;
  reEnterPassword: string;
}

interface Screen {
  formScreen: boolean;
  otpScreen: boolean;
  successScreen: boolean;
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  // Extract the day, month, and year components
  const day = date.getDate().toString().padStart(2, "0"); // Ensure 2-digit format
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Add 1 since months are zero-based
  const year = date.getFullYear();

  // Create the DD-MM-YYYY formatted date string
  const formattedDate = `${day}-${month}-${year}`;
  return formattedDate;
};

const Signup = () => {
  const screenInitialValues = {
    formScreen: false,
    otpScreen: false,
    successScreen: false,
  };
  const [signupData, setData] = useState<FormData>({
    firstName: "",
    lastName: "",
    dob: "",
    countryCode: "+91",
    mobileNumber: "",
    password: "",
    reEnterPassword: "",
  });
  const [displayScreen, setDisplayScreen] =
    useState<Screen>(screenInitialValues);
  const [loading, setLoading] = useState(false);

  const { formScreen, otpScreen, successScreen } = displayScreen;
  const [disableResendButton, setDisableResendButton] = useState<boolean>(true);
  const [time, setTime] = useState<string>("00:30");
  const [countryList, setCountryList] = useState<DropDownOptionsType[]>([]);
  const [otpTransactionId, setOtpTransactionId] = useState<string>("");
  const [legalDocuments, setLegalDocuments] = useState<LegalDocuments[]>([]);

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
  const getDocumentList = async () => {
    const [data] = await ApiHandler(getLegalDocuments);

    if (data?.success) {
      const docValue = data.body as LegalDocuments[];
      setLegalDocuments(docValue);
    }
    return [];
  };

  useEffect(() => {
    getCountryList();
    getDocumentList();
    changeScreen("formScreen");

    const printIp = async () => {
      try {
        const ip = await findIp();
        localStorageService.setIpAddress(ip);
      } catch (error) {
        console.error("Error occurred:", error);
      }
    };

    printIp();
  }, []);

  const changeScreen = (name: string) => {
    setDisplayScreen({ ...screenInitialValues, [name]: true });
  };

  const submitData = async (values: FormData) => {
    setLoading(true);
    setData(values);
    const { firstName, lastName, dob, countryCode, mobileNumber, password } =
      values;

    const myIp = localStorageService.getIPAddress();
    const reqBody = {
      firstname: firstName,
      lastname: lastName,
      phone: mobileNumber,
      countryCode,
      password,
      dob: formatDate(dob),
      ipAddress: myIp ?? "",
    };

    const [data, error]: APIResult<{ otpTransactionId: string }> =
      await ApiHandler(signup, reqBody);
    if (error) {
      toast.error(error);
    }

    if (data?.success) {
      changeScreen("otpScreen");
      executeTimer(30);
      setOtpTransactionId(data?.body?.otpTransactionId);
    }

    setLoading(false);
  };

  const submitOTP = async (otp: string) => {
    setLoading(true);

    const [data, error] = await ApiHandler(verifyOtp, {
      code: otp,
      otpTransactionId,
    });

    if (error) {
      toast.error(error);
    }
    if (data?.success) {
      changeScreen("successScreen");
    }

    setLoading(false);
  };

  const handleResendOTP = async () => {
    setLoading(true);

    const [data, error]: any = await ApiHandler(resendOtp, {
      otpTransactionId,
      countryCode: signupData.countryCode,
    });
    if (error) {
      toast.error(error);
    }

    if (data) {
      if (data.success) {
        executeTimer(30);
        setOtpTransactionId(data?.body?.otpTransactionId);
      }
    }
    setLoading(false);
  };

  const executeTimer = (seconds: number) => {
    setDisableResendButton(true);
    // Update the timer every second
    const intervalId = setInterval(() => {
      if (seconds <= 0) {
        clearInterval(intervalId); // Stop the countdown when it reaches 0
        setDisableResendButton(false);
      } else {
        seconds--;
        const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
        const remainingSeconds = String(seconds % 60).padStart(2, "0");
        // Time format MM:SS
        const formattedTime = `${minutes}:${remainingSeconds}`;
        setTime(formattedTime);
      }
    }, 1000);
  };

  return (
    <div className="bg-black">
      <Toaster />

      {formScreen && (
        <SignUpForm
          setData={(data: FormData) => submitData(data)}
          data={signupData}
          loading={loading}
          countryList={countryList}
          legalDocument={legalDocuments}
        />
      )}

      {otpScreen && (
        <EnterOTP
          phone={`${signupData.countryCode} ${signupData.mobileNumber}`}
          onOtpSubmit={submitOTP}
          changeScreen={changeScreen}
          resendOTP={handleResendOTP}
          disableResendButton={disableResendButton}
          time={time}
        />
      )}

      {successScreen && <SuccessMessage />}
    </div>
  );
};

export default Signup;
