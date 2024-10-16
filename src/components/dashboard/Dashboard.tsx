import { useEffect, useState, Fragment, useRef } from "react";
import WalletCard from "./WalletCard";
import localStorageService from "~/service/LocalstorageService";
import useGlobalStore from "~/store/useGlobalStore";
import TableComponent from "../TableComponent";
import { cards } from "~/helpers/helper";
import Head from "next/head";
import plusIcon from "../../assets/general/plus.svg";
import exchangeIcon from "../../assets/general/exchange.svg";
import sendIcon from "../../assets/general/sendArrow.svg";
import Image from "next/image";
import { checkMerchants } from "~/service/api/accounts";
import { theme } from "~/constants/constant";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useMediaQuery,
} from "@mui/material";
import { AddDashbordCards } from "./AddDashbordCards";
import nextPreviousIcon from "~/assets/general/next_previous.svg";
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
  const divReference = useRef<HTMLDivElement>(null);
  const [assetsHeight, setAssetsHeight] = useState<number>(0);

  useEffect(() => {
    if (divReference.current) {
      setAssetsHeight(divReference.current.offsetHeight);
    }
  }, []);

  // -------- end -----------

  const admin = useGlobalStore((state) => state.admin);

  useEffect(() => {
    useGlobalStore.getState().syncDashboard();
  }, []);

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

  // Responsive breakpoints using useMediaQuery
  const isSmScreen = useMediaQuery("(max-width: 640px)");
  const isMdScreen = useMediaQuery("(max-width: 768px)");
  const isLgScreen = useMediaQuery("(max-width: 1024px)");
  const isXlScreen = useMediaQuery("(max-width: 1280px)");

  console.log("isXlScreen: ", isXlScreen);
  // Determine the number of visible cards based on the screen size
  const numberOfVisibleCards = isSmScreen
    ? 1
    : isMdScreen
    ? 1
    : isLgScreen
    ? 2
    : isXlScreen
    ? 2
    : 2;

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

  const array = [
    { name: "topUp", icon: plusIcon, label: "Top up" },
    { name: "exchange", icon: exchangeIcon, label: "Exchange" },
    { name: "send", icon: sendIcon, label: "Send" },
  ];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [openDialog, setOpenDialog] = useState("");

  const handleDialogOpen = () => {
    setOpenDialog("addCurrency");
  };

  const visibleCards = cards.slice(
    currentIndex,
    currentIndex + numberOfVisibleCards,
  ); // Show only 3 cards at a time
  const handleNextSlide = () => {
    if (currentIndex + numberOfVisibleCards < cards.length) {
      setCurrentIndex(currentIndex + 1); // Move to the next card chunk
    }
  };

  const handlePrevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1); // Move to the previous card chunk
    }
  };

  const cardRef = useRef<HTMLDivElement | null>(null);
  const [cardHeight, setCardHeight] = useState(0);

  useEffect(() => {
    if (cardRef.current) {
      setCardHeight(cardRef.current.offsetHeight);
    }
  }, [cardRef]);

  return (
    <Fragment>
      <Head>
        <title>{admin?.tabName ?? "Exchange your crypo currencies"}</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className=" m-auto  w-[95%]">
        <div className="my-5 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xl font-bold">
              Welcome &nbsp;
              <span style={{ color: `${theme.text.color.warning}` }}>{`${
                dashboard.firstname ?? ""
              } ${dashboard?.lastname ?? ""}`}</span>
            </p>
            <p className="text-xl">Here are your insights</p>
          </div>

          <div className="flex gap-10">
            {array?.map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className=" flex h-10  w-10 cursor-pointer items-center justify-center rounded-full border bg-white duration-300 hover:scale-110 active:scale-90">
                  <Image
                    className="h-5 w-5 "
                    src={item?.icon}
                    alt={item.name}
                  />
                </div>
                <p
                  style={{
                    color: `${theme.text.color.primary}`,
                  }}
                >
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center  gap-2 rounded-md bg-white p-3 shadow-[0px_16px_32px_0px_rgba(0,0,0,0.04)]">
          {/* cards  */}
          <div className="grid w-full grid-cols-1 gap-5 transition duration-500 ease-in-out md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {visibleCards.map((card, index) => (
              <div
                key={index}
                ref={index === 0 ? cardRef : null}
                className="transform cursor-pointer break-words  transition-all duration-500 hover:scale-100 hover:shadow-lg"
              >
                <WalletCard walletDetails={card} />
              </div>
            ))}

            <div
              className="exchangeCard gradientCard hidden transform cursor-pointer flex-col items-center justify-center gap-2 rounded-md bg-gray-100 p-5 opacity-0 transition-all duration-700 ease-in-out hover:scale-105 lg:flex lg:opacity-100"
              onClick={handleDialogOpen}
            >
              <div
                className="flex flex-col items-center"
                style={{ color: `${theme.text.color.primary}` }}
              >
                <div className="flex h-10 w-10 place-content-center rounded-full border bg-white">
                  <Image className="active:scale-90" src={plusIcon} alt="" />
                </div>
                <p
                  className="hidden lg:block"
                  style={{ color: `${theme.text.color.primary}` }}
                >
                  Add another Currency to your wallet
                </p>
              </div>
            </div>
          </div>

          {/* mobile  plus icon  */}
          <div
            className="flex  cursor-pointer flex-col items-center justify-center gap-2 rounded-md  bg-[#E4E4E7]  lg:hidden"
            onClick={handleDialogOpen}
            style={{ height: `${cardHeight}px` }}
          >
            <div
              className=" flex flex-col items-center p-2"
              style={{ color: `${theme.text.color.primary}` }}
            >
              <div className="flex  h-10 w-10 place-content-center rounded-full border bg-white">
                <Image className="active:scale-90" src={plusIcon} alt="" />
              </div>
            </div>
          </div>

          {/* Slider Navigation Controls */}
          <div className="m-2 flex h-auto flex-col gap-5">
            {/* Previous Button */}
            <button
              className={`transform transition duration-300 ease-in-out hover:scale-110 ${
                currentIndex === 0 ? "cursor-not-allowed opacity-50" : ""
              }`}
              onClick={handlePrevSlide}
              disabled={currentIndex === 0}
            >
              <Image src={nextPreviousIcon} className="rotate-180" alt="" />
            </button>

            {/* Next Button */}
            <button
              className={`transform transition duration-300 ease-in-out hover:scale-110 ${
                currentIndex + numberOfVisibleCards >= cards.length
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
              onClick={handleNextSlide}
              disabled={currentIndex + numberOfVisibleCards >= cards.length}
            >
              <Image src={nextPreviousIcon} alt="" />
            </button>
          </div>
        </div>

        <div className="my-6">
          <TableComponent />
        </div>

        {openDialog === "addCurrency" && (
          <AddDashbordCards
            onClose={() => {
              setOpenDialog("");
            }}
          />
        )}
      </div>
    </Fragment>
  );
};

export default Dashboard;
