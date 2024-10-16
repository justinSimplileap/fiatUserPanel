import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import exchangeArrow from "../../assets/general/exchangeArrow.svg";
import Image from "next/image";
import MuiButton from "../MuiButton";

interface ExchangeDialogProps {
  open: boolean;
  onClose: () => void;
  fromValue: any;
  toValue: any;
}

const ExchangeDialog: React.FC<ExchangeDialogProps> = ({
  open,
  fromValue,
  toValue,
  onClose,
}) => {
  console.log("fromValue: ", fromValue);
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" className="">
      <DialogTitle className="bg-[#F5F5F5] text-center">
        <p className="text-xl ">Confirm Exchange</p>
      </DialogTitle>
      <DialogContent className="flex flex-col gap-5 bg-[#F5F5F5]">
        <Box className="flex items-center justify-between  rounded bg-white p-5">
          <p className="text-[40px] ">€ 200</p>
          <Image className="h-10 w-10" src={exchangeArrow} alt="exchange" />
          <p className="text-[40px] ">£ 200</p>
        </Box>
        <Box className="flex items-center justify-between border-b">
          <p>{fromValue?.name}</p>
          <Box className="flex items-center gap-2">
            <Image
              className="h-5 w-5"
              src={fromValue?.icon}
              alt={fromValue?.name}
            />
            <p>{fromValue?.name}</p>
          </Box>
        </Box>
        <Box className="flex items-center justify-between border-b">
          <p>{toValue?.name}</p>
          <Box className="flex items-center gap-2">
            <Image
              className="h-5 w-5"
              src={toValue?.icon}
              alt={toValue?.name}
            />
            <p>{toValue?.name}</p>
          </Box>
        </Box>
        <Box className="flex items-center justify-between border-b">
          <p>Exchange Rate</p>
          <p>€ 1 = 100</p>
        </Box>
        <Box className="flex items-center justify-between border-b">
          <p>Fee</p>
          <p>0</p>
        </Box>
        <Box className="flex justify-between gap-10">
          <MuiButton
            name="Cancel"
            background="white"
            color="black"
            borderColor="black"
            className="w-full"
            onClick={onClose}
          ></MuiButton>
          <MuiButton
            className="w-full"
            name="Exchange Currency"
            // onClick={() => handleChangeScreen("verifyEmailScreen")}
          />
        </Box>
      </DialogContent>
      <DialogActions className="  bg-[#F5F5F5]"></DialogActions>
    </Dialog>
  );
};

export default ExchangeDialog;
