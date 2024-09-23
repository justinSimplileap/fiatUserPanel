import { Fragment, useCallback, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import arrowUp from "../../assets/general/arrowup.svg";
import qrScanner from "../../assets/general/qr_code_scanner.svg";
import { euroFormat, maskAddress } from "~/helpers/helper";
import { Dialog, Snackbar } from "@mui/material";
import Copy from "~/assets/general/copy.svg";

type imageType = StaticImageData;

interface WalletCardProps {
  walletDetails: DashboardAssetType;
  currency?: string;
}

const WalletCard: React.FC<WalletCardProps> = ({ walletDetails, currency }) => {
  const [openqr, setOpen] = useState(false);
  const [messagePopup, setMessagePopup] = useState(false);

  const toggleOpen = useCallback(() => setOpen((prev) => !prev), []);

  const onCopy = () => {
    if (walletDetails.assetAddress) {
      navigator.clipboard
        .writeText(walletDetails.assetAddress)
        .then(() => setMessagePopup(true))
        .catch((error) => console.error("Clipboard operation failed:", error));
    }
  };

  return (
    <Fragment>
      <Snackbar
        open={messagePopup}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setMessagePopup(false)}
        autoHideDuration={1000}
        message="Copied to clipboard"
      />
      {!!walletDetails.qrImage && (
        <Dialog
          open={openqr}
          onClose={toggleOpen}
          fullWidth
          sx={{
            "& .MuiDialog-container": {
              "& .MuiPaper-root": {
                width: "auto",
                maxWidth: "750px",
              },
            },
          }}
        >
          <div className=" h-full w-full rounded p-8 md:h-[35vh]">
            <div className="flex h-full w-full flex-col items-center md:flex-row">
              <Image
                className=" aspect-square w-40"
                alt="qr code"
                src={walletDetails.qrImage ?? ""}
                width={20}
                height={20}
              />
              <div className="flex flex-col items-center justify-center gap-2 md:items-start md:justify-start ">
                <p className=" text-xl font-bold">Wallet address</p>
                <div className="flex flex-col items-center justify-center gap-2 md:flex-row md:justify-start">
                  <p className=" break-all text-center font-medium sm:break-normal sm:text-start">
                    {walletDetails.assetAddress}
                  </p>
                  <Image
                    onClick={onCopy}
                    className="cursor-pointer"
                    src={Copy as StaticImageData}
                    alt="Copy"
                  />
                </div>

                <button
                  onClick={toggleOpen}
                  className=" cursor-pointer text-sm"
                >
                  <p className=" text-base font-bold text-[#C1922E]">Go back</p>
                </button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
      <div
        key={walletDetails.id}
        className="exchangeCard gradientCard rounded-md bg-white p-5
        shadow-[0px_4px_8px_0px_rgba(0,0,0,0.1)]"
      >
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <Image
              className="aspect-square h-14 w-14 "
              src={walletDetails.icon ?? ""}
              width={15}
              height={15}
              alt="Icon"
            />
            <div>
              <p className="text-sm font-bold text-[#99B2C6]">
                {walletDetails.name}
              </p>
              <p className="text-2xl font-bold">
                {Number(walletDetails.balance)
                  ? Number(walletDetails.balance)?.toFixed(6)
                  : 0}
              </p>
              <p className="text-xs font-semibold ">
                {`${euroFormat.format(walletDetails?.assetValue) ?? 0} ${
                  currency ?? ""
                }`}
              </p>
            </div>
          </div>
          <Link href={`./transfers/?from=` + walletDetails.assetId}>
            <Image alt="" src={arrowUp as imageType} />
          </Link>
        </div>
        <div className="mt-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold">Wallet address</p>
            <div className="flex gap-2">
              <p
                className=" break-all text-base xl:break-normal
xl:text-sm"
              >
                {maskAddress(walletDetails.assetAddress, walletDetails.assetId)}
              </p>
              <Image
                onClick={onCopy}
                className=" cursor-pointer"
                src={Copy as StaticImageData}
                alt="Copy"
              />
            </div>
          </div>

          <Image
            className=" h-11 w-11"
            alt=""
            src={qrScanner as imageType}
            onClick={toggleOpen}
          />
        </div>
      </div>
    </Fragment>
  );
};

export default WalletCard;
