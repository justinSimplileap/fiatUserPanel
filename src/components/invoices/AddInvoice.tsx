import React, { Fragment, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Autocomplete, TextField } from "@mui/material";
import ExchangeInput from "../common/ExchangeInput";
import MuiButton from "../MuiButton";
import Image from "next/image";
import useAsyncMasterStore from "~/hooks/useAsyncMasterStore";
import { Dialog } from "@headlessui/react";
import { createInvoices } from "~/service/ApiRequests";
import { getAllCustomerMerchants } from "~/service/api/accounts";
import SelectComponent from "../common/SelectComponent";
type propType = {
  onClose: (value?: any) => void;
  invoice?: Invoices;
  openAdd: string;
  setInvoiceUpdated: React.Dispatch<React.SetStateAction<boolean>>;
};

const AddInvoice = (props: propType) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<InvoiceForm>();

  const [loading, setLoading] = useState(false);
  const [merchants, setMerchants] = useState<any>([]);

  const fetchMerchants = async () => {
    const [response] = await getAllCustomerMerchants();
    if (response?.body) {
      setMerchants(response?.body);

      if (response?.body.length === 1) {
        const projectId = response?.body[0]?.projectId;

        setValue("projectId", projectId ?? "");
      }
    }
  };

  useEffect(() => {
    void fetchMerchants();
  }, []);

  const onSubmit = async (values: InvoiceForm) => {
    setLoading(true);
    const { name, description, currency, amount, email, projectId } = values;

    const requestBody = {
      name,
      description,
      currency,
      amount,
      email,
      projectId,
    };
    try {
      await createInvoices(requestBody);
      props.onClose("success");
      props.setInvoiceUpdated((prev) => !prev);
    } catch (error) {
    } finally {
      setLoading(false);
    }
    props.onClose("success");
  };

  useEffect(() => {
    // Reset form values when props.invoice changes
    reset({
      ...props.invoice,
    });
  }, [props.invoice, reset]);

  // const assets = useAsyncMasterStore<"assets">("assets");
  // console.log("assets", assets);
  const assetId = watch("currency");

  const currencyList = [
    {
      fireblockAssetId: "EUR",
      icon: "https://exchangecrm.blob.core.windows.net/static-images/euro.svg",
      id: 13,
      krakenAssetId: "EUR",
      name: "Euro",
      order: 0,
    },
    {
      fireblockAssetId: "USD",
      icon: "https://exchangecrm.blob.core.windows.net/static-images/USDC.105a37.svg",
      id: 50,
      krakenAssetId: "USD",
      name: "USD",
      order: null,
    },
  ];

  const assetValue = currencyList?.find(
    (item) => item.fireblockAssetId === assetId,
  );

  return (
    <>
      <Dialog
        as="div"
        className="relative z-50 focus:outline-none"
        open={true}
        onClose={() => {
          props.onClose();
        }}
      >
        <div className="fixed inset-0 z-[9999] m-auto h-fit w-fit overflow-y-auto rounded-xl shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
          <div className="flex min-h-full items-center justify-center">
            <div className="w-auto rounded-xl bg-white px-8 py-4">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="my-4 w-[100%] lg:w-[30vw]"
              >
                <div className="flex flex-col justify-center">
                  <p className=" m-auto text-2xl font-medium">New Invoice</p>
                  <ExchangeInput
                    control={control}
                    placeholder="Enter Name"
                    label="Name"
                    name="name"
                    rules={{ required: "Name is required" }}
                    type="text"
                  />

                  <ExchangeInput
                    control={control}
                    placeholder="Enter Description"
                    label="Description"
                    name="description"
                    rules={{ required: "Description is required" }}
                    type="text"
                  />

                  {merchants.length > 1 ? (
                    <div className=" my-2 space-y-1">
                      <p>
                        Project <span className="text-red-500">*</span>
                      </p>
                      <SelectComponent
                        control={control}
                        options={merchants}
                        valueKey="projectId"
                        labelKey="projectName"
                        label="projectId"
                        name="projectId"
                        rules={{ required: "Project is required" }}
                      />
                    </div>
                  ) : (
                    <>
                      <p className="mb-1">
                        Project <span className="text-red-500">*</span>
                      </p>

                      <Controller
                        control={control}
                        name="projectId"
                        defaultValue={merchants[0]?.projectId || ""}
                        render={({ field }) => (
                          <TextField
                            size="small"
                            variant="outlined"
                            {...field}
                            value={merchants[0]?.projectName || ""}
                            disabled
                          />
                        )}
                      />
                    </>
                  )}

                  <div className="my-1">
                    <label htmlFor="firstName" className="mb-1 block ">
                      Currency <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      control={control}
                      name="currency"
                      rules={{
                        required: "Please select an currency",
                      }}
                      render={({
                        field: { value, onChange },
                        fieldState: { error },
                      }) => (
                        <Fragment>
                          <Autocomplete
                            size="small"
                            options={currencyList}
                            getOptionLabel={(option) => {
                              return option.name ? option.name : value;
                            }}
                            onChange={(_, nextValue) => {
                              onChange(nextValue?.fireblockAssetId ?? "");
                            }}
                            value={assetValue ? assetValue : null}
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
                                className=" flex items-center gap-2 bg-[#ffffff] "
                                {...params}
                                placeholder="Select currency"
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

                                        {/* {params.InputProps.startAdornment} */}
                                      </Fragment>
                                    );
                                  })(),
                                }}
                                variant="outlined"
                              />
                            )}
                          />
                          <p className="text-sm text-red-500">
                            {error?.message}
                          </p>
                        </Fragment>
                      )}
                    />
                  </div>

                  <ExchangeInput
                    placeholder="Invoice Amount"
                    control={control}
                    label="Amount"
                    name="amount"
                    type="text"
                    rules={{
                      required: "Amount is required",
                    }}
                  />

                  <ExchangeInput
                    placeholder="Enter Email"
                    control={control}
                    label="Email"
                    name="email"
                    type="text"
                    // rules={{
                    //   required: "Email is required",
                    // }}
                  />
                </div>

                <div className=" flex justify-center  ">
                  <MuiButton
                    width="10rem"
                    borderRadius="4px"
                    name="Create"
                    className=""
                    type="submit"
                    loading={loading}
                  ></MuiButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default AddInvoice;
