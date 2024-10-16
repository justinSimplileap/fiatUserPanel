import {
  Autocomplete,
  Box,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import Image from "next/image";
import React, { useState } from "react";
import { cards } from "~/helpers/helper";
import { theme } from "~/constants/constant";
import MuiButton from "../MuiButton";
import ExchangeDialog from "./ExchangeConfirm";

const Exchange = () => {
  const [fromValue, setFromValue] = useState<any>();
  console.log("fromValue: ", fromValue);
  const [toValue, setToValue] = useState<any>();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };
  return (
    <div className="flex h-full items-center justify-center">
      <ExchangeDialog
        open={dialogOpen}
        fromValue={fromValue}
        toValue={toValue}
        onClose={handleDialogClose}
      />

      <div className="m-5 flex h-full flex-col items-center justify-center rounded-md bg-white p-6 shadow-[0px_16px_32px_0px_rgba(0,0,0,0.04)] lg:w-[50%]">
        <p className="text-2xl font-semibold">Exchange</p>
        <br />
        <Divider className=" w-full" /> <br />
        <div className="mt-4 flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
          {/* From Autocomplete */}
          <Box className="w-full">
            <p style={{ color: theme.text.color.primary }}>From</p>
            <Autocomplete
              options={cards}
              value={fromValue}
              onChange={(event, newValue) => setFromValue(newValue)}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) =>
                option.name === value.name
              }
              renderOption={(props, option) => (
                <Box
                  component="li"
                  {...props}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Image
                      src={option.icon}
                      alt={option.name}
                      className="m-1 h-6 w-6"
                    />
                    <Typography>{option.name}</Typography>
                  </Box>
                  <Typography sx={{ marginLeft: "auto" }}>
                    {option.balance}
                  </Typography>
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  className="flex items-center gap-2 bg-[#ffffff]"
                  {...params}
                  placeholder="Select Templates"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: fromValue && (
                      <div className="relative flex items-center gap-2">
                        <Image
                          className="h-6 w-6"
                          src={fromValue?.icon ?? ""}
                          alt={fromValue?.name}
                          width={24} // Adjust the size of the icon if needed
                          height={24}
                        />
                      </div>
                    ),
                    endAdornment: (
                      <>
                        <Typography>{fromValue?.balance} </Typography>{" "}
                        {params.InputProps.endAdornment}{" "}
                      </>
                    ),
                  }}
                  sx={{ height: "56px", minWidth: "200px" }} // Set height and minimum width
                  variant="outlined"
                />
              )}
            />
          </Box>

          {/* To Autocomplete */}
          <Box className="w-full">
            <p style={{ color: theme.text.color.primary }}>To</p>
            <Autocomplete
              options={cards}
              value={toValue}
              onChange={(event, newValue) => setToValue(newValue)}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) =>
                option.name === value.name
              }
              renderOption={(props, option) => (
                <Box
                  component="li"
                  {...props}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Image
                      src={option.icon}
                      alt={option.name}
                      className="m-1 h-6 w-6"
                    />
                    <Typography>{option.name}</Typography>
                  </Box>
                  <Typography sx={{ marginLeft: "auto" }}>
                    {option.balance}
                  </Typography>
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  className="flex items-center gap-2 bg-[#ffffff]"
                  {...params}
                  placeholder="Select Templates"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: toValue && (
                      <Image
                        className="ml-2 h-5 w-4"
                        src={toValue?.icon ?? ""}
                        alt={toValue?.name}
                        width={80}
                        height={80}
                      />
                    ),
                    endAdornment: (
                      <>
                        <Typography>{toValue?.balance} </Typography>{" "}
                        {params.InputProps.endAdornment}{" "}
                      </>
                    ),
                  }}
                  sx={{ height: "56px", minWidth: "200px" }} // Set height and minimum width
                  variant="outlined"
                />
              )}
            />
          </Box>
        </div>
        <div className="mt-4 flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
          <Box className=" w-full">
            <TextField
              variant="outlined"
              placeholder=""
              InputProps={{
                style: { padding: "40px 0px 40px" }, // Increase padding for inner height
                inputProps: {
                  style: {
                    fontSize: "50px", // Set text size here
                    border: "none", // Hide border in the input
                    boxShadow: "none", // Remove any shadow
                  },
                },
              }}
              // sx={{
              //   "& .MuiOutlinedInput-root": {
              //     "& fieldset": {
              //       border: "none", // Remove the outer border
              //     },
              //     "&:before": {
              //       borderBottom: "2px solid rgba(0, 0, 0, 0.42)", // Bottom border before focus
              //       content: '""', // Required for the pseudo-element
              //       display: "block", // Required for the pseudo-element
              //     },
              //     "&:hover:before": {
              //       borderBottom: "2px solid rgba(0, 0, 0, 0.87)", // Bottom border on hover
              //     },
              //     "&.Mui-focused:before": {
              //       borderBottom: "2px solid rgba(0, 0, 0, 0.87)", // Bottom border when focused
              //     },
              //     "&:after": {
              //       borderBottom: "2px solid rgba(0, 0, 0, 0.87)", // Bottom border when focused
              //     },
              //   },
              // }}
            />
          </Box>
          <Box className="w-full">
            <TextField
              variant="outlined"
              placeholder=""
              InputProps={{
                style: { padding: "40px 0px 40px" }, // Increase padding for inner height
                inputProps: {
                  style: { fontSize: "50px" }, // Set text size here
                },
              }}
            />
          </Box>
        </div>
        <div className="mt-4 flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
          <Box
            className="flex  w-full justify-between px-3 py-6"
            style={{ background: theme.text.background }}
          >
            <Typography style={{ color: theme.text.color.secondary }}>
              Exchange Rate{" "}
            </Typography>

            <Box className="flex gap-2">
              <Box className="flex gap-2">
                <Image className="h-5 w-5 " src={fromValue?.icon} alt="" />
                <Typography>{1}</Typography> =
              </Box>
              <Box className="flex gap-2">
                <Image className="h-5 w-5 " src={toValue?.icon} alt="" />
                <Typography>{1}</Typography>
              </Box>
            </Box>
          </Box>
          <Box
            className="flex  w-full justify-between px-3 py-6"
            style={{ background: theme.text.background }}
          >
            <Typography style={{ color: theme.text.color.secondary }}>
              Exchange Fees
            </Typography>
            <Typography>{20}</Typography>
          </Box>
        </div>
        <Box className="my-5 ">
          <MuiButton
            className="flex w-40 justify-center bg-[#C1922E]"
            name={"Continue"}
            onClick={handleDialogOpen}
          />
        </Box>
      </div>
    </div>
  );
};

export default Exchange;
