import { Fragment, useCallback, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import arrowUp from "../../assets/general/arrowup.svg";
import qrScanner from "../../assets/general/qr_code_scanner.svg";
import { euroFormat, maskAddress } from "~/helpers/helper";
import { Dialog, Snackbar } from "@mui/material";
import Copy from "~/assets/general/copy.svg";
import right_arrow from "~/assets/general/right_arrow.svg";

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
  console.log("walletDetails: ", walletDetails);

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

  return (
    <Fragment>
      <div
        key={walletDetails.id}
        className="exchangeCard gradientCard rounded-md bg-white p-5
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
              <p className="text-sm font-medium text-gray-500">
                {walletDetails.name}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="flex items-baseline text-[30px] font-medium">
            {currencyIcon(walletDetails.name)} {integerPart}
            <span className="text-[20px] text-gray-500">.{decimalPart}</span>
          </p>
          <Link href={`./transfers/?from=` + walletDetails.assetId}>
            <Image alt="" src={arrowUp as imageType} />
          </Link>
        </div>

        <Link
          className=" my-2 flex cursor-pointer items-center gap-2"
          href={`./profile`}
        >
          <p className="text-md">View Account info </p>
          <Image alt="" src={right_arrow as imageType} />
        </Link>
      </div>
    </Fragment>
  );
};

export default WalletCard;
