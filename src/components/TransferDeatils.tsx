import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Divider,
  Grid,
  Box,
} from "@mui/material";
import closeIcon from "../assets/general/close.svg";
import Image from "next/image";
import download from "../assets/general/download_report.svg";
import info from "../assets/general/info.svg";
import file from "../assets/general/document.svg";
import MuiButton from "./MuiButton";

interface TransferDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  selectedRow: any;
}

const TransferDetailsDialog: React.FC<TransferDetailsDialogProps> = ({
  open,
  onClose,
  selectedRow,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      className="text-[#1F1F1F]"
    >
      {/* Top Section with Title and Close Icon */}
      <DialogTitle>
        <p className="text-sm">{selectedRow?.creationDate}</p>

        <Grid container justifyContent="space-between" alignItems="center">
          <span className="font-semibold">TRANSFER DETAILS</span>
          <IconButton edge="end" color="inherit" onClick={onClose}>
            <Image src={closeIcon} alt="close" />
          </IconButton>
        </Grid>
      </DialogTitle>

      <DialogContent className="no-scrollbar overflow-y-scroll">
        {/* Transfer Details Section */}
        <Divider className="" />
        <br />
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <p>
              <strong>Status:</strong> {selectedRow?.status}
            </p>
          </Grid>
        </Grid>
        <br />

        <Divider />

        {/* Payment Details */}
        <h3 className="my-4 font-medium">Payment Details</h3>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6} className="grid grid-cols-2">
            <strong>From</strong> <p>{selectedRow?.currency}</p>
          </Grid>

          <Grid item xs={12} md={6} className="grid grid-cols-2">
            <strong>Amount</strong> <p>{selectedRow?.account}</p>
          </Grid>
          <Grid item xs={12} md={6} className="grid grid-cols-2">
            <strong>Fee</strong> <p>No fee</p>
          </Grid>
          <Grid item xs={12} md={6} className="grid grid-cols-2">
            <strong>Description</strong> <p>{"Description"}</p>
          </Grid>
          <Grid item xs={12} md={6} className="grid grid-cols-2">
            <strong>Created on</strong> <p>{selectedRow?.creationDate}</p>
          </Grid>

          <Grid item xs={12} md={6} className="grid grid-cols-2">
            <strong>Last Modified on</strong> <p>{selectedRow?.creationDate}</p>
          </Grid>
        </Grid>

        {/* Documents */}
        <h3 className="my-4 font-medium">Documents</h3>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <div className="flex items-center rounded bg-slate-100 p-2">
              <Image src={file} alt="Document 1" />
              <p className="ml-2">Document1.docx</p>
            </div>
          </Grid>
          <Grid item xs={6}>
            <div className="flex items-center rounded bg-slate-100 p-2">
              <Image src={file} alt="Document 2" />
              <p className="ml-2">Document2.docx</p>
            </div>
          </Grid>
        </Grid>

        {/* Beneficiary Details */}
        <Box className="my-10">
          <Divider />
        </Box>
        <h3 className="my-4 font-medium">Beneficiary Details</h3>
        <Grid container spacing={2} className="mt-2">
          <Grid item xs={12} md={6} className="grid grid-cols-2">
            <strong>IBAN</strong> <p>{selectedRow?.beneficiaryIban}</p>
          </Grid>
          <Grid item xs={12} md={6} className="grid grid-cols-2">
            <strong>Address </strong> <p>Address</p>
          </Grid>
          <Grid item xs={12} md={6} className="grid grid-cols-2">
            <strong>City</strong>
            <p>Texas</p>
          </Grid>
          <Grid item xs={12} md={6} className="grid grid-cols-2">
            <strong>Reference</strong>
            <p>Texas</p>
          </Grid>
          <Grid item xs={12} md={6} className="grid grid-cols-2">
            <strong>Customer name</strong> <p>{selectedRow?.beneficiaryName}</p>
          </Grid>
          <Grid item xs={12} md={6} className="grid grid-cols-2">
            <strong>Zip code</strong> <p>586209</p>
          </Grid>
          <Grid item xs={12} md={6} className="grid grid-cols-2">
            <strong>Country</strong> <p>USA</p>
          </Grid>
          <Grid item xs={12} md={6} className="grid grid-cols-2">
            <strong>Description</strong> <p>1225221</p>
          </Grid>
        </Grid>

        {/* Beneficiary Bank Details */}
        <Box className="my-10">
          <Divider />
        </Box>
        <h3 className="my-4 font-medium">Beneficiary Bank</h3>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6} className="grid grid-cols-2">
            <strong>Swift/Bic</strong> <p>{selectedRow?.beneficiaryIban}</p>
          </Grid>

          <Grid item xs={12} md={6} className="grid grid-cols-2">
            <strong>Bank Address</strong> <p>Address</p>
          </Grid>
          <Grid item xs={12} md={6} className="grid grid-cols-2">
            <strong>Country</strong> <p>USA</p>
          </Grid>

          <Grid item xs={12} md={6} className="grid grid-cols-2">
            <strong>Bank Name</strong> <p>IBAN</p>
          </Grid>

          <Grid item xs={12} md={6} className="grid grid-cols-2">
            <strong>Bank Location</strong> <p>USA</p>
          </Grid>
        </Grid>

        {/* Buttons */}
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          className="mt-10"
        >
          <Grid
            item
            className="flex items-center gap-2 rounded-sm bg-gray-100 p-1"
          >
            <Image src={info} alt="info" />
            <p>Payment confirmation sent to email</p>
          </Grid>

          <Grid item className="flex flex-col gap-5 md:flex-row">
            {/* First Button (Repeat) */}
            <MuiButton
              name=""
              borderRadius="0.3rem"
              style={{ minWidth: "150px" }}
              onClick={() => console.log("Repeat clicked")}
            >
              Repeat
            </MuiButton>

            {/* Second Button (Download PDF) */}
            <MuiButton
              name=""
              borderRadius="0.3rem"
              background="black"
              color="white"
              borderColor="black"
              style={{ minWidth: "150px" }}
              onClick={() => console.log("Download PDF clicked")}
            >
              <div className="flex items-center gap-2">
                <Image src={download} alt="Download" /> Download PDF
              </div>
            </MuiButton>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default TransferDetailsDialog;
