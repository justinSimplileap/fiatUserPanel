import React, { useContext, useEffect, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import Check from "../../assets/general/check.png";
import menu from "../../assets/headericons/menu.svg";
import message from "../../assets/headericons/message.svg";
import flag from "../../assets/headericons/IMAGE.svg";
import { SidebarContext } from "../context/SidebarProvider";
import useGlobalStore from "~/store/useGlobalStore";
import DefaultProfileYellow from "~/assets/images/defaultProfile.svg";
import { Box } from "@mui/material";
import localStorageService from "~/service/LocalstorageService";
import { useRouter } from "next/router";
import ArrowDown from "../../assets/general/arrow_down.svg";
import { Dialog } from "@headlessui/react";
// import DefaultProfile from "~/assets/images/defaultProfileImage.png";
// import Link from "next/link";
// import { login } from "~/service/ApiRequests";
// import { decryptResponse } from "~/helpers/helper";
interface State {
  handleSidebar: () => void;
}

interface HeaderProps {
  title: string;
}

interface SwitchAccounts {
  email: string;
  fullname: string;
  profileImgLink: string;
  token: string;
  userType: string;
}

const Topbar: React.FC<HeaderProps> = ({ title }) => {
  const { handleSidebar }: State = useContext(SidebarContext);
  const router = useRouter();

  const profileImgLink = useGlobalStore((state) => state.user.profileImgLink);

  const [openSwitchAccounts, setopenSwitchAccounts] = useState(false);
  const [swicthAccounts, setSwicthAccounts] = useState<SwitchAccounts[]>([]);
  const [activeAccount, setActiveAccount] = useState();
  const [activeName, setActiveName] = useState();
  // console.log("activeAccount", activeAccount);

  useEffect(() => {
    const accounts = localStorageService.decodeSwitchAccounts();

    if (accounts) {
      setSwicthAccounts(accounts ?? []);
    }
    const currentUserToken = localStorageService.getLocalAccessToken();

    const currentAccount = accounts?.find((item: any) => {
      return item.token === currentUserToken?.split(" ")[1];
    });

    setActiveName(currentAccount?.fullname);

    setActiveAccount(currentAccount?.token);
  }, []);

  const refreshPage = () => {
    if (router.pathname === "/app/dashboard") {
      window.location.reload();
    } else {
      router.push("/app/dashboard");
    }
  };

  function changeToken(data: any) {
    localStorageService.setLocalAccessToken(data.token);

    localStorageService.updateAuthBody({
      fullname: data?.fullname,
      email: data?.email,
      profileImgLink: data?.profileImgLink,
      token: data?.token,
      countryCode: data?.countryCode,
      phone: data?.phone,
      isUserVerified: data?.isUserVerified,
      tfaEnabled: data?.tfaEnabled,
      isCompanyVerified: data?.isCompanyVerified,
      isAddressVerified: data?.isAddressVerified,
      isIdentityVerified: data?.isIdentityVerified,
      isEmailVerified: data?.isEmailVerified,
      priceList: data?.priceList,
      userType: data?.userType,
    });

    useGlobalStore.setState((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        profileImgLink: data?.profileImgLink,
        tfaEnabled: data?.tfaEnabled,
      },
      setupComplete: "PENDING",
    }));

    setopenSwitchAccounts(false);
    refreshPage();
  }

  return (
    <div
      style={{
        boxShadow: "1.1802083253860474px 0px 5.901041507720947px 0px #0000000D",
      }}
      className=" relative bg-white text-black"
    >
      <div
        className={` z-[9999] m-auto flex h-20 w-[95%] items-center justify-between`}
      >
        <div className="flex items-center gap-8">
          {/* <Image
            src={menu as StaticImageData}
            alt=""
            className="cursor-pointer text-black brightness-[100]"
            onClick={handleSidebar}
          /> */}
          <h1 className="px-1 text-sm  md:text-lg">
            {title === "bulkPayout" ? "Bulk Payout" : title}
          </h1>
        </div>
        <div className="flex items-center gap-8">
          <Image className=" " alt="" src={message as StaticImageData} />
          <div className="flex items-center gap-3 text-white">
            <Image alt="" src={flag as StaticImageData} />
            <p>English</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
