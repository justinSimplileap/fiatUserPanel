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

  return (
    <Fragment>
      <Head>
        <title>{admin?.tabName ?? "Exchange your crypo currencies"}</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Company verification */}
      {verificationStatus.identity === "PENDING" && (
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
      )}

      {!companyVerified &&
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
        )}

      <div className="dashboardContainer m-auto w-[95%]">
        {/* section 1 */}
        <div className="welcomeBoard mt-4 flex flex-col md:flex-row md:items-center md:justify-between ">
          <div>
            <p className=" text-xl font-bold">
              Welcome &nbsp;
              <span className=" text-[#c1922e]">{`${
                dashboard.firstname ?? ""
              } ${dashboard?.lastname ?? ""}`}</span>
              ,
            </p>
            <p className="text-xl">Here is your dashboard</p>
          </div>

          <div className="acBalanceCard mr-[-2.6%] mt-2 flex items-center gap-4 rounded-l-lg py-4 pl-8 pr-16 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.1)]">
            <p className=" font-mono text-5xl text-[#C1922E]">€</p>
            <div>
              <p className="text-3xl font-bold">
                {euroFormat.format(sum ?? 0).split("€")}
              </p>
              <p className="mt-1 text-xs">
                All account balance in {dashboard.currency}
              </p>
            </div>
          </div>
        </div>

        <div
          ref={divReference}
          className="myAccount relative mt-4 rounded-md bg-white p-6 shadow-[0px_16px_32px_0px_rgba(0,0,0,0.04)]"
        >
          <p className="text-base font-bold">MY ACCOUNTS</p>
          {/* Cards */}
          <div className={`relative w-full h-[${assetsHeight}] `}>
            {assetChunks.map((chunk, index) => (
              <div
                key={index}
                className={`${currentIndex === index ? "block" : "hidden"}`}
              >
                <div className="exchangeCards mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                  {chunk.map((item: any, itemIndex: any) => (
                    <WalletCard
                      key={itemIndex}
                      walletDetails={item}
                      currency={dashboard.currency}
                    />
                  ))}
                </div>
              </div>
            ))}

            <button
              className=" ml-[50%] mt-8 h-10 w-10 -translate-x-[80px] transform lg:absolute lg:left-[-45px] lg:top-1/2 lg:ml-0 lg:mt-0 lg:-translate-x-0 lg:-translate-y-1/2 "
              onClick={prevSlide}
            >
              <Image src={BlackLeftArrow} alt="Left arrow" />
            </button>
            <button
              className="mt-8 h-10 w-10 transform lg:absolute lg:right-[-45px] lg:top-1/2 lg:mt-0 lg:-translate-y-1/2"
              onClick={nextSlide}
            >
              <Image src={BlackRightArrow} alt="Right arrow" />
            </button>
          </div>
        </div>

        {authBody?.userType &&
        (authBody?.userType === "PROJECT" || merchantsAvailable) ? (
          <div className="my-6">
            <PaymentActivity />
          </div>
        ) : (
          authBody?.userType &&
          authBody?.userType !== "COMPANY" && (
            <div className="my-6">
              <PaymentActivity />
            </div>
          )
        )}

        {authBody?.userType !== "PROJECT" && !merchantsAvailable ? (
          <div className="my-6">
            <TableComponent
              selectedCurrency={""}
              selectedTransaction={""}
              startDate={""}
              endDate={""}
            />
          </div>
        ) : null}
      </div>

      {identityVerification && verificationStatus.identity === "PENDING" && (
        <VerificationScreen close={() => handleVerifyScreen(false)} />
      )}

      {companyVerificationScreen &&
        verificationStatus.company === "PENDING" && (
          <CompanyVerification close={() => handleCompanyVerifyScreen(false)} />
        )}
    </Fragment>
  );
};

export default Dashboard;
