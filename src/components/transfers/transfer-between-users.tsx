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
} from "@mui/material";
import { Controller, useForm, useWatch } from "react-hook-form";
import MuiButton from "~/components/MuiButton";
import useAsyncMasterStore from "~/hooks/useAsyncMasterStore";
import useGlobalStore from "~/store/useGlobalStore";
import {
  getLimits,
} from "~/service/api/transaction";
import toast from "react-hot-toast";
import useDashboard from "~/hooks/useDashboard";
import WarningMsg from "../common/WarningMsg";
import Router, { useRouter } from "next/router";
import { ApiHandler } from "~/service/UtilService";
import {
  SendEuroMail,
  SendOTCTradeMail,
  createTransfer,
  fetchTransaferFeesApi,
  saveEuroTemplate,
} from "~/service/ApiRequests";
import ExchangeDropdown from "../common/ExchangeDropdown";
import { CountryListType, DropDownOptionsType } from "~/types/Common";
import Close from "~/assets/general/close.svg";
import SelectComponent from "../common/SelectComponent";
import {
  changeName,
  coinForKrakenName,
  dateValidation,
  formatDate,
} from "~/helpers/helper";
import localStorageService from "~/service/LocalstorageService";
import Button from "../common/Button";
import { getTransferFeesByPricelistId } from "~/service/api/pricelists";
import CryptoTable from "./crypto-table";
import Image from "next/image";
import ConfirmDailog from "./create-template-confirm";
import TransitionDialog from "../common/TransitionDialog";
import TwoFA from "../TwoFA";
import DownArrow from "../../assets/general/arrow_down.svg"

const WithdrawalInit: CryptoWithdrawalForm = {
  assetId: "",
  amount: "",
  addressType: "ONETIME",
  oneTimeAddress: "",
  whitelistId: "",
  description: "",
  reference: "",
  isMax: false,
  IBAN: "",
  customerName: "",
  address: "",
  zipCode: "",
  city: "",
  countryOfIssue: "",
  swift: "",
  bankName: "",
  bankAddress: "",
  bankLocation: "",
  bankCountry: "",
  transferFee: "",
  paymentSystemType: "",
  customerZipcode: "",
  euroTemplate: "",
  isApproved: false,
  bankcountry: undefined,
  Banklocation: undefined,
  Bankaddress: undefined,
  Bankname: undefined,
  swiftBic: undefined,
  Description: undefined,
  Reference: undefined,
  Country: undefined,
  Customercity: undefined,
  Zipcode: undefined,
  paymentSystem: undefined,
  customerAddress: "",
  from: undefined
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

interface TransactionConfirmData {
  clientName: string;
  contactPerson: string;
  date: string;
  fromCurrency: string;
  amount?: string;
  accountNumber?: string;
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

  const [popupState, setPopupState] = useState(false);
  const [twoFAPopupState, setTwoFAPopupState] = useState(false);

  const handleTwofa = () => {
    setTwoFAPopupState(true)
    setPopupState(false)
  }


  const handleTwoFASubmit = () => {
    console.log("2FA verified and action authorized!");
    setTwoFAPopupState(false);
  };

  useEffect(() => {
    if (user.priceList) {
      getUserPriceList(user.priceList);
    }
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

  useEffect(() => {
    if (priceList) {
      setTransferFees(priceList.TransferFees ?? []);
    }
  }, [priceList]);

  const template = watch("euroTemplate");
  const isTemplateSelected = watch("euroTemplate");
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
    }
  };

  useEffect(() => {
    const fetchTransferFees = async () => {
      const response = await fetchTransaferFees(selectedAsset);

      const minimumFee = Number(response?.minimumFee);
      const maximumFee = Number(response?.maximumFee);

      const calculatedFee =
        Number(amount) * (response?.percent / 100) + Number(response?.fixedfee);

      let finalFee;

      if (
        minimumFee !== null &&
        minimumFee !== 0 &&
        calculatedFee < minimumFee
      ) {
        finalFee = minimumFee;
      } else if (
        maximumFee !== null &&
        maximumFee !== 0 &&
        calculatedFee > maximumFee
      ) {
        finalFee = maximumFee;
      } else {
        finalFee = calculatedFee;
      }

      setValue("transferFee", finalFee.toString());
    };

    fetchTransferFees();
  }, [amount]);

  const paymentSystemList = [{ value: "SEPA", label: "SEPA" }];



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
      templateName: watch("customerName"),
      IBAN: watch("IBAN"),
      customerName: watch("customerName"),
      customerAddress: watch("address"),
      customerZipcode: watch("customerZipcode"),
      customerCity: watch("city"),
      customerCountry: watch("countryOfIssue"),
      swift: watch("swift"),
      bankName: watch("bankName"),
      bankAddress: watch("bankAddress"),
      bankLocation: watch("bankLocation"),
      bankCountry: watch("bankCountry"),
      description: watch("description"),
      reference: watch("reference"),
    };
  }

  return (
    <div>
      <div className="">
        <form onSubmit={handleSubmit(onSubmit)} className="h-full">
          <div className="flex h-full flex-col justify-center gap-4 md:flex-row lg:py-4">
            {/* First Column */}
            <div className="h-full w-full max-w-xl md:w-[50%]">
              <div className="flex h-full flex-col gap-2 rounded bg-white lg:p-8 p-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.25)]">
                <div className="mt-3">
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
                        {/* Label outside the input field */}
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Whitelisted address
                        </label>

                        <Autocomplete
                          size="small"
                          options={filteredAssets}
                          onChange={(_, nextValue) => {
                            onChange(nextValue?.fireblockAssetId ?? ""),
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
                                      width={8}
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
                <div className="border-b-2 pb-4 pt-6">
                  <p className=" font-bold">Add Beneficiary Details</p>
                </div>
                <div className="lg:pt-4 pt-1">
                  <LabelName name="IBAN" label="IBAN*"></LabelName>
                  <div className="flex flex-col">
                    <Controller
                      name="IBAN"
                      control={control}
                      rules={{
                        required: "Please enter IBAN",
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

                {/* customer name */}
                <div className="lg:pt-4 pt-1">
                  <LabelName name="customerName" label="Customer name*"></LabelName>
                  <div className="flex flex-col">
                    <Controller
                      name="customerName"
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

                {/* customer address */}
                <div className="lg:pt-4 pt-1">
                  <LabelName name="customerAddress" label="Customer address*"></LabelName>
                  <div className="flex flex-col">
                    <Controller
                      name="customerAddress"
                      control={control}
                      rules={{
                        required: "Please enter company address",
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

                <div className="grid w-full grid-cols-1 items-baseline gap-4 lg:grid-cols-2">
                  {/* Zip code  */}
                  <div className="lg:pt-4 pt-1">
                    <LabelName name="Zipcode" label="Zip code*"></LabelName>
                    <div className="flex flex-col">
                      <Controller
                        name="Zipcode"
                        control={control}
                        rules={{
                          required: "Please enter zipcode",
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
                  <div className="lg:pt-4 pt-1">
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

                {/* country */}
                <div className="lg:pt-4 pt-1">
                  <LabelName name="Country" label="Country*"></LabelName>
                  <div className="flex flex-col">
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
                </div>

                {/* Reference */}
                <div className="lg:pt-4 pt-1">
                  <LabelName name="Reference" label="Reference"></LabelName>
                  <div className="flex flex-col">
                    <Controller
                      name="Reference"
                      control={control}
                      rules={{
                        required: "Please enter Reference",
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

                {/* Description */}
                <div className="lg:pt-4 pt-1">
                  <LabelName name="Description" label="Description"></LabelName>
                  <div className="flex flex-col">
                    <Controller
                      name="Description"
                      control={control}
                      rules={{
                        required: "Please enter Description",
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

                <div className="border-b-2 pb-4 pt-6">
                  <p className="text-[#919191] ">Bank Info</p>
                </div>

                <div className="grid w-full grid-cols-1 items-baseline gap-4 lg:grid-cols-2">
                  {/* Zip code  */}
                  <div className="lg:pt-4 pt-1">
                    <LabelName name="swiftBic" label="Swift/Bic*"></LabelName>
                    <div className="flex flex-col">
                      <Controller
                        name="swiftBic"
                        control={control}
                        rules={{
                          required: "Please enter Swift/Bic",
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
                  <div className="lg:pt-4 pt-1">
                    <div className="flex flex-col ">
                      <LabelName
                        name="Bankname"
                        label="Bank name*"
                      ></LabelName>

                      <Controller
                        name="Bankname"
                        control={control}
                        rules={{
                          required: "Please enter Bank name",
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

                {/* Bank Address */}
                <div className="lg:pt-4 pt-1">
                  <LabelName name="Bankaddress" label="Bank address*"></LabelName>
                  <div className="flex flex-col">
                    <Controller
                      name="Bankaddress"
                      control={control}
                      rules={{
                        required: "Please enter Bank address",
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

                <div className="grid w-full grid-cols-1 items-baseline gap-4 lg:grid-cols-2">
                  {/* Zip code  */}
                  <div className="lg:pt-4 pt-1">
                    <LabelName name="Banklocation" label="Bank Location*"></LabelName>
                    <div className="flex flex-col">
                      <Controller
                        name="Banklocation"
                        control={control}
                        rules={{
                          required: "Please enter Bank Location",
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
                  <div className="lg:pt-4 pt-1">
                    <div className="flex flex-col ">
                      <LabelName
                        name="bankcountry"
                        label="Country*"
                      ></LabelName>

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
                </div>
                <div className="text-center mt-6">
                  <MuiButton
                    padding="6px 40px"
                    name={"Create template"}
                    onClick={() => setPopupState(true)}
                  />
                </div>
              </div>
            </div>

            {/* Second Column */}
            <div className=" w-full md:w-[50%] min-h-[600px]">
              <div className="min-h-[600px] w-full rounded bg-white p-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.25)]">
                {/* Content for the second column */}
                <div className="border-b-2 pb-4 pt-6">
                  <p className=" font-bold">White listed addresses</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Popup Dialog */}
      <ConfirmDailog
        open={popupState}
        onClose={() => setPopupState(false)}
        onConfirm={handleTwofa}
      />
      {/* 2FA Popup */}
      {twoFAPopupState && (
        <TransitionDialog open={!!twoFAPopupState} onClose={() => setTwoFAPopupState(false)}>
          <TwoFA
            onClose={() => setTwoFAPopupState(false)}
            onSubmit={handleTwoFASubmit} // Handle 2FA submission logic here
          />
        </TransitionDialog>
      )}
    </div>
  );
};

export default CryptoWithdrawal;
