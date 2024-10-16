import Link from "next/link";
import React from "react";
import toast, { Toaster } from "react-hot-toast";

import blktrade from "../../assets/navicons/blktrade.png";

import Image, { type StaticImageData } from "next/image";
import { BsFillPatchCheckFill } from "react-icons/bs";
import AuthScreen from "../common/AuthScreen";

const SuccessMessage: React.FC = () => {
  return (
    <>
      <Toaster />
      <div className="grid h-screen grid-cols-1 justify-center bg-white p-4 text-center lg:grid-cols-2">
        {/* Left side: Form */}
        <div className="m-auto my-6  content-center rounded  align-middle lg:w-[60%]">
          <div className="flex flex-col gap-2">
            {/* {admin?.profileImgLink && ( */}
            <div className="logo relative flex items-center justify-center md:py-5 ">
              <Image
                alt={"Profile"}
                className=" object-cover"
                src={blktrade}
                width={"200"}
                height={"200"}
                priority={true}
              />
            </div>
          </div>
          <div className="mb-2 mt-10 py-2 text-2xl font-bold md:py-4 md:text-3xl">
            Account created successfully
          </div>
          <p className="font-semi-bold mb-2 text-lg md:py-5">
            Your signup was successful and
            <br /> your account has been created successfully
          </p>
          <Link href="/auth/login">
            <button className="mt-5 rounded bg-yellow-500 px-16 py-3 text-white">
              Login
            </button>
          </Link>
        </div>

        {/* Right side: Image */}
        <div className="hidden h-full w-full lg:block">
          {/* <Image
            src={loginicon}
            alt="Login illustration"
            className="h-full w-full"
          /> */}
          <AuthScreen />
        </div>
      </div>
    </>
  );
};

export default SuccessMessage;
