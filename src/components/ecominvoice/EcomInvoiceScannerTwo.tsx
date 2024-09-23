import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import QRCode from "qrcode.react";
import Image from "next/image";
import Timer from "./Timer";
import Copy from "../../assets/general/copy.svg";
import Close from "../../assets/general/close.svg";
import Exclamatory from "../../assets/general/exclamatory.svg";
import Failed from "../../assets/general/close.png";
import Success from "../../assets/general/checked.png";
import toast from "react-hot-toast";

type propType = {
  onClose: (value?: any, status?: any) => void;
  invoice?: Invoices;
  openAdd: string;
  apiResponseData: any;
  invoiceDetails: string | number;
};

const EcomInvoiceScannerTwo = (props: propType) => {
  const { body, conversionValue, selectedAsset, tmerchant, withoutNetworkValue } =
    props.apiResponseData ?? {};
  const [blockDataTime, setBlockDataTime] = useState(0);
  const [isSecondDialogOpen, setIsSecondDialogOpen] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [countdown, setCountdown] = useState(10);

  console.log("props.invoiceDetails", props.invoiceDetails);

  useEffect(() => {
    const merchantId = tmerchant?.publicKey;
    const connectWebSocket = () => {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
      const newWs = new WebSocket(`${wsUrl}?token=${merchantId}`);
      setWs(newWs);

      newWs.onopen = () => {
        console.log("WebSocket connection opened");
      };

      newWs.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      newWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (
            data?.customerId == body?.customerId &&
            data?.assetId == body?.assetId &&
            data?.toAddress == body?.toAddress
          ) {
            setStatus(data);
            props.onClose("success", data);
          }
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      };

      newWs.onclose = (event) => {
        setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  useEffect(() => {
    if (body) {
      const createdAt: any = new Date(body?.updatedAt);
      const updateCountdown = () => {
        const currentTime: any = new Date();
        const timeDiff = Math.floor((currentTime - createdAt) / 1000);
        const countdownTime = 600 - timeDiff;
        setBlockDataTime(countdownTime > 0 ? countdownTime : 0);
      };
      updateCountdown();
      const intervalId = setInterval(updateCountdown, 1000);

      return () => clearInterval(intervalId);
    }
  }, [body]);

  useEffect(() => {
    if (blockDataTime === 0) {
      const timerId = setInterval(() => {
        setCountdown((prev) => {
          if (prev > 0) return prev - 1;
          clearInterval(timerId);
          window.location.href = body?.failedRedirectURL;
          return 0;
        });
      }, 1000);

      return () => clearInterval(timerId);
    }
  }, [blockDataTime, body]);

  const maskAddress = (address: string): string => {
    if (address.length < 8) {
      throw new Error("Address is too short to mask");
    }
    const firstFour = address.slice(0, 4);
    const lastFour = address.slice(-4);
    const masked = `${firstFour}****${lastFour}`;
    return masked;
  };

  const copyToClipboard = (address: string) => {
    navigator.clipboard
      .writeText(address)
      .then(() => {
        toast.success("Copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  function onCloseModel(): void {
    props.onClose("pay");
  }

  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts.length > 0) {
          toast.success(
            "MetaMask is already connected. Access through Chrome extension.",
          );
        }
      } catch (error) {
        toast.error("User rejected request or MetaMask is already open.");
      }
    } else {
      toast.error("MetaMask not detected in Chrome extension.");
    }
  };

  const rejectHandler = () => {
    window.location.href = body?.failedRedirectURL;
  };

  return (
    <Box className="flex h-full min-h-screen items-center justify-center bg-gray-100">
      <div className="fixed inset-0 flex w-screen items-center justify-center bg-gray-100 p-4">
        <div className="relative h-[90vh] w-[95%] space-y-4 overflow-y-auto rounded-lg border bg-[#f9fcff] px-5 py-8 md:h-auto md:w-[700px] md:p-10">
          {blockDataTime > 0 ? (
            <>
              <div className="text-center">
                <p className="text-[32px] font-normal">Make a payment</p>
                <p className="text-base text-[#898da8]">
                  Amount: {body?.requestedAmount}{" "}
                  <span>{body?.requestedAssetId}</span>
                </p>
              </div>
              <div className="flex flex-col-reverse rounded-lg bg-white shadow-lg md:flex-row">
                <div className="flex w-full flex-col items-center justify-center border-r border-[#cdcdcd] px-2 py-4 md:min-w-[238px] md:p-2">
                  <QRCode value={body?.toAddress} />
                  <p className="mt-4 w-full break-words text-center text-[10px] text-[#6b7192] ">
                    {body?.toAddress}
                  </p>
                  <p
                    className={`mt-4 h-[50px] w-[50px] rounded-full p-3 px-3 text-white ${
                      blockDataTime < 120 ? "bg-[#F74B60]" : "bg-[#000000]"
                    }`}
                  >
                    <Timer
                      initialTime={blockDataTime}
                      onTimeUp={() => setIsSecondDialogOpen(false)}
                    />
                  </p>
                </div>
                <div className="md-min-w-[320px] w-full">
                  <div className="flex items-center justify-between border-b border-[#cdcdcd] p-4">
                    <div>
                      <p className="text-sm text-[#898da8]">
                        Send exact amount
                      </p>
                      <p className="text-[22px] font-semibold text-[#15161b]">
                        {conversionValue}
                        {"  "}
                        {selectedAsset?.name}
                      </p>
                    </div>
                    <Image
                      onClick={() => copyToClipboard(conversionValue)}
                      className="h-[13.33px] w-[13.33px] cursor-pointer"
                      src={Copy}
                      alt="copy"
                    />
                  </div>
                  <div className="flex items-center justify-between border-b border-[#cdcdcd] p-4">
                    <div>
                      <p className="text-sm text-[#898da8]">To this address</p>
                      <p className="text-[22px] font-semibold text-[#15161b]">
                        {maskAddress(body?.toAddress)}
                      </p>
                    </div>
                    <Image
                      onClick={() => copyToClipboard(body?.toAddress)}
                      className="h-[13.33px] w-[13.33px] cursor-pointer"
                      src={Copy}
                      alt="copy"
                    />
                  </div>
                  <div className="flex items-center justify-between border-b border-[#cdcdcd] p-4">
                    <div>
                      <p className="text-sm text-[#898da8]">Chain Type</p>
                      <p className="text-[22px] font-semibold text-[#15161b]">
                        {selectedAsset?.name}
                      </p>
                    </div>
                  </div>
                  <div
                    className="lg flex cursor-pointer items-center justify-center gap-4 border-b border-[#cdcdcd] p-4"
                    onClick={connectMetaMask}
                  >
                    <p>Open wallet</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col-reverse gap-4 py-4 md:flex-row">
                <div className="flex w-full items-start gap-2 p-2 md:w-1/2">
                  <Image
                    src={Exclamatory}
                    alt="Exclamatory"
                    className="h-6 w-6"
                  />
                  <p className="text-sm text-[#6b7192]">
                    Make sure you{" "}
                    <span className=" font-semibold text-black">
                      {" "}
                      make the payment
                    </span>{" "}
                    within 10 minutes. Afterwards the rate will expire and you
                    will have to create a new payment
                    <br />
                    Sending any other currency will results in loss of funds
                  </p>
                </div>
                <div className="flex w-full flex-col gap-4 text-sm text-[#6b7192] md:w-1/2">
                  <div className="flex items-center justify-between">
                    <p>Exchange rate fixed for</p>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <p>Fixed rate</p>
                    <p>
                      {body?.requestedAmount} {body?.requestedAssetId} ={" "}
                      {Number(withoutNetworkValue).toFixed(6)} {selectedAsset?.name}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <p>Network Fee:</p>
                    <p className=" font-semibold">
                      {Number(props.invoiceDetails).toFixed(6)} {selectedAsset?.name}{" "}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsSecondDialogOpen(false)}
                className="absolute right-3 top-0"
              >
                <Image src={Close} alt="Close" onClick={() => onCloseModel()} />
              </button>
            </>
          ) : (
            <>
              <div className="text-center">
                <Image
                  src={Failed}
                  alt="Exclamatory"
                  className="w-150 h-150 mx-auto"
                />
                <p className="mt-12 text-[32px] font-normal">
                  Transaction Timeout..!!
                </p>
              </div>
              <p className="py-2 text-center text-[#FF0000]">
                Note: Your transaction is blocked due to timeout
                <p>(Ignore if you have completed the transfer)</p>
              </p>

              <div className="text-center">
                <button
                  onClick={rejectHandler}
                  className="mx-auto mt-4 rounded bg-[#FF0000] px-12 py-3 text-white"
                >
                  OK
                </button>
              </div>

              <button
                onClick={() => setIsSecondDialogOpen(false)}
                className="absolute right-3 top-0"
              >
                <Image src={Close} alt="Close" onClick={() => onCloseModel()} />
              </button>

              <p className="py-2 text-center text-[#000000]">
                Redirecting in {countdown} seconds...
              </p>
            </>
          )}
        </div>
      </div>
    </Box>
  );
};

export default EcomInvoiceScannerTwo;
