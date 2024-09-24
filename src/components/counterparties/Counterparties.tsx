import { useState, Fragment } from "react";
import EURO_COIN from "../../assets/currency/EURO_COIN.svg";
import GBP_COIN from "../../assets/currency/GBP_COIN.svg";
import USD_COIN from "../../assets/currency/USD_COIN.svg";
import SEARCH_COIN from "../../assets/general/Search.svg";
import DELETE from "../../assets/general/delete.svg";
import MuiButton from "../MuiButton";
import { TextField, InputAdornment } from "@mui/material";
import Image from "next/image";

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const cards = [
    {
      name: "Counterparty 1",
      customerName: "John",
      assetId: "EUR",
      icon: EURO_COIN,
      bankname: "SBI",
      iban: "SWQ1231s",
      description: "test",
    },
    {
      name: "Counterparty 2",
      customerName: "John",
      assetId: "GBP",
      icon: GBP_COIN,
      bankname: "SBI",
      iban: "SWQ1231s",
      description: "test",
    },
    {
      name: "Counterparty 3",
      customerName: "John",
      assetId: "USD",
      icon: USD_COIN,
      bankname: "SBI",
      iban: "SWQ1231s",
      description: "test",
    },
  ];

  return (
    <Fragment>
      <div className="dashboardContainer m-auto w-[95%]">
        <div className="my-4 flex items-center justify-between">
          {/* Search Bar */}
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search Counterparties"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment
                  className="cursor-pointer active:scale-95"
                  position="end"
                >
                  <Image src={SEARCH_COIN} alt="Search" className="h-4 w-4" />
                </InputAdornment>
              ),
            }}
            className="w-[30%] "
          />

          {/* Add New Button */}
          <MuiButton
            name=""
            borderColor="black"
            background="black"
            color="white"
            className="rounded-3xl"
            borderRadius="0.3rem"
          >
            <span className="text-xl">&#43;&nbsp;&nbsp;</span>
            <span>Add New</span>
          </MuiButton>
        </div>

        {/* Render Cards in Grid */}
        <div className="grid grid-cols-1 gap-4 text-[#808080] sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, index) => (
            <div
              key={index}
              className="card rounded-lg border bg-white p-4 shadow-sm"
            >
              <div className=" mb-2 flex w-full items-center justify-between">
                <h2 className="text-lg text-black">{card.name}</h2>
                <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#F4F4F4] p-1 active:scale-90">
                  <Image src={DELETE} alt={"delete"} />
                </div>
              </div>
              <div className="my-5 flex flex-col gap-2">
                <p className="flex justify-between ">
                  <p>Currency</p>
                  <div className="flex items-center gap-2">
                    <Image src={card.icon} alt={card.assetId} />
                    <span>{card.assetId}</span>
                  </div>
                </p>

                <p className="flex justify-between ">
                  <p>Customer Name</p> <span> {card.customerName}</span>
                </p>
                <p className="flex justify-between ">
                  <p>IBAN</p> <span> {card.iban}</span>
                </p>
                <p className="flex justify-between ">
                  <p>Bank Name</p>
                  <span> {card.bankname}</span>
                </p>
                <p className="flex justify-between ">
                  <p>Description</p>
                  <span> {card.description}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Fragment>
  );
};

export default Dashboard;
