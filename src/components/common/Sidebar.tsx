import React, { useContext, useEffect, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { usePathname } from "next/navigation";
import home from "../../assets/navicons/home.svg";
import exchange from "../../assets/navicons/exchange.svg";
import blktrade from "../../assets/navicons/blktrade.png";
import counterIcon from "../../assets/navicons/counterparties.svg";
import transfers from "../../assets/navicons/transfers.svg";
import reports from "../../assets/navicons/report.svg";
import profile from "../../assets/navicons/profile.svg";
import { SidebarContext } from "../context/SidebarProvider";
import logout from "~/assets/navicons/logout.svg";
import { RiCloseCircleLine } from "react-icons/ri";
import { logout as LogoutUser } from "~/helpers/helper";
import localStorageService from "~/service/LocalstorageService";
import useGlobalStore from "~/store/useGlobalStore";
import { checkUserStatus } from "~/service/api/accounts";
import { useRouter } from "next/router";
import menu from "../../assets/headericons/menu.svg";

interface Route {
  name: string;
  path: string;
  icon: string; // Assuming your icon is a string path to the image
}

interface State {
  open: boolean;
  handleSidebar: () => void;
}

const Sidebar: React.FC = () => {
  const pathName = usePathname();
  const router = useRouter();

  const { open, handleSidebar }: State = useContext(SidebarContext);

  const admin = useGlobalStore((state) => state.admin);

  const profileImgLink = useGlobalStore((state) => state.user.profileImgLink);
  const handleNavigate = async (path: any) => {
    try {
      if (path === "/app/exchange" || path === "/app/transfers") {
        const [response, error] = await checkUserStatus();

        if (response?.success) {
          router.push(path);
        }
      } else {
        router.push(path);
      }
    } catch (error) {}
  };

  const [userType, setUserType] = useState();
  const [allStaffsCheck, setallStaffsCheck] = useState<any>();

  useEffect(() => {
    const authBody = localStorageService.decodeAuthBody();
    setUserType(authBody?.userType);
    setallStaffsCheck(authBody?.allStaffs ?? "");
  }, []);

  const routes: Route[] = [
    { name: "dashboard", path: "/app/dashboard", icon: home },
    { name: "exchange", path: "/app/exchange", icon: exchange },
    { name: "transfers", path: "/app/transfers", icon: transfers },
    { name: "Reports", path: "/app/reports", icon: reports },
    { name: "Counterparties", path: "/app/counterparties", icon: counterIcon },
    { name: "My profile", path: "/app/profile", icon: profile },
  ];

  return (
    <>
      {/* Desktop */}
      <nav
        className={`${
          !open ? "w-full md:w-52 " : "w-[70px]"
        }   hidden h-screen bg-black duration-500 md:block`}
      >
        <div className="logo relative flex h-20 items-center justify-center bg-black ">
          {admin?.profileImgLink && (
            <div className="logo relative flex items-center justify-center py-1 ">
              <Image
                alt={"Profile"}
                className=" object-cover"
                src={blktrade}
                width={"150"}
                height={"200"}
                priority={true}
              />
            </div>
          )}

          <Image
            src={menu as StaticImageData}
            alt=""
            className="absolute -right-3 z-[9999] cursor-pointer "
            onClick={handleSidebar}
          />
        </div>

        <div className="m-auto mt-5 h-[1.5px] w-[90%] bg-gray-500"></div>

        <div className=" flex flex-col gap-8  bg-black pl-6 pt-12 capitalize text-gray-500">
          {routes.map((item: any, i: any) => {
            return (
              <div
                key={i}
                // href={item.path}
                onClick={() => {
                  handleNavigate(item.path);
                }}
                className="group flex cursor-pointer items-center gap-4 "
              >
                <Image
                  alt=""
                  src={item.icon as StaticImageData}
                  className={`font-semibold opacity-50 group-hover:opacity-100 ${
                    pathName === item.path && "opacity-100"
                  } h-6 w-6  `}
                />
                <h1
                  className={`font-semibold group-hover:text-[#fff] ${
                    pathName === item.path && "text-white"
                  }  ${open && "pointer-events-none opacity-0"}`}
                >
                  {item?.name}
                </h1>
              </div>
            );
          })}
        </div>
        <div className="  absolute bottom-6 mt-5 flex flex-col justify-center gap-9 pl-6 capitalize">
          <button
            className="group flex cursor-pointer items-center gap-3"
            onClick={LogoutUser}
          >
            <Image
              alt=""
              src={logout as StaticImageData}
              className={`opacity-50 group-hover:opacity-100`}
            />
            <h1
              className={`font-semibold text-gray-500 group-hover:text-[#fff] ${
                open && "opacity-0 "
              }`}
            >
              Logout
            </h1>
          </button>
        </div>
      </nav>
      {/* Mobile */}
      <nav
        className={`fixed h-[90vh] w-1/2 bg-black lg:w-[35vw] ${
          open ? "right-0" : "-right-full"
        } top-20 z-[9999]  flex flex-col justify-between p-1 duration-500  md:hidden`}
      >
        <div className="mt-10 flex flex-col justify-center gap-7 pl-6 capitalize">
          {routes.map((item: any, i: any) => (
            <div
              key={i}
              onClick={() => {
                handleNavigate(item.path);
              }}
              className="group flex cursor-pointer items-center gap-4"
            >
              <Image
                alt=""
                src={item.icon as StaticImageData}
                className={`${
                  pathName === item.path ? "opacity-100" : "opacity-50"
                } h-6 w-6`}
              />
              <h1
                className={`text-[#8B8D91] group-hover:text-white ${
                  pathName === item.path && "text-white"
                } ${!open && "pointer-events-none opacity-0"}`}
              >
                {item?.name}
              </h1>
            </div>
          ))}
        </div>
        {/* Updated bottom div with padding */}
        <div className=" my-5  flex flex-col justify-center gap-7 pl-6 capitalize">
          <button
            className="group flex cursor-pointer items-center gap-3"
            onClick={LogoutUser}
          >
            <Image
              alt=""
              src={logout as StaticImageData}
              className={`group-hover:brightness-200`}
            />
            <h1
              className={`text-[#8B8D91] group-hover:text-white ${
                !open && "opacity-0"
              }`}
            >
              Logout
            </h1>
          </button>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
