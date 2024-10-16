import Image from "next/image";
import React from "react";
import loginicon from "../../assets/auth/globe.svg";
import Layer_2 from "../../assets/auth/Layer_2.svg";
import Male2 from "../../assets/auth/Male1.svg";
import Male1 from "../../assets/auth/Male3.svg";
import Male3 from "../../assets/auth/Male3.svg";
import Male4 from "../../assets/auth/Male4.svg";
import Currency from "../../assets/auth/Currency.svg";
import Currency2 from "../../assets/auth/Currency2.svg";

const AuthScreen = () => {
  return (
    <div className="group relative hidden h-full w-full lg:block">
      <div className="">
        <Image
          className="absolute right-[2vw] top-[52vh] transform rounded-full bg-white   transition-transform duration-300 group-hover:scale-105"
          src={Layer_2}
          alt=""
        />
        <Image
          className="absolute right-[16vw] top-[26vh] transform rounded-full bg-white transition-transform duration-300 group-hover:scale-105"
          src={Currency}
          alt=""
        />
        <Image
          className="absolute right-[35vw] top-[50vh] transform rounded-full bg-white transition-transform duration-300 group-hover:scale-105"
          src={Currency2}
          alt=""
        />
        <Image
          className="absolute right-[22vw] top-[40vh] transform rounded-full bg-white transition-transform duration-300 group-hover:scale-105"
          src={Male1}
          alt=""
        />
        <Image
          className="absolute right-[42vw] top-[30vh] transform rounded-full bg-white transition-transform duration-300 group-hover:scale-105"
          src={Male2}
          alt=""
        />
        <Image
          className="absolute bottom-[15vh] right-[35vw] transform rounded-full bg-white transition-transform duration-300 group-hover:scale-105"
          src={Male3}
          alt=""
        />
        <Image
          className="absolute bottom-[27vh] right-[13vw] transform rounded-full bg-white transition-transform duration-300 group-hover:scale-105"
          src={Male4}
          alt=""
        />
      </div>

      <Image
        src={loginicon} // Replace with your actual image path
        alt="Login illustration"
        className=" h-full w-full object-contain"
      />
    </div>
  );
};

export default AuthScreen;
