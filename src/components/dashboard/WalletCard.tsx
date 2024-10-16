import React, { Fragment, useCallback, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import arrowUp from "../../assets/general/arrowup.svg";
import qrScanner from "../../assets/general/qr_code_scanner.svg";
import { euroFormat, maskAddress } from "~/helpers/helper";
import { Box, Dialog, Popover, Snackbar, Typography } from "@mui/material";
import Copy from "~/assets/general/copy.svg";
import eyeIcon from "~/assets/general/eye.svg";
import { theme } from "~/constants/constant";

type imageType = StaticImageData;
function formatCurrency(balance: number) {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(balance);
  const [integerPart, decimalPart] = formatted.split(".");

  return { integerPart, decimalPart };
}
const WalletCard: React.FC<any> = ({ walletDetails }) => {
  const { integerPart, decimalPart } = formatCurrency(walletDetails.balance);
  const [messagePopup, setMessagePopup] = useState(false);

  const onCopy = () => {
    if (walletDetails.assetAddress) {
      navigator.clipboard
        .writeText(walletDetails.assetAddress)
        .then(() => setMessagePopup(true))
        .catch((error) => console.error("Clipboard operation failed:", error));
    }
  };

  function currencyIcon(item: string) {
    return item === "EUR"
      ? "€"
      : item === "USD"
      ? "$"
      : item === "GBP"
      ? "£"
      : "";
  }

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Fragment>
      <Box
        aria-owns={open ? "mouse-over-popover" : undefined}
        aria-haspopup="true"
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
        key={walletDetails.id}
        className="flex flex-col gap-2 break-words rounded-md bg-white p-5
        shadow-[0px_4px_8px_0px_rgba(0,0,0,0.1)]"
      >
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <Image
              className="aspect-square h-6 w-6 "
              src={walletDetails.icon ?? ""}
              width={15}
              height={15}
              alt="Icon"
            />

            <div>
              <p
                className="text-sm font-medium "
                style={{ color: `${theme.text.color.primary}` }}
              >
                {walletDetails.name}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="flex items-baseline text-[30px] font-medium">
            {currencyIcon(walletDetails.name)} {integerPart}
            <span
              className="text-[20px]"
              style={{ color: `${theme.text.color.primary}` }}
            >
              .{decimalPart}
            </span>
          </p>
        </div>

        <Typography className="flex  gap-2">
          <p style={{ fontSize: `${theme.text.fontSize.medium}` }}>
            View Account info{" "}
          </p>
          <Image alt="" className="h-5 w-5" src={eyeIcon as imageType} />
        </Typography>

        <Popover
          id="mouse-over-popover"
          sx={{ pointerEvents: "none" }}
          open={open}
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          onClose={handlePopoverClose}
          disableRestoreFocus
        >
          <div className=" w-full text-ellipsis  break-all rounded-md bg-white p-4 shadow-[0px_16px_32px_0px_rgba(0,0,0,0.04)]">
            <span style={{ color: `${theme.text.color.primary}` }}>
              Virtual Account Name
            </span>
            <p className=" font-semibold">{walletDetails.accountName}</p>
            <div className="m-1"></div>
            <span style={{ color: `${theme.text.color.primary}` }}>BIC</span>
            <p className="font-semibold">{walletDetails.bic}</p>
            <div className="m-1"></div>
            <span style={{ color: `${theme.text.color.primary}` }}>vIBAN</span>
            <p className="font-semibold ">{walletDetails.vIBAN}</p>
            <div className="m-1"></div>

            <span style={{ color: `${theme.text.color.primary}` }}>
              Bank Name
            </span>
            <p className="font-semibold">{walletDetails.bankName}</p>
            <div className="m-1"></div>

            <span style={{ color: `${theme.text.color.primary}` }}>
              Bank Address
            </span>
            <p className="font-semibold">{walletDetails.bankAddress}</p>
            <div className="m-1"></div>

            <span style={{ color: `${theme.text.color.primary}` }}>
              Bank Country
            </span>
            <p className="font-semibold">{walletDetails.country}</p>
          </div>
        </Popover>
      </Box>
    </Fragment>
  );
};

export default WalletCard;
