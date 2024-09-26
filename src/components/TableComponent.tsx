import React, { useState } from "react";
import TransferDetailsDialog from "./TransferDeatils";
import {
  RowData,
  type displayFilterType,
  type reportHeaderval,
} from "~/types/Common";
import { dummyData } from "~/helpers/helper";
import arrowdown from "../assets/general/arrowdown.svg";
import MuiButton from "./MuiButton";
import {
  Fade,
  Paper,
  Popper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import Image from "next/image";

const reportHeaders: reportHeaderval = {
  "CREATION DATE": "creationDate",
  ACCOUNT: "account",
  "BENEFICIARY NAME": "beneficiaryName",
  "BENEFICIARY IBAN": "beneficiaryIban",
  STATUS: "status",
  "CLIENT ID": "clientId",
  AMOUNT: "amount",
  CURRENCY: "currency",
  FEE: "fee",
  BALANCE: "balance",
};

const ReportTable: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const handleRowClick = (row: any) => {
    setSelectedRow(row);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setSelectedRow(null);
  };

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );
  const [open, setOpen] = React.useState(false);

  const handleClick = (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.currentTarget && setAnchorEl(event?.currentTarget);
    setOpen((open) => !open);
  };

  const filters: displayFilterType[] = Object.entries(reportHeaders).map(
    ([label, name]) => ({
      label,
      name,
    }),
  );

  const [visibleColumns, setCheckedItems] = useState<string[]>(
    Object.values(reportHeaders),
  );

  const onCheckboxChange = (column: string) => {
    setCheckedItems((prev) => {
      const next = [...prev];
      if (next.includes(column)) {
        next.splice(next.indexOf(column), 1);
      } else {
        next.push(column);
      }
      return next;
    });
  };

  return (
    <div className="mx-auto my-8 rounded-lg bg-white p-6 shadow-lg">
      {/* Popper for Display Button */}
      <Popper
        open={open}
        anchorEl={anchorEl}
        placement={"bottom-end"}
        transition
        sx={{ zIndex: "99" }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper
              sx={{
                p: 1,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                maxHeight: "50vh",
                overflowY: "scroll",
              }}
            >
              {filters.map((item, i) => (
                <div key={i} className="flex items-center px-2 ">
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(item.name) || false}
                    onChange={() => {
                      onCheckboxChange(item.name);
                    }}
                    className={
                      `rounded_checkbox  ` + "cursor-pointer accent-[#1CBDAB]"
                    }
                    id={item.name}
                  />
                  <label
                    className="cursor-pointer px-2"
                    htmlFor={`${item.name}`}
                  >
                    {item.label}
                  </label>
                </div>
              ))}
            </Paper>
          </Fade>
        )}
      </Popper>

      {/* Mobile Accordion for Currency and Account */}
      <div className="md mb-3 lg:hidden ">
        <div className="mb-3 flex items-center justify-between">
          <h2 className=" text-xl font-semibold text-gray-700">
            RECENT ACTIVITY
          </h2>
          {/* <MuiButton
            name="Display"
            borderColor="black"
            background="black"
            color="white"
            onClick={handleClick}
          >
            <span className="text-md pl-2 font-semibold">&#9013;</span>
          </MuiButton> */}
        </div>
        {/* Hide accordion on large screens */}
        {dummyData.map((row, index) => (
          <Accordion key={index} className="mb-3">
            <AccordionSummary
              expandIcon={
                <div>
                  <Image src={arrowdown} alt="Expand Icon" />
                </div>
              }
              aria-controls={`panel-${index}-content`}
              id={`panel-${index}-header`}
              className="flex-row-reverse"
            >
              <div className="flex w-full items-center justify-between px-4 text-lg font-semibold">
                <p>{row.currency}</p> <p>{row.account}</p>
              </div>
            </AccordionSummary>
            <AccordionDetails>
              <div className="flex flex-col gap-4 px-4">
                {Object.entries(row).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="font-semibold">{key}</span>
                    <p>{value}</p> {/* Type-safe rendering */}
                  </div>
                ))}
              </div>
            </AccordionDetails>
          </Accordion>
        ))}
      </div>

      {/* Table for larger screens */}
      <div className="hidden lg:block">
        <div className="mb-3 flex items-center justify-between">
          <h2 className=" text-xl font-semibold text-gray-700">
            RECENT ACTIVITY
          </h2>
          <MuiButton
            name="Display"
            borderColor="black"
            background="black"
            color="white"
            onClick={handleClick}
          >
            <span className="text-md pl-2 font-semibold">&#9013;</span>
          </MuiButton>
        </div>

        <div
          className="no-scrollbar overflow-y-scroll"
          style={{
            overflowX: "auto", // Horizontal scrolling
            overflowY: "auto", // Vertical scrolling
            minHeight: "500px",
            maxHeight: "700px",
          }}
        >
          <table className=" w-full min-w-[1000px] border-collapse ">
            {/* Ensures table has a minimum width */}
            <thead>
              <tr
                style={{ backgroundColor: "#E8E9EB", height: "58px" }}
                className="border-b border-gray-300"
              >
                {Object.entries(reportHeaders).map(
                  ([headerLabel, headerKey]) =>
                    visibleColumns.includes(headerKey) && (
                      <th
                        key={headerKey}
                        className="sticky top-0 z-10 whitespace-nowrap bg-[#E8E9EB] px-4 py-2 text-left text-[13px] font-medium text-[#646464]"
                      >
                        {headerLabel}
                      </th>
                    ),
                )}
              </tr>
            </thead>
            <tbody>
              {dummyData.map((row, index) => (
                <tr
                  key={index}
                  onClick={() => handleRowClick(row)}
                  className="cursor-pointer border-b border-gray-300 hover:bg-gray-200"
                  style={{ height: "60px" }}
                >
                  {Object.entries(reportHeaders).map(
                    ([_, key]) =>
                      visibleColumns.includes(key) && (
                        <td key={key} className="whitespace-nowrap px-4 py-2">
                          {row[key as keyof RowData]} {/* Type-safe indexing */}
                        </td>
                      ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer details dialog */}
      <TransferDetailsDialog
        open={openDialog}
        onClose={handleClose}
        selectedRow={selectedRow}
      />
    </div>
  );
};

export default ReportTable;
