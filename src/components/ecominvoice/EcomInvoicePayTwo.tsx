import React, { useEffect, useState } from "react";
import {
  Dialog,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import DownArrow from "../../assets/general/arrow_down.svg";
import Completed from "../../assets/general/complete.svg";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ApiHandler } from "~/service/UtilService";
import {
  getAssets,
  getEconUrlTransaction,
  pricelistFn,
  updateEconUrlTransaction,
} from "~/service/ApiRequests";
import Big from "big.js";

interface Asset {
  krakenAssetId: string;
  fireblockAssetId: string;
  icon: string;
  name: string;
  address?: string;
}

interface findPriceList {
  projectId: string;
  currencyId: string;
}

type propType = {
  onClose: (value?: any) => void;
  invoice?: Invoices;
  openAdd: string;
  setApiResponseData: (data: any) => void;
  onSubmitFee: (value?: any) => void;
};

type Fee = {
  currencyId: string;
  fixedFee: number;
  percent: number;
};

type PriceList = {
  TransferFees: Fee[];
};

const EcomInvoicePayTwo = (props: propType) => {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isInputVisible, setInputVisible] = useState(false);
  const [coin, setCoin] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [amount, setAmount] = useState<any>("");
  const [projectId, setProjectId] = useState<any>("");
  const [conversionValue, setConversionValue] = useState(0);
  const [withoutNetworkValue, setWithoutNetworkValue] = useState(0);

  const [requestedAsset, setRequestedAsset] = useState<any>("");
  const [getPriceList, setgetPriceList] = useState<any>("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [priceListLoaded, setPriceListLoaded] = useState(false);
  const [percentage, setpercentage] = useState<string | number>("");
  const [fixedFee, setFixedFee] = useState<string | number>("");
  const [markPercentage, setmarkPercentage] = useState<string | number>("");

  console.log({ withoutNetworkValue, conversionValue });

  useEffect(() => {
    fetchAssets();
    geteconurlTransaction();
  }, []);

  useEffect(() => {
    if (projectId) {
      fetchPriceList(projectId).then(() => setPriceListLoaded(true));
    }
  }, [projectId]);

  useEffect(() => {
    if (selectedAsset && amount && priceListLoaded) {
      fetchConversion(selectedAsset?.krakenAssetId, amount);
    }
  }, [selectedAsset, amount, priceListLoaded]);

  const fetchConversion = async (currency: string, amount: string) => {
    const pair = `${currency}/${requestedAsset}`;
    try {
      const response = await fetch(
        `https://api.kraken.com/0/public/Ticker?pair=${pair}`,
      );
      const data = await response.json();

      if (data.result[pair]) {
        const rate = data.result[pair]?.a[0];
        const numericAmount = Number(amount);

        const convertedValue = numericAmount / rate;
        const finalResult = parseFloat(convertedValue.toFixed(6));

        calculateConversionValue(
          getPriceList,
          selectedAsset,
          finalResult,
          setConversionValue,
          setWithoutNetworkValue,
        );
      }
    } catch (error) {}
  };

  const geteconurlTransaction = async () => {
    const url = window.location.href;
    const requestBody = { url };

    try {
      const [data, error]: APIResult<{
        requestedAmount: string;
        requestedAssetId: string;
        merchantId: string;
        status: string;
        createdAt: string;
      }> = await ApiHandler(getEconUrlTransaction, requestBody);
      setAmount(data?.body?.requestedAmount);
      setProjectId(data?.body?.merchantId);
      setRequestedAsset(data?.body?.requestedAssetId);
      const updatedObject: any = data?.body;

      if (data?.body?.status === "COMPLETED") {
        props.setApiResponseData(data);
        props.onClose("success");
      }
    } catch (error) {
      toast.error("Error initiating payment");
    }
  };

  const fetchPriceList = async (projectId: string) => {
    try {
      const response = await pricelistFn(projectId);
      setgetPriceList(response.data.body.findPriceList);
    } catch (error) {}
  };

  const handleTextClick = () => {
    setInputVisible(true);
    setIsSubmitted(false);
  };

  const handleCancelClick = () => {
    setInputVisible(false);
    setCoin("");
  };

  const handleSendClick = () => {
    setIsSubmitted(true);
    setInputVisible(false);
    setCoin("");
  };

  const handleBreadcrumbClick = (asset: Asset) => {
    setSelectedAsset(asset);
  };

  const handleContinueClick = async () => {
    if (!selectedAsset) {
      toast.error("Please select an asset");
      return;
    }
    const numericConversionValue = Number(conversionValue);
    const formattedConversionValue = !isNaN(numericConversionValue)
      ? parseFloat(numericConversionValue.toFixed(6))
      : 0;
    const NetworkFee = Number(percentage) + Number(fixedFee);
    const url = window.location.href;
    const requestBody = {
      currency: selectedAsset.fireblockAssetId,
      url,
      conversionValue: formattedConversionValue,
      networkFee: NetworkFee,
      fxmarkUp: markPercentage,
    };
    try {
      const [data, error]: APIResult<{ body: any }> = await ApiHandler(
        updateEconUrlTransaction,
        requestBody,
      );
      toast.success("Payment successfully initiated");
      props.onClose("scanner");
      props.onSubmitFee(NetworkFee);
      const additionalData = {
        conversionValue: formattedConversionValue,
        selectedAsset,
        withoutNetworkValue,
      };
      const combinedData = {
        ...data,
        ...additionalData,
      };
      props.setApiResponseData(combinedData);
    } catch (error) {
      toast.error("Error initiating payment");
    }
  };

  async function fetchAssets() {
    try {
      const [data] = await ApiHandler(getAssets);
      const res: any = data?.body ?? [];
      const filtered = res?.filter(
        (item: Asset) =>
          item?.fireblockAssetId !== "ANY" && item?.fireblockAssetId !== "EUR",
      );
      setAssets(filtered);
      if (filtered.length > 0) {
        setSelectedAsset(filtered[0]);
      }
    } catch (error) {}
  }

  const displayedAssets = assets.filter((asset) =>
    ["Bitcoin", "USDC (ERC20)", "USDT (ERC20)"].includes(asset.name),
  );

  const calculateConversionValue = (
    getPriceList: any,
    selectedAsset: any,
    FinalAmount: number | string,
    setFinalAmount: any,
    setWithoutNetworkValue: any,
  ) => {
    console.log({ FinalAmount });

    // =====================================================================
    const fromCurrencyIds: string[] = [];
    const toCurrencyIds: string[] = [];
    let foundAny = false;
    let MarkupFeePercentage;

    console.log("getPriceList?.FxMarkupFees: ", getPriceList?.FxMarkupFees);
    getPriceList?.FxMarkupFees.forEach(
      (index: { fromCurrencyId: string; toCurrencyId: string }) => {
        console.log("index: ", index);
        if (index.fromCurrencyId === "ANY" && index.toCurrencyId === "ANY") {
          foundAny = true;
        } else {
          fromCurrencyIds.push(index.fromCurrencyId);
          toCurrencyIds.push(index.toCurrencyId);
        }
      },
    );

    console.log("Fxmarkup ", !!getPriceList?.FxMarkupFees);

    if (foundAny) {
      getPriceList?.FxMarkupFees.forEach((index: { percent: any }) => {
        MarkupFeePercentage = index.percent;
      });
    } else if (fromCurrencyIds.includes("ANY")) {
      getPriceList?.FxMarkupFees.forEach(
        (index: { percent: any; fromCurrencyId: string }) => {
          if (
            index.fromCurrencyId === "ANY" &&
            toCurrencyIds.includes(selectedAsset.fireblockAssetId)
          ) {
            MarkupFeePercentage = index.percent;
            console.log(
              "MarkupFeePercentage fromCurrencyIds any",
              MarkupFeePercentage,
            );
          }
        },
      );
    } else if (toCurrencyIds.includes("ANY")) {
      getPriceList?.FxMarkupFees.forEach(
        (index: { percent: any; toCurrencyId: string }) => {
          if (
            index.toCurrencyId === "ANY" &&
            fromCurrencyIds.includes(requestedAsset)
          ) {
            MarkupFeePercentage = index.percent;
            console.log(
              "MarkupFeePercentage toCurrencyId any",
              MarkupFeePercentage,
            );
          }
        },
      );
    } else {
      let matched = false;

      getPriceList?.FxMarkupFees.forEach(
        (index: {
          fromCurrencyId: string;
          toCurrencyId: string;
          percent: any;
        }) => {
          if (
            index.fromCurrencyId === requestedAsset &&
            index.toCurrencyId === selectedAsset.fireblockAssetId
          ) {
            matched = true;
            MarkupFeePercentage = index.percent;
            console.log(
              `index.percent of ${
                (index.fromCurrencyId, "and ", index.toCurrencyId, "")
              } =`,
              index.percent,
            );
          }
        },
      );

      if (!matched) {
        console.log(
          "No matching currencies found for pairCurrency1 and selectedAsset.",
        );
        MarkupFeePercentage = "0";
      }
    }

    // =====================================================================
    if (
      getPriceList?.TransferFees.some(
        (fee: { currencyId: string }) => fee.currencyId === "ANY",
      )
    ) {
      // Step 1: FX Markup Calculation
      const markupFeePercentage = MarkupFeePercentage
        ? new Big(MarkupFeePercentage)
        : new Big(0);
      console.log("markupFeePercentage: ", markupFeePercentage.toString());

      const markupCalculation = markupFeePercentage
        .div(100)
        .times(new Big(FinalAmount));
      console.log("markupCalculation: ", markupCalculation.toString());

      // Step 2: Calculate new amount after FX markup
      const amountAfterFXMarkup = new Big(FinalAmount).plus(markupCalculation);
      console.log("amountAfterFXMarkup: ", amountAfterFXMarkup.toString());
      setmarkPercentage(markupCalculation.toString());

      // Step 3: Calculate Transfer Fees based on the new amount (amountAfterFXMarkup)

      // Get the max fixed fee
      const maxFixedFee =
        getPriceList?.TransferFees.filter(
          (fee: { currencyId: string }) => fee.currencyId === "ANY",
        ).map((fee: { fixedFee: any }) => new Big(fee.fixedFee))[0] ||
        new Big(0);

      // Calculate percentage-based fee
      const maxPercentCalc =
        getPriceList?.TransferFees.filter(
          (fee: { currencyId: string }) => fee.currencyId === "ANY",
        ).map((fee: { percent: any }) => new Big(fee.percent))[0] || new Big(0);
      console.log("maxPercentCalc: ", maxPercentCalc.toString());

      const calcAmount = maxPercentCalc.div(100).times(amountAfterFXMarkup);
      console.log("calcAmount: ", calcAmount.toString());

      // Step 4: Calculate final amount after adding all fees
      const afterCalcAmount = amountAfterFXMarkup
        .plus(calcAmount)
        .plus(maxFixedFee);
      console.log("afterCalcAmount: ", afterCalcAmount.toString());
      const withFxMarkup = new Big(FinalAmount).plus(markupCalculation);
      setWithoutNetworkValue(withFxMarkup.toString());
      setpercentage(calcAmount.toString());
      setFixedFee(maxFixedFee.toString());
      setFinalAmount(afterCalcAmount.toString());
    } else if (
      getPriceList?.TransferFees.some(
        (fee: { currencyId: string }) =>
          fee.currencyId === selectedAsset.fireblockAssetId,
      )
    ) {
      console.log("FinalAmount: ", FinalAmount);
      console.log("else if condition apply");
      // Step 1: FX Markup Calculation
      const markupFeePercentage = MarkupFeePercentage
        ? new Big(MarkupFeePercentage)
        : new Big(0);
      console.log("markupFeePercentage: ", markupFeePercentage.toString());

      const markupCalculation = markupFeePercentage
        .div(100)
        .times(new Big(FinalAmount));
      console.log("markupCalculation: ", markupCalculation.toString());

      // Step 2: Calculate new amount after FX markup
      const amountAfterFXMarkup = new Big(FinalAmount).plus(markupCalculation);
      console.log("amountAfterFXMarkup: ", amountAfterFXMarkup.toString());
      setmarkPercentage(markupCalculation.toString());
      setWithoutNetworkValue(amountAfterFXMarkup.toString());
      // Step 3: Calculate Transfer Fees based on the new amount (amountAfterFXMarkup)

      // Get the max fixed fee
      const maxFixedFee =
        getPriceList?.TransferFees.filter(
          (fee: { currencyId: string }) =>
            fee.currencyId === selectedAsset.fireblockAssetId,
        ).map((fee: { fixedFee: any }) => new Big(fee.fixedFee))[0] ||
        new Big(0);
      console.log("maxFixedFee: ", maxFixedFee.toString());

      // Calculate percentage-based fee
      const maxPercentCalc =
        getPriceList?.TransferFees.filter(
          (fee: { currencyId: string }) =>
            fee.currencyId === selectedAsset.fireblockAssetId,
        ).map((fee: { percent: any }) => new Big(fee.percent))[0] || new Big(0);
      console.log("maxPercentCalc: ", maxPercentCalc.toString());

      const calcAmount = maxPercentCalc.div(100).times(amountAfterFXMarkup);
      console.log("calcAmount: ", calcAmount.toString());

      // Step 4: Calculate final amount after adding all fees
      const afterCalcAmount = amountAfterFXMarkup
        .plus(calcAmount)
        .plus(maxFixedFee);
      console.log("afterCalcAmount: ", afterCalcAmount.toString());

      setpercentage(calcAmount.toString());
      setFixedFee(maxFixedFee.toString());
      setFinalAmount(afterCalcAmount.toString());
    } else {
      console.log("else  condition apply");
      const markupFeePercentage = MarkupFeePercentage
        ? new Big(MarkupFeePercentage)
        : new Big(0);

      console.log("markupFeePercentage", markupFeePercentage.toString());

      const markupCalculation = markupFeePercentage
        .div(100)
        .times(new Big(FinalAmount));
      console.log("markupCalculation", markupCalculation.toString());

      const afterCalculationmark = Big(FinalAmount).plus(markupCalculation);

      console.log("afterCalculationmark", afterCalculationmark.toString());
      const withFxMarkup = new Big(FinalAmount).plus(markupCalculation);
      setWithoutNetworkValue(withFxMarkup.toString());
      setFinalAmount(afterCalculationmark.toString());
      setmarkPercentage(markupCalculation.toString());
      setpercentage("0");
      setFixedFee("0");
    }
  };

  return (
    <div>
      <div className="fixed inset-0 flex w-screen items-center justify-center bg-[#f9fcff] p-4">
        <div className=" w-[90%] space-y-4 rounded-lg border bg-[#f9fcff] p-10 md:w-[700px]">
          <div className="text-center">
            <p className=" text-lg  font-semibold">
              Select the payment currency
            </p>
            <p className=" text-[13px] text-[#898da8]">Amount: {amount}</p>
          </div>

          <div className=" pb-6">
            <p className="text-sm font-semibold text-[#828893]">You pay</p>
            <p className=" text-[20px] font-semibold text-[#15161b]">
              {amount} {requestedAsset} ≈ {withoutNetworkValue}{" "}
              {selectedAsset ? selectedAsset.name : ""}
            </p>
          </div>

          <Listbox value={selectedAsset} onChange={setSelectedAsset}>
            <ListboxButton className="flex w-full items-center justify-between rounded-lg bg-[#eff3f4] p-3 pl-4 text-left">
              <div className="flex gap-2">
                {selectedAsset && (
                  <Image
                    src={selectedAsset.icon}
                    width={24}
                    height={24}
                    className="w-[24px]"
                    alt="icon"
                  />
                )}
                <p>{selectedAsset ? selectedAsset.name : "Select an asset"} </p>
              </div>
              <Image
                className=" h-2 w-3"
                src={DownArrow}
                alt="down arrow"
                width={12}
                height={8}
              />
            </ListboxButton>
            <ListboxOptions
              className="  mt-3 h-[40vh] w-[var(--button-width)] overflow-y-auto rounded-md bg-white shadow-[0px_4px_9px_0px_rgba(32,33,38,10.9)]"
              anchor="bottom"
            >
              {assets.map((asset) => (
                <ListboxOption
                  key={asset.fireblockAssetId}
                  value={asset}
                  className="group cursor-pointer rounded-lg   px-4 py-1.5 hover:bg-[#F4F5FB]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Image
                        src={asset.icon}
                        width={24}
                        height={24}
                        className="w-[24px]"
                        alt="icon"
                      />
                      {asset.name}
                    </div>
                  </div>
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Listbox>
          <div className="flex flex-wrap gap-2 pb-8">
            {displayedAssets.map((asset) => (
              <div
                key={asset.fireblockAssetId}
                className="breadcrumb flex w-fit cursor-pointer items-center gap-2 rounded-3xl border border-[#cdcdcd] py-1 pl-1 pr-2 text-sm"
                onClick={() => handleBreadcrumbClick(asset)}
              >
                <Image
                  className="w-[24px]"
                  src={asset.icon}
                  alt={asset.name}
                  width={24}
                  height={24}
                />
                <p className=" font-medium">{asset.name}</p>
                <p className="font-semibold text-[#898da8]">. {asset.name}</p>
              </div>
            ))}
          </div>
          <button
            onClick={handleContinueClick}
            className=" w-full rounded bg-[#C2912E] px-6 py-3 text-white "
          >
            Continue
          </button>

          <div className="pt-8">
            {!isInputVisible && !isSubmitted ? (
              <p
                className="w-fit cursor-pointer text-base text-blue-500 underline"
                onClick={handleTextClick}
              >
                The coin you want isn&apos;t on the list ?
              </p>
            ) : isSubmitted ? (
              <div className="flex items-center gap-2">
                <Image src={Completed} alt="completed" width={24} height={24} />
                <p>Thank you for the information.</p>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <label className=" w-full ">
                  <p className="">What coin would you like to pay with?</p>
                  <input
                    type="text"
                    value={coin}
                    onChange={(e) => setCoin(e.target.value)}
                    className="border=[#cdcdcd] w-full border-b-2 bg-transparent p-1 outline-none"
                  />
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelClick}
                    className="ml-2 p-1  text-black"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendClick}
                    className="ml-2 rounded-[3px] bg-[#4285F5] px-6 py-[5px] text-white shadow-[0px_2px_4px_0px_rgba(67,115,195)]"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default EcomInvoicePayTwo;
