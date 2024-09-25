import React, { useEffect, useState } from "react";
// import download from "~/assets/general/download_icon.svg";
import cancel from "~/assets/general/cancel_icon.svg";
import filtericon from "~/assets/general/filter.svg";
import downloadcsv from "~/assets/general/downloadcsv.svg";
import Image, { type StaticImageData } from "next/image";
import { useForm } from "react-hook-form";
import { getOperationTypeUserpanel } from "../../service/api/pricelists";
import { getAllAssets } from "../../service/api/accounts";
import MuiButton from "../MuiButton";
import { MenuItem, Select, TextField } from "@mui/material";
import TableComponent from "../TableComponent";
export interface currencyType {
  id: number;
  name: string;
}

const Reports = () => {
  const { control, handleSubmit } = useForm();

  const [showFilter, setShowFilter] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");
  const [selectedTransaction, setSelectedTransaction] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const filterHandleChange = () => {
    setShowFilter(!showFilter);
  };

  const handleApplyFilters = () => {
    // Perform any necessary actions when filters are applied
    // You can make API calls or update the state as needed
  };

  const handleResetFilters = () => {
    // Reset filter
    setSelectedCurrency("");
    setSelectedTransaction("");
    setStartDate("");
    setEndDate("");
  };
  const [operationType, setoperationType] = useState<TransferFees[]>([]);
  const [assets, setAssets] = useState<Assets[]>([]);

  useEffect(() => {
    const getOperationType = async () => {
      const [res] = await getAllAssets();

      if (res !== null && "body" in res) {
        const filtredAssets = res.body.filter(
          (item) => item.fireblockAssetId !== "USD",
        );
        setAssets(filtredAssets);
      }
    };

    const getAssetsType = async () => {
      const [res] = await getOperationTypeUserpanel();

      if (res !== null && "body" in res) {
        const filteredReports = res.body.filter(
          (item) => item.name !== "transferFee" && item.name !== "fee",
        );
        setoperationType(filteredReports);
      }
    };

    getOperationType();
    getAssetsType();
  }, []);

  return (
    <div className=" dashboardContainer relative m-auto w-[95%]">
      <div>
        <div className=" mt-8 flex justify-between">
          <div className="flex items-center gap-2">
            <Image
              src={
                showFilter
                  ? (cancel as StaticImageData)
                  : (filtericon as StaticImageData)
              }
              alt=""
              className="cursor-pointer"
              onClick={filterHandleChange}
            />
            <p
              className="cursor-pointer text-sm font-bold"
              onClick={filterHandleChange}
            >
              {!showFilter ? "View filters" : "Hide Filter"}
            </p>
          </div>

          <MuiButton
            name=""
            background="white"
            borderColor="#217EFD"
            color="#217EFD"
          >
            <Image src={downloadcsv} alt=""></Image>
            Download CSV
          </MuiButton>
        </div>

        <br />

        {/* dropdowns  */}
        {showFilter && (
          <form onSubmit={handleSubmit(handleApplyFilters)}>
            <div className="mb-8 grid grid-cols-1 items-center gap-5 rounded-lg border border-slate-200 p-5 shadow md:grid-cols-2  lg:grid-cols-3 xl:grid-cols-4">
              {/* <ExchangeDropdown
                name="currency"
                label="Currency"
                control={control}
                options={assets.map((item) => ({
                  value: item.name,
                  label: item.name,
                }))}
                value={selectedCurrency}
                onChange={(selectedOption) => {
                  console.log("Selected Currency:", selectedOption.value);
                  setSelectedCurrency(selectedOption.value);
                }}
                placeholder="Currency"
              /> */}

              {/* <div>
                <p>Currency</p>
                <Select
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#e5e7eb",
                    },
                  }}
                  MenuProps={{
                    style: { maxWidth: "200px" },
                  }}
                  value={selectedCurrency}
                  size="small"
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="mb-2 mt-1 w-full rounded-md outline outline-1 outline-[#c4c4c4]"
                >
                  {assets.map(
                    (item) =>
                      item.name !== "Any" && (
                        <MenuItem key={item.name} value={item.name}>
                          <div className="flex items-center gap-2">
                            <Image
                              width="30"
                              height="30"
                              src={item.icon}
                              alt="icon"
                            />
                            {item.name}
                          </div>
                        </MenuItem>
                      ),
                  )}
                </Select>
              </div> */}

              <div>
                <p> All Transactions</p>
                <Select
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#e5e7eb",
                    },
                  }}
                  MenuProps={{
                    style: { maxWidth: "200px" },
                  }}
                  value={selectedTransaction}
                  size="small"
                  onChange={(e) => setSelectedTransaction(e.target.value)}
                  className="mb-2 mt-1 w-full rounded-md outline outline-1 outline-[#c4c4c4]"
                >
                  {operationType.map((item) => (
                    <MenuItem key={item.displayName} value={item.id}>
                      {item.displayName}
                    </MenuItem>
                  ))}
                </Select>
              </div>

              {/* <ExchangeDropdown
                name="transaction"
                label="Transactions"
                control={control}
                options={operationType.map((item) => ({
                  value: item.displayName,
                  label: item.displayName,
                }))}
                value={selectedTransaction}
                onChange={(value) => setSelectedTransaction(value)}
                placeholder="All Transactions"
              /> */}

              <div>
                <p>Start date</p>
                <input
                  type="date"
                  className=" mb-2 mt-1 w-full rounded-md px-2 py-[7px] outline outline-1 outline-[#c4c4c4]"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                  }}
                  max={endDate}
                />
              </div>
              <div>
                <p>End date</p>
                <input
                  type="date"
                  className=" mb-2 mt-1 w-full  rounded-md px-2 py-[7px] outline outline-1 outline-[#c4c4c4]"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                />
              </div>

              <div className="mt-4 flex justify-between">
                <MuiButton
                  color="white"
                  borderColor="white"
                  background="#217EFD"
                  name={"Apply Filters"}
                  type="submit"
                />
                {/* <MuiButton
                  name="Clear Filter"
                  className="flex justify-center"
                  onClick={handleResetFilters}
                /> */}
              </div>
            </div>
          </form>
        )}
      </div>

      {/* table  */}
      <div className="pb-1">
        {/* <TableComponent
          selectedCurrency={selectedCurrency}
          selectedTransaction={selectedTransaction}
          startDate={startDate}
          endDate={endDate}
        /> */}

        <div className="my-6">
          <TableComponent />
        </div>
      </div>
    </div>
  );
};

export default Reports;
