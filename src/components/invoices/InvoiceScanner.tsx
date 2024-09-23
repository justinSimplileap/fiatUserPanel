import {
  Box,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { IoWarningOutline } from "react-icons/io5";
import { FiCopy } from "react-icons/fi";
import { getInvoicesById } from "~/service/ApiRequests";
import { useRouter } from "next/router";
import QRCode from "qrcode.react";
import Timer from "./timer";

type propType = {
  onClose: (value?: any) => void;
  invoice?: Invoices;
  openAdd: string;
  updateOnTransition: boolean;
  onPaymentSuccess: (data: any) => void;
  onTimerComplete: () => void;
  invoiceDetails: updatePay;
};

interface updatePay {
  NetworkFee: number;
  customerId: string;
  merchantId: string;
  assetId: string;
}

type State = {
  toAddress: string;
};

const InvoiceScanner = (props: propType) => {
  const router = useRouter();
  const { id } = router.query;
  const [getInvoiceData, setgetInvoiceData] = useState<any>("");
  const [state, setState] = useState<State>();
  const merchantIdRef = useRef<string | undefined>(undefined);
  const fetchData = async (id: any) => {
    try {
      if (typeof id === "string") {
        const response = await getInvoicesById(id);
        if (response.data.body) {
          setgetInvoiceData(response.data.body);
          // merchantIdRef.current = response.data.body.merchantDetails?.publicKey;

          setState({
            toAddress: response.data.body.transactionDetails.toAddress ?? "",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching invoice:", error);
    }
  };

  useEffect(() => {
    fetchData(id);
  }, [id]);

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (error) {}
  };

  const handleTimerComplete = () => {
    props.onTimerComplete();
  };

  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const merchantId = props.invoiceDetails?.merchantId;
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
            data.customerId === props.invoiceDetails?.customerId &&
            data.assetId === props.invoiceDetails?.assetId &&
            data.toAddress === state?.toAddress
          ) {
            props.onPaymentSuccess(data);
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
  }, [state]);
  return (
    <Box className="flex h-full min-h-screen items-center justify-center bg-gray-100">
      <Box className="bg-white">
        <Box className="flex w-[90vw] flex-col items-start gap-1 px-10 py-5 text-sm font-semibold md:w-[60vw] lg:w-[40vw]">
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-base font-semibold">
                Payment staus : <span className="text-green-600">Active</span>
              </p>
              <div>
                <p className="text-xl font-bold">{getInvoiceData.name}</p>
                <p className="text-sm font-normal"></p>
              </div>

              <div className="flex gap-10 py-1">
                <span className="w-12">Description</span>
                <span className="font-normal">
                  {getInvoiceData.description}
                </span>
              </div>

              <div className="flex  gap-10">
                <span className="w-12">Amount</span>
                <span className="font-medium">
                  {getInvoiceData.amount}
                  {"  "}
                  {getInvoiceData.currency}
                </span>
              </div>
            </div>

            <div className="flex items-center">
              <QRCode
                size={180}
                value={getInvoiceData?.transactionDetails?.toAddress}
              />
            </div>
          </div>

          <Divider className="my-3 w-full" />

          <Timer initialTime={600} onTimerComplete={handleTimerComplete} />

          <Box className="my-3 w-full rounded-lg bg-[#D9D9D933] px-6 py-4">
            <Box className="flex items-center gap-2 py-2 text-[#C2912E]">
              <IoWarningOutline size={27} />
              <p className="text-base font-medium">Pay Attention to </p>
            </Box>

            <ul className="list-inside list-disc text-[#767676]">
              <li>Sending any other currency will result in loss of funds.</li>

              <li>
                If the wallet you are using charges a fee that reduces the total
                amount that is sent, please send enough to cover it.
              </li>
              <li>
                Network Fee:{" "}
                <span className="">
                  {Number(props.invoiceDetails?.NetworkFee).toFixed(6)}{" "}
                </span>
                {getInvoiceData?.transactionDetails?.assetId}
              </li>
            </ul>
          </Box>

          <Divider className="my-3 w-full" />

          <Box className="">
            <p className="font-normal">Amount to Pay</p>

            <Box className="flex items-center justify-between">
              <p className="text-2xl font-bold">
                {Number(
                  getInvoiceData?.transactionDetails?.exactAmount,
                ).toFixed(6)}{" "}
                {getInvoiceData?.transactionDetails?.assetId}
              </p>
              <IconButton
                onClick={() =>
                  handleCopy(getInvoiceData?.transactionDetails?.exactAmount)
                }
                edge="end"
              >
                <FiCopy size={15} color="black" />
              </IconButton>
            </Box>
          </Box>

          <Box className="my-2 w-full">
            <p className="pb-2 font-semibold">address to pay</p>

            <TextField
              size="small"
              className="w-full"
              value={getInvoiceData?.transactionDetails?.toAddress}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        handleCopy(
                          `${getInvoiceData?.transactionDetails?.toAddress}`,
                        )
                      }
                      edge="end"
                    >
                      <FiCopy size={15} color="black" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <div className="m-auto flex justify-center"></div>
        </Box>
      </Box>
    </Box>
  );
};

export default InvoiceScanner;
