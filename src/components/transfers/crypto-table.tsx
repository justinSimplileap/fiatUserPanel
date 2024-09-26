import React, { useState } from "react";
import {
    RowData,
    type displayFilterType,
    type cryptoHeaderval,
    CryptoRowData,
} from "~/types/Common";
import { cryptoDummyData } from "~/helpers/helper";
import MuiButton from "../MuiButton";
import Image from "next/image";
import DOCUMENT_ICON from "../../assets/images/document.png";
import UPLOAD_DOCUMENT from "../../assets/images/upload_document.png";
import FILE_SIZE_ICON from "../../assets/images/fileSize.png";
import DATE_ICON from "../../assets/images/dateIcon.png";
import EYE_ICON from "../../assets/images/eyeIcon.png";
import DELETE_ICON from "../../assets/images/deleteIcon.png";
import TwoFA from "../TwoFA";
import TransitionDialog from "../common/TransitionDialog";
import ConfirmDailog from "./createTransfer-confirm";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import arrowdown from "../../assets/general/arrow_full.svg";

const reportHeaders: cryptoHeaderval = {
    "File Name": "fileName",
    "File Size": "fileSize",
    Date: "date",
    Action: "action",
};

const CryptoTable: React.FC = () => {
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

    const [visibleColumns, setCheckedItems] = useState<string[]>(
        Object.values(reportHeaders),
    );

    const columnWidths: Record<string, string> = {
        fileName: "60%",
        fileSize: "15%",
        date: "15%",
        action: "15%",
    };

    return (
        <>
            <div className="mx-auto my-8 rounded-lg bg-white p-6 shadow-lg hidden lg:block">
                <div className="mb-6 flex items-center justify-between border-b-2 pb-2 ">
                    <div className="flex">
                        <Image
                            className="me-6 aspect-square h-6 w-6"
                            src={DOCUMENT_ICON ?? ""}
                            width={15}
                            height={15}
                            alt="Icon"
                        />
                        <h2 className=" text-xl font-semibold text-gray-700">Documents</h2>
                    </div>
                    <MuiButton
                        className=""
                        name="Upload Document"
                        borderColor="black"
                        background="black"
                        color="white"
                        padding="12px 16px"
                        startIcon={
                            <Image
                                className="me-2 aspect-square h-5 w-5"
                                src={UPLOAD_DOCUMENT ?? ""}
                                width={10}
                                height={10}
                                alt="Icon"
                            />
                        }
                    >
                        {/* Special character */}
                        <span className="text-md pl-2 font-semibold">&#9013;</span>
                    </MuiButton>
                </div>

                <div
                    style={{
                        overflowX: "auto", // Horizontal scrolling
                        overflowY: "auto", // Vertical scrolling
                        minHeight: "500px",
                        maxHeight: "700px",
                    }}
                >
                    <table className="w-full min-w-[1000px] border-collapse border border-gray-300">
                        {/* Ensures table has a minimum width */}

                        <thead>
                            <tr
                                style={{ backgroundColor: "#E8E9EB", height: "58px" }}
                                className="border-b border-gray-300"
                            >
                                {Object.entries(reportHeaders).map(([headerLabel, headerKey]) => {
                                    if (!visibleColumns.includes(headerKey)) return null;
                                    const width = columnWidths[headerKey] ?? "auto"; // Set custom width from mapping
                                    return (
                                        <th
                                            key={headerKey}
                                            className="sticky top-0 z-10 whitespace-nowrap bg-[#E8E9EB] px-4 py-2 text-left text-[13px] font-bold text-[#333333]"
                                            style={{ width }} // Apply custom width for each column
                                        >
                                            {headerLabel}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {cryptoDummyData.map((row, index) => (
                                <tr
                                    key={index}
                                    className="cursor-pointer border-b border-gray-300 hover:bg-gray-200"
                                    style={{ height: "60px" }}
                                >
                                    {Object.entries(reportHeaders).map(([_, key]) => {
                                        if (!visibleColumns.includes(key)) return null;

                                        return (
                                            <td
                                                key={key}
                                                className="whitespace-nowrap px-4 py-2"
                                                style={{ width: columnWidths[key] ?? "auto" }}
                                            >
                                                {/* File Size Column with Icon */}
                                                {key === "fileSize" ? (
                                                    <div className="flex items-center gap-2">
                                                        <Image
                                                            src={FILE_SIZE_ICON} // The image icon for file size
                                                            alt="File Icon"
                                                            width={15}
                                                            height={15}
                                                        />
                                                        <span>{row.fileSize}</span>{" "}
                                                        {/* Display the file size text */}
                                                    </div>
                                                ) : key === "date" ? (
                                                    // Date Column with Icon
                                                    <div className="flex items-center gap-2">
                                                        <Image
                                                            src={DATE_ICON} // The image icon for date
                                                            alt="Date Icon"
                                                            width={15}
                                                            height={15}
                                                        />
                                                        <span>{row.date}</span> {/* Display the date text */}
                                                    </div>
                                                ) : key === "action" ? (
                                                    // Action Column with Two Icons
                                                    <div className="flex items-center gap-6">
                                                        <Image
                                                            src={EYE_ICON} // First action icon
                                                            alt="Action Icon 1"
                                                            width={20}
                                                            height={20}
                                                        />
                                                        <Image
                                                            src={DELETE_ICON} // Second action icon
                                                            alt="Action Icon 2"
                                                            width={15}
                                                            height={15}
                                                        />
                                                    </div>
                                                ) : (
                                                    row[key as keyof CryptoRowData] // Display text for other columns
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="text-right lg:mt-3">
                    <MuiButton
                        padding="4px 40px"
                        name={"Create transfer"}
                        className="px-12 py-2"
                        onClick={() => setPopupState(true)}
                    />
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
            {/* Mobile Accordion for Currency and Account */}
            <div className="mb-3 lg:hidden mx-auto my-6 rounded-lg bg-white p-6 acc-style">
                <div className="mb-3 flex items-center justify-between pb-2">
                    <div className="flex">
                        <Image
                            className="me-2 aspect-square h-6 w-6"
                            src={DOCUMENT_ICON ?? ""}
                            width={10}
                            height={10}
                            alt="Icon"
                        />
                        <h2 className=" text-lg font-semibold">Documents</h2>
                    </div>
                    <MuiButton
                        className=""
                        name="Upload"
                        borderColor="black"
                        background="black"
                        color="white"
                        padding="8px 18px"
                        startIcon={
                            <Image
                                className="me-2 aspect-square h-5 w-5"
                                src={UPLOAD_DOCUMENT ?? ""}
                                width={10}
                                height={10}
                                alt="Icon"
                            />
                        }
                    >
                    </MuiButton>
                </div>
                {/* Hide accordion on large screens */}
                {cryptoDummyData.map((row, index) => (
                    <Accordion key={index} className="border-b-2 py-1" style={{ boxShadow: 'none' }}>
                        <AccordionSummary
                            expandIcon={
                                <div>
                                    <Image src={arrowdown} alt="Expand Icon" />
                                </div>
                            }
                            aria-controls={`panel-${index}-content`}
                            id={`panel-${index}-header`}
                            className="flex-row-reverse"
                            style={{ border: 'none', boxShadow: 'none', margin: '0', padding: '0' }} // Added border and shadow removal
                        >
                            <div className="flex w-full items-center justify-between px-2 text-md">
                                <p>{row.fileName}</p>
                                <p className="flex gap-3">
                                    <Image
                                        src={EYE_ICON} // First action icon
                                        alt="Action Icon 1"
                                        width={18}
                                        height={18}
                                    />
                                    <Image
                                        src={DELETE_ICON} // Second action icon
                                        alt="Action Icon 2"
                                        width={13}
                                        height={13}
                                    />
                                </p>
                            </div>
                        </AccordionSummary>
                        <AccordionDetails style={{ border: 'none', boxShadow: 'none', margin: '0', padding: '0' }}>
                            <div className="flex flex-col gap-4 px-4">
                                {Object.entries(row).map(([key, value]) => (
                                    <div key={key} className="flex justify-between">
                                        <span className="font-semibold">{key}</span>
                                        <p>{value}</p>
                                    </div>
                                ))}
                            </div>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </div>
                
            <div className="text-center my-3 lg:hidden block">
                    <MuiButton
                        padding="4px 40px"
                        name={"Create transfer"}
                        className="px-12 py-2"
                        onClick={() => setPopupState(true)}
                    />
                </div>
        </>
    );
};

export default CryptoTable;
