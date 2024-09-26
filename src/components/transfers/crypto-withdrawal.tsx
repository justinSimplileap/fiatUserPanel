"use client";
import {
  Fragment,
  useState,
  useMemo,
  type ChangeEvent,
  useEffect,
} from "react";
import {
  Autocomplete,
  TextField,
  useMediaQuery,
} from "@mui/material";
import { Controller, useForm, useWatch } from "react-hook-form";
import Image, { type StaticImageData } from "next/image";
import TransitionDialog from "../common/TransitionDialog";
import TwoFA from "../TwoFA";
import useAsyncMasterStore from "~/hooks/useAsyncMasterStore";
import useGlobalStore from "~/store/useGlobalStore";
import {
  getLimits,
  getEuroTemplates,
} from "~/service/api/transaction";
import toast from "react-hot-toast";
import useDashboard from "~/hooks/useDashboard";
import Router, { useRouter } from "next/router";
import ConfirmDailog from "./confirmDailog";
import { ApiHandler } from "~/service/UtilService";
import {
  SendEuroMail,
  createTransfer,
} from "~/service/ApiRequests";
import {
  changeName,
  coinForKrakenName,
} from "~/helpers/helper";
import localStorageService from "~/service/LocalstorageService";
import { getTransferFeesByPricelistId } from "~/service/api/pricelists";
import CryptoTable from "./crypto-table";
import DownArrow from "../../assets/general/arrow_down.svg"

const WithdrawalInit: CryptoWithdrawalForm = {
  assetId: "",
  from: "",
  amount: "",
  paymentSystem: "",
  IBAN: "",
  customerName: "",
  customerAddress: "",
  Zipcode: "",
  Customercity: "",
  Country: "",
  Reference: "",
  Description: "",
  swiftBic: "",
  Bankname: "",
  Bankaddress: "",
  Banklocation: "",
  bankcountry: "",
  isApproved: false,
  addressType: "ONETIME",
  description: "",
  reference: "",
  isMax: false,
  countryOfIssue: "",
  bankName: "",
  bankAddress: "",
  bankLocation: "",
  bankCountry: "",
  transferFee: "",
  paymentSystemType: "",
  customerZipcode: "",
  euroTemplate: ""
};

const FeeInit: CalculatedFee = {
  net: 0,
  withdrawal: "",
  fee: 0,
  minimumFee: "",
  maximumFee: "",
};

interface Template {
  index: number;
  templateName: string;
}

const CryptoWithdrawal = () => {
  const dashboard = useGlobalStore((state) => state.dashboard);
  const router = useRouter();
  const countryList = useAsyncMasterStore<"country">("country");


  // Accessing router properties
  const { pathname, query, asPath } = router;

  const assets = useAsyncMasterStore<"assets">("assets");

  const filteredAssets = assets.filter(
    (asset) => asset.fireblockAssetId !== "USD",
  );

  const dashboardAssets = useDashboard()?.assets;
  const [whitelistedAddress, tfaEnabled, getUserPriceList, user, priceList] =
    useGlobalStore((state) => [
      state.whitelistedAddress,
      state.user.tfaEnabled,
      state.getUserPriceList,
      state.user,
      state.priceList,
    ]);

  const [transaction, setTrasaction] = useState<{
    data: CryptoWithdrawalForm;
    fee: CalculatedFee;
  }>({
    data: WithdrawalInit,
    fee: FeeInit,
  });

  const [popupState, setPopupState] = useState<"CONFIRM" | "2FA" | "">("");
  const [open, setOpen] = useState<string>("");
  const [transferFees, setTransferFees] = useState<TransferFees[]>([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<CryptoWithdrawalForm>({
    defaultValues: WithdrawalInit,
  });

  useEffect(() => {
    if (user.priceList) {
      getUserPriceList(user.priceList);
    }
    console.log("countryList", countryList)
  }, []);

  const assetId = watch("assetId");
  const amount = watch("amount");
  const transferFee = watch("transferFee");

  const selectedAsset = useWatch({
    control,
    name: "assetId",
  });

  const [limits, setLimits] = useState<Limits[]>();

  const [euroTemplates, setEuroTemplates] = useState<EuroMail[]>();
  const [adminEmail, setAdminEmail] = useState("");
  const [otcConfirmData, setOtcConfirmData] = useState<any>();
  const isSmallScreen = useMediaQuery("(max-width:1200px)");

  useEffect(() => {
    // Check if there is data in verificationStatus.isUserVerified

    if (query?.from) {
      setValue(
        "assetId",
        query?.from?.toString() ? query?.from?.toString() : "",
      );
    } else if (query?.amount) {
      setValue(
        "assetId",
        query?.assetId?.toString() ? query?.assetId?.toString() : "",
      );

      setValue(
        "amount",
        query?.amount?.toString() ? query?.amount?.toString() : "",
      );

      setValue(
        "oneTimeAddress",
        query?.sourceAddress?.toString()
          ? query?.sourceAddress?.toString()
          : "",
      );
    }

    getLimits().then(([res]) => {
      if (res?.success && res?.body) {
        setLimits(res?.body);
      }
    });

    fetchTemplates();

    const adminEmail = localStorageService.getAdminEmail();
    if (adminEmail) setAdminEmail(adminEmail);
  }, []);

  function fetchTemplates() {
    getEuroTemplates().then(([res]) => {
      if (res?.success && res?.body) {
        const newArray = res?.body?.map((item, index) => ({
          index: index,
          ...item,
        }));

        setEuroTemplates(newArray);
      }
    });
  }

  const admin = useGlobalStore((state) => state.admin);

  useEffect(() => {
    if (priceList) {
      setTransferFees(priceList.TransferFees ?? []);
    }
  }, [priceList]);

  const template = watch("euroTemplate");

  const isTemplateApproved = watch("isApproved");

  const isTemplateSelected = watch("euroTemplate");

  const selectedWhiteList = useWatch({
    control,
    name: "whitelistId",
  });

  const currentAddressType = useWatch({
    control,
    name: "addressType",
  });
  const isMax = useWatch({
    control,
    name: "isMax",
  });

  const whitelistOptions = useMemo(
    () => whitelistedAddress.filter((item) => item.assetId === selectedAsset),
    [selectedAsset],
  );

  const assetBalance = useMemo(
    () => dashboardAssets.find((item) => item.assetId === selectedAsset),
    [selectedAsset, dashboard],
  );

  const fetchTransaferFees = async (assetId: any) => {
    const [res] = await getTransferFeesByPricelistId(dashboard.priceList);

    if (res !== null && "body" in res) {
      const filteredData = res?.body?.find((item: any) => {
        return (
          item?.operationType === 2 &&
          (item?.currencyId === "ANY" || item?.currencyId === assetId)
        );
      });

      // Define default values, even if `filteredData` is undefined
      const fees = {
        percent: filteredData?.percent ?? 0, // Default to 0
        fixedfee: filteredData?.fixedFee ?? 0, // Default to 0
        status: res?.success ?? false, // Default to false
        minimumFee: filteredData?.minimumFee ?? "0", // Default to "0" as a string
        maximumFee: filteredData?.maximumFee ?? "0", // Default to "0" as a string
      };

      return fees;
    }

    // Return default values if the response or data is not available
    return {
      percent: 0,
      fixedfee: 0,
      status: false, // Assuming the operation failed or no data
      minimumFee: "0", // Default to "0" as a string
      maximumFee: "0", // Default to "0" as a string
    };
  };

  const [euroTrasaction, setEuroTrasaction] = useState<EuroMail>();

  const fetchLimitsPair = async (value: string) => {
    const pair2 = coinForKrakenName(value) + "/EUR";
    try {
      const response = await fetch(
        `https://api.kraken.com/0/public/Ticker?pair=${changeName(pair2)}`,
      );

      const data = await response.json();

      if (data.result[changeName(pair2)]) {
        return data.result[changeName(pair2)]?.a[0];
      }
    } catch (error) { }
  };

  const onSubmit = (data: CryptoWithdrawalForm) => {
    if (selectedAsset === "EUR" && !isTemplateSelected) {
      void handleSaveTemplate();
    } else {
      const feeData = {
        withdrawal: data?.amount,
        net: 0,
        fee: 0,
        minimumFee: "",
        maximumFee: "",
      };

      const euroData: EuroMail = {
        assetId: data?.assetId,
        from: data?.from,
        amount: data?.amount,
        paymentSystem: data?.paymentSystem,
        IBAN: data?.IBAN,
        customerName: data?.customerName,
        customerAddress: data?.customerAddress,
        Zipcode: data?.Zipcode,
        Customercity: data?.Customercity,
        Country: data?.Country,
        Reference: data?.Reference,
        Description: data?.Description,
        swiftBic: data?.swiftBic,
        Bankname: data?.Bankname,
        Bankaddress: data?.Bankaddress,
        Banklocation: data?.Banklocation,
        bankcountry: data?.bankcountry,
        isApproved: data?.isApproved,
      };

      setEuroTrasaction(euroData);
    }
  };

  const on2FASubmit = async () => {
    if (selectedAsset === "EUR") {
      const [res, error] = await ApiHandler(SendEuroMail, euroTrasaction);
      if (res?.success) {
        setOpen("EURO");
        setPopupState("");
      }
    } else {
      const formData = {
        assetId: transaction?.data?.assetId,
        amount: transaction?.data?.amount,
        oneTimeAddress:
          transaction.data.addressType === "WHITELIST"
            ? whitelistOptions.find(
              (item) => item.id === transaction.data.whitelistId,
            )?.assetAddress
            : transaction.data.addressType === "ONETIME"
              ? transaction.data.oneTimeAddress
              : "",
        description: transaction?.data?.description,
        transactionFee: transaction?.fee?.fee,
      };

      const [data, error] = await ApiHandler(createTransfer, formData);

      if (data?.success == true) {
        toast.success("Transaction Submitted");
        setPopupState("");
        reset();
      }

      if (error) {
        toast.error("Error occurred please try again");
        setPopupState("");
      }
    }
  };

  const assetValue = filteredAssets?.find(
    (item) => item.fireblockAssetId === assetId,
  );
  const LabelName = ({ name, label }: any) => {
    return (
      <label htmlFor={name} className="subText my-1 block">
        {label}
      </label>
    );
  };

  function handleSaveTemplate() {
    const euroTemplate = {
      assetId: watch("assetId"),
      from: watch("from"),
      amount: watch("amount"),
      paymentSystem: watch("paymentSystem"),
      IBAN: watch("IBAN"),
      customerName: watch("customerName"),
      customerAddress: watch("customerAddress"),
      Zipcode: watch("Zipcode"),
      Customercity: watch("Customercity"),
      Country: watch("Country"),
      Reference: watch("Reference"),
      Description: watch("Description"),
      swiftBic: watch("swiftBic"),
      Bankname: watch("Bankname"),
      Bankaddress: watch("Bankaddress"),
      Banklocation: watch("Banklocation"),
      bankcountry: watch("bankcountry"),
    };
  }

  return (
    <div>
      <div className="">
        <p className="lg:mt-8 mt-4 mb-3 text-center text-base font-semibold">
          CREATE A NEW TRANSFER
        </p>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col justify-center gap-4 md:flex-row">
            <div className={`${`w-full lg:w-[34%] md:w-full`}  `}>
              <div className="flex flex-col gap-2 rounded bg-white p-6 pb-16 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.25)] ">
                <div className="border-b-2 pb-4 lg:flex lg:content-between lg:items-center">
                  <p className="font-bold me-5 lg:pb-0 pb-3">Basic Details</p>
                  <Controller
                    control={control}
                    name="assetId"
                    rules={{
                      required: "Please select an asset",
                    }}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <Fragment>
                        <Autocomplete
                          size={isSmallScreen ? "small" : "medium"}
                          className="lg:w-[70%]"
                          options={filteredAssets}
                          onChange={(_, nextValue) => {
                            onChange(nextValue?.fireblockAssetId ?? "");
                            setValue("whitelistId", "");
                          }}
                          value={assetValue ? assetValue : null}
                          getOptionLabel={(option) => {
                            return option.name ? option.name : value;
                          }}
                          renderOption={(props, option) => (
                            <li
                              {...props}
                              className="flex cursor-pointer items-center gap-2 p-2"
                            >
                              <Image
                                src={option.icon ?? ""}
                                alt={option.name}
                                width={30}
                                height={30}
                              />
                              {option.name}
                            </li>
                          )}
                          renderInput={(params) => (
                            <TextField
                              className="flex items-center gap-2 bg-[#ffffff]"
                              {...params}
                              placeholder="Select Templates"
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: assetValue && (
                                  <Image
                                    className="ml-2 h-5 w-4"
                                    src={assetValue?.icon ?? ""}
                                    alt={assetValue?.name}
                                    width={80}
                                    height={80}
                                  />
                                ),
                                endAdornment: (
                                  <Fragment>
                                    <Image
                                      className="md:h-2 md:w-3 h-2 w-2"
                                      src={DownArrow}
                                      alt="down arrow"
                                      width={10}
                                      height={6}
                                      style={{ padding: '0', marginRight: '0px' }}
                                    />
                                  </Fragment>
                                ),
                                sx: {
                                  paddingRight: '15px !important',
                                },
                              }}
                              variant="outlined"
                            />
                          )}
                        />
                        <p className="text-sm text-red-500">{error?.message}</p>
                      </Fragment>
                    )}
                  />
                </div>
                <div className="mt-3">
                  <Controller
                    control={control}
                    name="from"
                    rules={{
                      required: "Please select from",
                    }}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <Fragment>
                        {/* Label outside the input field */}
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          From
                        </label>

                        <Autocomplete
                          size={isSmallScreen ? "small" : "medium"}
                          options={filteredAssets}
                          onChange={(_, nextValue) => {
                            onChange(nextValue?.fireblockAssetId ?? "");
                            setValue("whitelistId", "");
                          }}
                          value={assetValue ? assetValue : null}
                          getOptionLabel={(option) => {
                            return option.name ? option.name : value;
                          }}
                          renderOption={(props, option) => (
                            <li
                              {...props}
                              className="flex cursor-pointer items-center gap-2 p-2"
                            >
                              <Image
                                src={option.icon ?? ""}
                                alt={option.name}
                                width={30}
                                height={30}
                              />
                              {option.name}
                            </li>
                          )}
                          renderInput={(params) => (
                            <TextField
                              className="flex items-center gap-2 bg-[#ffffff]"
                              {...params}
                              placeholder="Select From"
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: assetValue && (
                                  <Image
                                    className="ml-2 h-5 w-4"
                                    src={assetValue?.icon ?? ""}
                                    alt={assetValue?.name}
                                    width={80}
                                    height={80}
                                  />
                                ),
                                endAdornment: (
                                  <Fragment>
                                    <Image
                                      className="md:h-3 md:w-3 h-2 w-2"
                                      src={DownArrow}
                                      alt="down arrow"
                                      width={12}
                                      height={8}
                                      style={{ padding: '0', marginRight: '0px' }} // Adjust padding here
                                    />
                                  </Fragment>
                                ),
                                sx: {
                                  paddingRight: '15px !important', // Remove the right padding applied by default
                                },
                              }}
                              variant="outlined"
                            />
                          )}
                        />
                        <p className="text-sm text-red-500">{error?.message}</p>
                      </Fragment>
                    )}
                  />

                </div>

                <div>
                  <div className=" mt-3">
                    <Controller
                      name="amount"
                      control={control}
                      rules={{
                        required: "Please enter the amount",
                        max: {
                          value: assetBalance?.balance ?? 0,
                          message: "Amount cannot be more than balance",
                        },
                        validate: (amount) =>
                          parseFloat(amount) > 0
                            ? undefined
                            : "Amount cannot be zero or less than zero",
                      }}
                      render={({
                        field: { onChange, value },
                        fieldState: { error },
                      }) => (
                        <Fragment>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Amount
                          </label>
                          <TextField
                            type="number"
                            onWheel={() =>
                              (
                                document?.activeElement as HTMLInputElement
                              )?.blur()
                            }
                            size={isSmallScreen ? "small" : "medium"}
                            fullWidth
                            onChange={onChange}
                            value={value ? value : ""}
                            variant="outlined"
                            disabled={isMax}
                          />
                          <p className="text-sm text-red-500">
                            {error?.message}
                          </p>
                        </Fragment>
                      )}
                    />
                  </div>
                  <div className="ml-1 mt-4 flex w-fit items-center gap-2">
                    <input
                      {...register("isMax", {
                        onChange: (event: ChangeEvent<HTMLInputElement>) => {
                          setValue(
                            "amount",
                            event.target?.checked
                              ? String(assetBalance?.balance) ?? "0"
                              : "0",
                          );
                        },
                      })}
                      className=" mt-1 scale-150"
                      type="checkbox"
                      id="max"
                    />
                    <label
                      className="text-md text-[#6E6E6E]"
                      htmlFor="max"
                    >
                      Max (
                      {assetBalance?.balance
                        ? `${Number(assetBalance?.balance).toFixed(6) ?? 0} ${assetBalance?.name ?? ""
                        }`
                        : 0}
                      )
                    </label>
                  </div>
                </div>

                <div className="mt-3">
                  <Controller
                    control={control}
                    name="paymentSystem"
                    rules={{
                      required: "Please select a payment system",
                    }}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <Fragment>
                        {/* Label outside the input field */}
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Payment system types
                        </label>

                        <Autocomplete
                          size={isSmallScreen ? "small" : "medium"}
                          options={filteredAssets}
                          onChange={(_, nextValue) => {
                            onChange(nextValue?.fireblockAssetId ?? "");
                            setValue("whitelistId", "");
                          }}
                          value={assetValue ? assetValue : null}
                          getOptionLabel={(option) => {
                            return option.name ? option.name : value;
                          }}
                          renderOption={(props, option) => (
                            <li
                              {...props}
                              className="flex cursor-pointer items-center gap-2 p-2"
                            >
                              <Image
                                src={option.icon ?? ""}
                                alt={option.name}
                                width={30}
                                height={30}
                              />
                              {option.name}
                            </li>
                          )}
                          renderInput={(params) => (
                            <TextField
                              className="flex items-center gap-2 bg-[#ffffff]"
                              {...params}
                              placeholder="Select currency"
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: assetValue && (
                                  <Image
                                    className="ml-2 h-5 w-4"
                                    src={assetValue?.icon ?? ""}
                                    alt={assetValue?.name}
                                    width={80}
                                    height={80}
                                  />
                                ),
                                endAdornment: (
                                  <Fragment>
                                    <Image
                                      className="md:h-3 md:w-3 h-2 w-2"
                                      src={DownArrow}
                                      alt="down arrow"
                                      width={12}
                                      height={8}
                                      style={{ padding: '0', marginRight: '0px' }} // Adjust padding
                                    />
                                  </Fragment>
                                ),
                                sx: {
                                  paddingRight: '15px !important', // Remove extra padding
                                },
                              }}
                              variant="outlined"
                            />
                          )}
                        />
                        <p className="text-sm text-red-500">{error?.message}</p>
                      </Fragment>
                    )}
                  />

                </div>
              </div>
              <div className="flex flex-col gap-2 rounded  bg-[#C1902D1F]  shadow-[0px_1px_3px_0px_rgba(0,0,0,0.25)] md:mt-6 mt-4 md:px-12 md:py-12 px-6">
                <div className="flex justify-between text-base font-bold py-3">
                  <span>Transfers</span>
                  <span>0</span>
                </div>

                <div className="flex justify-between text-base font-bold py-3">
                  <span>Fees</span>
                  <span>0</span>
                </div>
                <div className="flex justify-between text-base font-bold py-3">
                  <span>Amount</span>
                  <span>0</span>
                </div>
              </div>
            </div>
            <div className=" w-full rounded bg-white p-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.25)] lg:w-[64%] md:w-full">
              <div className="w-full">
                <div className="border-b-2 py-2">
                  <p className=" mb-4 font-bold">Enter Beneficiary Details</p>
                </div>
                <div className="w-full">
                  <div className="lg:grid w-full grid-cols-1 items-baseline gap-4 lg:grid-cols-2">
                    <div className=" text-base  md:col-span-2 pt-4">
                      <label
                        className="text-base text-[#6E6E6E]"
                        htmlFor="max"
                      >
                        Enter Customer Info
                      </label>
                    </div>

                    {/* IBAN  */}
                    <div className="pt-4">
                      <LabelName name="IBAN" label="IBAN*"></LabelName>
                      <div className="flex flex-col">
                        <Controller
                          name="IBAN"
                          control={control}
                          rules={{
                            required: "Please enter company name",
                          }}
                          render={({
                            field: { onChange, value },
                            fieldState: { error },
                          }) => (
                            <Fragment>
                              <TextField
                                type="text"
                                size="small"
                                fullWidth
                                onChange={onChange}
                                value={value ? value : ""}
                                variant="outlined"
                              />
                              <p className="text-sm text-red-500">
                                {error?.message}
                              </p>
                            </Fragment>
                          )}
                        />
                      </div>
                    </div>

                    {/* CUSTOMER NAME  */}
                    <div className="pt-4">
                      <div className="flex flex-col ">
                        <LabelName
                          name="customerName"
                          label="Customer name*"
                        ></LabelName>

                        <Controller
                          name="customerName"
                          control={control}
                          rules={{
                            required: "Please enter customer name",
                          }}
                          render={({
                            field: { onChange, value },
                            fieldState: { error },
                          }) => (
                            <Fragment>
                              <TextField
                                type="text"
                                size="small"
                                fullWidth
                                onChange={onChange}
                                value={value ? value : ""}
                                variant="outlined"
                              />
                              <p className="text-sm text-red-500">
                                {error?.message}
                              </p>
                            </Fragment>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Test 2 */}
                  <div className="lg:grid w-full grid-cols-1 items-baseline gap-4 lg:grid-cols-2">
                    {/* Customer address*  */}
                    <div className="pt-4">
                      <LabelName name="customerAddress" label="Customer address*"></LabelName>
                      <div className="flex flex-col">
                        <Controller
                          name="customerAddress"
                          control={control}
                          rules={{
                            required: "Please enter customer address",
                          }}
                          render={({
                            field: { onChange, value },
                            fieldState: { error },
                          }) => (
                            <Fragment>
                              <TextField
                                type="text"
                                size="small"
                                fullWidth
                                onChange={onChange}
                                value={value ? value : ""}
                                variant="outlined"
                              />
                              <p className="text-sm text-red-500">
                                {error?.message}
                              </p>
                            </Fragment>
                          )}
                        />
                      </div>
                    </div>

                    <div className="lg:grid w-full grid-cols-1 items-baseline gap-4 lg:grid-cols-2">
                      {/* Zip code  */}
                      <div className="pt-4">
                        <LabelName name="Zipcode" label="Zip code*"></LabelName>
                        <div className="flex flex-col">
                          <Controller
                            name="Zipcode"
                            control={control}
                            rules={{
                              required: "Please enter company name",
                            }}
                            render={({
                              field: { onChange, value },
                              fieldState: { error },
                            }) => (
                              <Fragment>
                                <TextField
                                  type="text"
                                  size="small"
                                  fullWidth
                                  onChange={onChange}
                                  value={value ? value : ""}
                                  variant="outlined"
                                />
                                <p className="text-sm text-red-500">
                                  {error?.message}
                                </p>
                              </Fragment>
                            )}
                          />
                        </div>
                      </div>

                      {/* Customer city*  */}
                      <div className="pt-4">
                        <div className="flex flex-col ">
                          <LabelName
                            name="Customercity"
                            label="Customer city*"
                          ></LabelName>

                          <Controller
                            name="Customercity"
                            control={control}
                            rules={{
                              required: "Please enter customer city",
                            }}
                            render={({
                              field: { onChange, value },
                              fieldState: { error },
                            }) => (
                              <Fragment>
                                <TextField
                                  type="text"
                                  size="small"
                                  fullWidth
                                  onChange={onChange}
                                  value={value ? value : ""}
                                  variant="outlined"
                                />
                                <p className="text-sm text-red-500">
                                  {error?.message}
                                </p>
                              </Fragment>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Test 3 */}
                  <div className="lg:grid w-full grid-cols-1 items-baseline gap-4 lg:grid-cols-3">
                    {/* Country*  */}

                    <div className="pt-4">
                      <LabelName name="Country" label="Country*"></LabelName>
                      <Controller
                        control={control}
                        name="Country"
                        rules={{
                          required: "Please select from",
                        }}
                        render={({
                          field: { value, onChange },
                          fieldState: { error },
                        }) => (
                          <Fragment>
                            <Autocomplete
                              size="small"
                              options={filteredAssets}
                              onChange={(_, nextValue) => {
                                onChange(nextValue?.fireblockAssetId ?? "");
                                setValue("whitelistId", "");
                              }}
                              value={assetValue ? assetValue : null}
                              getOptionLabel={(option) => {
                                return option.name ? option.name : value;
                              }}
                              renderOption={(props, option) => (
                                <li {...props} className="flex cursor-pointer items-center gap-2 p-2">
                                  <Image
                                    src={option.icon ?? ""}
                                    alt={option.name}
                                    width={30}
                                    height={30}
                                  />
                                  {option.name}
                                </li>
                              )}
                              renderInput={(params) => (
                                <TextField
                                  className="flex items-center gap-2 bg-[#ffffff]"
                                  {...params}
                                  InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (() => {
                                      return (
                                        <Fragment>
                                          {assetValue && (
                                            <Image
                                              className="ml-2 h-5 w-4"
                                              src={assetValue?.icon ?? ""}
                                              alt={assetValue?.name}
                                              width={80}
                                              height={80}
                                            />
                                          )}
                                        </Fragment>
                                      );
                                    })(),
                                    endAdornment: (
                                      <Fragment>
                                        <Image
                                          className="md:h-3 md:w-3 h-2 w-2"
                                          src={DownArrow}
                                          alt="down arrow"
                                          width={12}
                                          height={8}
                                        />
                                      </Fragment>
                                    ),
                                    sx: {
                                      paddingRight: '15px !important',
                                    },
                                  }}
                                  variant="outlined"
                                />
                              )}
                            />
                            <p className="text-sm text-red-500">{error?.message}</p>
                          </Fragment>
                        )}
                      />

                    </div>

                    {/* Reference  */}
                    <div className="pt-4">
                      <div className="flex flex-col ">
                        <LabelName
                          name="Reference"
                          label="Reference"
                        ></LabelName>

                        <Controller
                          name="Reference"
                          control={control}
                          rules={{
                            required: "Please enter customer name",
                          }}
                          render={({
                            field: { onChange, value },
                            fieldState: { error },
                          }) => (
                            <Fragment>
                              <TextField
                                type="text"
                                size="small"
                                fullWidth
                                onChange={onChange}
                                value={value ? value : ""}
                                variant="outlined"
                              />
                              <p className="text-sm text-red-500">
                                {error?.message}
                              </p>
                            </Fragment>
                          )}
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <div className="flex flex-col ">
                        <LabelName
                          name="Description"
                          label="Description"
                        ></LabelName>

                        <Controller
                          name="Description"
                          control={control}
                          rules={{
                            required: "Please enter description",
                          }}
                          render={({
                            field: { onChange, value },
                            fieldState: { error },
                          }) => (
                            <Fragment>
                              <TextField
                                type="text"
                                size="small"
                                fullWidth
                                onChange={onChange}
                                value={value ? value : ""}
                                variant="outlined"
                              />
                              <p className="text-sm text-red-500">
                                {error?.message}
                              </p>
                            </Fragment>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="lg:grid w-full grid-cols-1 items-baseline gap-4 lg:grid-cols-2">
                    <div className=" text-base  md:col-span-2 lg:pt-12 pt-8">
                      <label
                        className="text-base text-[#6E6E6E]"
                        htmlFor="max"
                      >
                        Enter Banking Info
                      </label>
                    </div>

                    {/* Swift/Bic*  */}
                    <div className="pt-4">
                      <LabelName name="swiftBic" label="Swift/Bic*"></LabelName>
                      <div className="flex flex-col">
                        <Controller
                          name="swiftBic"
                          control={control}
                          rules={{
                            required: "Please enter company name",
                          }}
                          render={({
                            field: { onChange, value },
                            fieldState: { error },
                          }) => (
                            <Fragment>
                              <TextField
                                type="text"
                                size="small"
                                fullWidth
                                onChange={onChange}
                                value={value ? value : ""}
                                variant="outlined"
                              />
                              <p className="text-sm text-red-500">
                                {error?.message}
                              </p>
                            </Fragment>
                          )}
                        />
                      </div>
                    </div>

                    {/* Bank name*  */}
                    <div className="pt-4">
                      <div className="flex flex-col ">
                        <LabelName
                          name="Bankname*"
                          label="Bank name*"
                        ></LabelName>

                        <Controller
                          name="Bankname"
                          control={control}
                          rules={{
                            required: "Please enter bank name",
                          }}
                          render={({
                            field: { onChange, value },
                            fieldState: { error },
                          }) => (
                            <Fragment>
                              <TextField
                                type="text"
                                size="small"
                                fullWidth
                                onChange={onChange}
                                value={value ? value : ""}
                                variant="outlined"
                              />
                              <p className="text-sm text-red-500">
                                {error?.message}
                              </p>
                            </Fragment>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid w-full grid-cols-1 items-baseline gap-4 md:grid-cols-1">
                    {/* Bank address*  */}
                    <div className="pt-4">
                      <LabelName name="Bankaddress" label="Bank address*"></LabelName>
                      <div className="flex flex-col">
                        <Controller
                          name="Bankaddress"
                          control={control}
                          rules={{
                            required: "Please enter bank address",
                          }}
                          render={({
                            field: { onChange, value },
                            fieldState: { error },
                          }) => (
                            <Fragment>
                              <TextField
                                type="text"
                                size="small"
                                fullWidth
                                onChange={onChange}
                                value={value ? value : ""}
                                variant="outlined"
                              />
                              <p className="text-sm text-red-500">
                                {error?.message}
                              </p>
                            </Fragment>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="lg:grid w-full grid-cols-1 items-baseline gap-4 lg:grid-cols-2">
                    {/* Bank Location*  */}
                    <div className="pt-4">
                      <LabelName name="Banklocation" label="Bank Location*"></LabelName>
                      <div className="flex flex-col">
                        <Controller
                          name="Banklocation"
                          control={control}
                          rules={{
                            required: "Please enter bank location",
                          }}
                          render={({
                            field: { onChange, value },
                            fieldState: { error },
                          }) => (
                            <Fragment>
                              <TextField
                                type="text"
                                size="small"
                                fullWidth
                                onChange={onChange}
                                value={value ? value : ""}
                                variant="outlined"
                              />
                              <p className="text-sm text-red-500">
                                {error?.message}
                              </p>
                            </Fragment>
                          )}
                        />
                      </div>
                    </div>
                    <div className="pt-4">
                      <LabelName name="Country" label="Country*"></LabelName>
                      <Controller
                        control={control}
                        name="bankCountry"
                        rules={{
                          required: "Please select country",
                        }}
                        render={({
                          field: { value, onChange },
                          fieldState: { error },
                        }) => (
                          <Fragment>
                            <Autocomplete
                              size="small"
                              options={filteredAssets}
                              onChange={(_, nextValue) => {
                                onChange(nextValue?.fireblockAssetId ?? "");
                                setValue("whitelistId", "");
                              }}
                              value={assetValue ? assetValue : null}
                              getOptionLabel={(option) => {
                                return option.name ? option.name : value;
                              }}
                              renderOption={(props, option) => (
                                <li {...props} className="flex cursor-pointer items-center gap-2 p-2">
                                  <Image
                                    src={option.icon ?? ""}
                                    alt={option.name}
                                    width={30}
                                    height={30}
                                  />
                                  {option.name}
                                </li>
                              )}
                              renderInput={(params) => (
                                <TextField
                                  className="flex items-center gap-2 bg-[#ffffff]"
                                  {...params}
                                  InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (() => {
                                      return (
                                        <Fragment>
                                          {assetValue && (
                                            <Image
                                              className="ml-2 h-5 w-4"
                                              src={assetValue?.icon ?? ""}
                                              alt={assetValue?.name}
                                              width={80}
                                              height={80}
                                            />
                                          )}
                                        </Fragment>
                                      );
                                    })(),
                                    endAdornment: (
                                      <Fragment>
                                        <Image
                                          className="md:h-3 md:w-3 h-2 w-2"
                                          src={DownArrow}
                                          alt="down arrow"
                                          width={12}
                                          height={8}
                                        />
                                      </Fragment>
                                    ),
                                    sx: {
                                      paddingRight: '15px !important',
                                    },
                                  }}
                                  variant="outlined"
                                />
                              )}
                            />
                            <p className="text-sm text-red-500">{error?.message}</p>
                          </Fragment>
                        )}
                      />
                    </div>
                  </div>

                  <div className="ml-1 mt-4 flex w-fit items-center gap-2">
                    <input
                      {...register("isMax", {
                        onChange: (event: ChangeEvent<HTMLInputElement>) => {
                          setValue(
                            "amount",
                            event.target?.checked
                              ? String(assetBalance?.balance) ?? "0"
                              : "0",
                          );
                        },
                      })}
                      className=" mt-1 scale-100"
                      type="checkbox"
                      id="max"
                    />
                    <label
                      className="text-md  text-[#6E6E6E]"
                      htmlFor="max"
                    >
                      Save template
                    </label>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </form>
        <CryptoTable />
        <TransitionDialog open={!!popupState} onClose={() => setPopupState("")}>
          {popupState === "CONFIRM" ? (
            <ConfirmDailog
              assetAddress={
                transaction.data.addressType === "ONETIME"
                  ? transaction.data.oneTimeAddress
                  : whitelistOptions.find(
                    (item) => item.id === transaction.data.whitelistId,
                  )?.assetAddress
              }
              label={
                transaction.data.addressType === "WHITELIST"
                  ? whitelistOptions.find(
                    (item) => item.id === transaction.data.whitelistId,
                  )?.label
                  : ""
              }
              amount={transaction?.fee}
              onClose={() => {
                setPopupState("");
              }}
              onConfirm={() => {
                setPopupState("2FA");
              }}
            />
          ) : (
            popupState === "2FA" && (
              <TwoFA
                onClose={() => {
                  setPopupState("");
                }}
                onSubmit={on2FASubmit}
              />
            )
          )}
        </TransitionDialog>
      </div>
    </div>
  );
};

export default CryptoWithdrawal;
