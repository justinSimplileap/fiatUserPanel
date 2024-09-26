import Link from "next/link";
import React from "react";
import toast, { Toaster } from "react-hot-toast";

import loginicon from "../../assets/auth/login.svg";
import blktrade from "../../assets/navicons/blktrade.png";




import Image, { type StaticImageData } from "next/image";
import { BsFillPatchCheckFill } from "react-icons/bs";

const SuccessMessage: React.FC = () => {
  
  return (
    <>
      <Toaster />
      <div className="grid h-screen grid-cols-1 bg-white lg:grid-cols-2 p-4 text-center justify-center">
        {/* Left side: Form */}
        <div className="m-auto rounded  lg:w-[60%] my-6  align-middle content-center">
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
          <div className="mb-2 mt-10 md:text-3xl text-2xl font-bold md:py-4 py-2">
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
          <Image
            src={loginicon}
            alt="Login illustration"
            className="h-full w-full"
          />
        </div>
      </div>
    </>
  );
};

export default SuccessMessage;
