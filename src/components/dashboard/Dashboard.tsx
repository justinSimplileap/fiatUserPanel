import { useEffect, useState, Fragment, useRef } from "react";
import WarningMsg from "../common/WarningMsg";
import WalletCard from "./WalletCard";
import VerificationScreen from "../verification/identity-verification/MainScreen";
import CompanyVerification from "../verification/company-verification/MainScreen";
import localStorageService from "~/service/LocalstorageService";
import useGlobalStore from "~/store/useGlobalStore";
import TableComponent from "../TableComponent";
import { euroFormat } from "~/helpers/helper";
import Head from "next/head";
import BlackRightArrow from "../../assets/general/back_arrow_r.svg";
import BlackLeftArrow from "../../assets/general/back_arrow_l.svg";
import EURO_COIN from "../../assets/currency/EURO_COIN.svg";
import GBP_COIN from "../../assets/currency/GBP_COIN.svg";
import USD_COIN from "../../assets/currency/USD_COIN.svg";
import Image from "next/image";
import PaymentActivity from "../payment-activity/paymentActivity";
import { checkMerchants } from "~/service/api/accounts";

interface verificationStateType {
  identity: verificationStates;
  company: verificationStates;
}

interface AuthBody {
  userType: string;
}

const Dashboard = () => {
  const dashboard = useGlobalStore((state) => state.dashboard);

  const mergedAssets = [...dashboard.assets];

  const splitIntoChunks = (array: any, chunkSize: any) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  };

  const assetChunks = splitIntoChunks(mergedAssets, 6);

  // Slider
  const [currentIndex, setCurrentIndex] = useState(0);
  const divReference = useRef<HTMLDivElement>(null);
  const [assetsHeight, setAssetsHeight] = useState<number>(0);

  useEffect(() => {
    if (divReference.current) {
      setAssetsHeight(divReference.current.offsetHeight);
    }
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % assetChunks.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + assetChunks.length) % assetChunks.length,
    );
  };

  // -------- end -----------

  const admin = useGlobalStore((state) => state.admin);

  useEffect(() => {
    useGlobalStore.getState().syncDashboard();
  }, []);

  const companyVerified = false;

  const [companyVerificationScreen, setCompanyVerificationScreen] =
    useState<boolean>(false);

  const [identityVerification, setIdentityVerification] =
    useState<boolean>(false);

  const [verificationStatus, setVerificationStatus] =
    useState<verificationStateType>({
      identity: "SUBMITTED",
      company: "SUBMITTED",
    });

  const [authBody, setAuthBody] = useState<AuthBody | null>(null);
  const [merchantsAvailable, setMerchantsAvailable] = useState<boolean>(false);

  const handleCompanyVerifyScreen = (value: boolean) => {
    setCompanyVerificationScreen(value);
    localStorageService.updateVerification({
      companyVerificationScreen: value,
    });
    const companyVerification = localStorageService.decodeVerification();

    if (
      companyVerification?.companyVerificationScreenObj?.accountCreationSuccess
    ) {
      setVerificationStatus((prev) => ({
        ...prev,
        company: "SUBMITTED",
      }));
      localStorageService.updateAuthBody({ isCompanyVerified: "SUBMITTED" });
    }
  };

  const handleVerifyScreen = (value: boolean) => {
    setIdentityVerification(value);

    localStorageService.updateVerification({ identityVerification: value });

    const verification = localStorageService.decodeVerification();
    if (verification.identityVerificationObj?.successScreen) {
      setVerificationStatus((prev) => ({
        ...prev,
        identity: "SUBMITTED",
      }));
      localStorageService.updateAuthBody({ isUserVerified: "SUBMITTED" });
    }
  };

  useEffect(() => {
    const verification = localStorageService.decodeVerification();
    const identity = verification?.identityVerification || false;
    const company = verification?.companyVerificationScreen || false;
    setIdentityVerification(identity);
    setCompanyVerificationScreen(company);
    localStorageService.updateVerification({
      identityVerification: identity,
      companyVerificationScreen: company,
    });

    const authBody = localStorageService.decodeAuthBody();
    setAuthBody(authBody);

    void fetchMerchants();

    if (authBody) {
      setVerificationStatus((prev) => ({
        ...prev,
        identity: authBody.isUserVerified,
        company: authBody.isCompanyVerified,
      }));
    }
  }, []);

  const fetchMerchants = async () => {
    const [response] = await checkMerchants();
    if (response?.body) {
      setMerchantsAvailable(true);
    } else {
      setMerchantsAvailable(false);
    }
  };

  let sum = 0;
  dashboard.assets?.map((item) => {
    sum = sum + Number(item.assetValue);
  });

  console.log({ assetChunks });

  const cards = [
    {
      name: "EUR",
      icon: EURO_COIN,
      balance: 58808764.25,
      accountNumber: "1JunQ*****1Q2N",
    },

    {
      name: "GBP",
      icon: GBP_COIN,
      balance: 58764.64,
      accountNumber: "1JunQ*****1Q2N",
    },

    {
      name: "USD",
      icon: USD_COIN,
      balance: 58764.64,
      accountNumber: "1JunQ*****1Q2N",
    },
  ];

  return (
    <Fragment>
      <Head>
        <title>{admin?.tabName ?? "Exchange your crypo currencies"}</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Company verification */}
      {/* {verificationStatus.identity === "PENDING" && (
        <WarningMsg
          handleClick={() => handleVerifyScreen(true)}
          element={
            <span>
              Complete your{" "}
              <span className="font-bold">Identity Verification</span> to
              continue using exchange services
            </span>
          }
        />
      )} */}

      {/* {!companyVerified &&
        verificationStatus.company === "PENDING" &&
        verificationStatus.identity !== "PENDING" && (
          <WarningMsg
            element={
              <span>
                Complete your{" "}
                <span className="font-bold">Company Verification</span> to
                continue using exchange services
              </span>
            }
            handleClick={() => handleCompanyVerifyScreen(true)}
          />
        )} */}

      <div className="dashboardContainer m-auto w-[95%]">
        <div className="my-5">
          <p className=" text-xl font-bold">
            Welcome &nbsp;
            <span className=" text-[#c1922e]">{`${dashboard.firstname ?? ""} ${
              dashboard?.lastname ?? ""
            }`}</span>
          </p>
          <p className="text-xl">Here are your insights</p>
        </div>

        <div
          ref={divReference}
          className="myAccount relative mt-4 rounded-md bg-white p-6 shadow-[0px_16px_32px_0px_rgba(0,0,0,0.04)]"
        >
          <div className="exchangeCards  grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {cards.map((chunk, index) => (
              <div key={index}>
                <WalletCard walletDetails={chunk} />
              </div>
            ))}
          </div>
        </div>

        <div className="my-6">
          <TableComponent />
        </div>
      </div>

      {/* {identityVerification && verificationStatus.identity === "PENDING" && (
        <VerificationScreen close={() => handleVerifyScreen(false)} />
      )} */}

      {/* {companyVerificationScreen &&
        verificationStatus.company === "PENDING" && (
          <CompanyVerification close={() => handleCompanyVerifyScreen(false)} />
        )} */}
    </Fragment>
  );
};

export default Dashboard;
