import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ApiHandler } from "~/service/UtilService";
import { getInvoices } from "~/service/ApiRequests";
import LoaderIcon from "../LoaderIcon";
import Image from "next/image";
import CopyButton from "../../assets/general/copy.svg";
import Link from "next/link";
import { getStatusColor } from "~/helpers/helper";
import StatusText from "../common/StatusText";

// interface Invoices {
// id: number;
// createdAt: string;
// requested: string;
// invoiced: string;
// paid: string;
// status: string;
// profile: string;
// amount: string;
// currency: string;
// invoiceURL: string;
// }

interface RowSpec {
  label: string;
  name: string;
  key?: keyof Invoices;
  type?: string;
  className?: string;
  getValue?: (row: Invoices) => string | number | JSX.Element;
}

type InvoicesTableProps = {
  invoiceUpdated: boolean;
};

const InvoicesTable: React.FC<InvoicesTableProps> = ({ invoiceUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<Invoices[]>([]);

  const fetchInvoices = async () => {
    setLoading(true);
    const [data]: APIResult<Invoices[]> = await ApiHandler(getInvoices);
    setLoading(false);

    if (data?.success) {
      // console.log("data s d", data);
      setInvoices(data.body);
    } else {
      toast.error("Failed to load Invoices");
    }
  };

  useEffect(() => {
    void fetchInvoices();
  }, [invoiceUpdated]);

  const formatDate = (dateString: string) => {
    // Implement your date formatting logic here
    return new Date(dateString).toLocaleString();
  };

  const onCopy = (text: any) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // showMessage('Copied to clipboard!');
        toast.success("Copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy!", err);
      });
  };

  const TableRows: RowSpec[] = useMemo(
    () => [
      {
        label: "ID",
        name: "id",
        className: "font-bold",
        key: "id",
        getValue: (row) => row.id ?? "-",
      },
      {
        label: "DATE",
        name: "createdAt",
        className: "font-bold",
        key: "createdAt",
        getValue: (row) =>
          formatDate(row?.transactionDetails?.createdAt) ?? "-",
      },

      {
        label: "REQUESTED",
        name: "requested",
        className: "font-bold",
        key: "requested",
        getValue: (row) => `${row.amount} ${" "} (${row.currency}) ` ?? "-",
      },
      {
        label: "INVOICED",
        name: "invoiced",
        className: "font-bold",
        key: "invoiced",
        getValue: (row) =>
          row?.transactionDetails?.exactAmount
            ? ` ${row?.transactionDetails?.exactAmount} ${" "} (${row
                ?.transactionDetails?.assetId})`
            : "-",
      },
      {
        label: "PAID",
        name: "paid",
        className: "font-bold",
        key: "paid",
        getValue: (row) =>
          row?.transactionDetails?.amount
            ? ` ${row?.transactionDetails?.amount} ${" "} (${row
                ?.transactionDetails?.assetId})`
            : "-",
      },
      {
        label: "STATUS",
        name: "status",
        className: "font-bold",
        key: "status",
        getValue: (row) =>
          row.transactionDetails.status
        // getValue: (row) => formatDate(row.transactionDetails.status) ?? "-",
      },
      {
        label: "Invoice URL",
        name: "invoiceURL",
        className: "font-bold",
        key: "invoiceURL",
        getValue: (row) =>
          row.invoiceURL ? (
            <span className=" flex gap-4">
              <Link
                href={row.invoiceURL}
                target="_blank"
                rel="noopener noreferrer"
                className=" whitespace-nowrap font-normal text-blue-500 underline"
              >
                Link URL
              </Link>

              <span
                className=" flex w-full justify-center"
                onClick={() => onCopy(row?.invoiceURL)}
              >
                <Image
                  className=" cursor-pointer"
                  src={CopyButton}
                  alt="copy"
                />
              </span>
            </span>
          ) : (
            "-"
          ),
      },
    ],
    [],
  );

  const renderKey = (rowSpec: RowSpec, row: Invoices) => {
    if (rowSpec?.getValue) {
      const value = rowSpec?.getValue(row);
      if (rowSpec.name === "status") {
        if (typeof value === "string") {
          const color = getStatusColor(value.toString());
          return <StatusText color={color}>{value.toLowerCase()}</StatusText>;
        }
        return value;
      }
      return value;
    }

    if (rowSpec?.key) {
      return String(row[rowSpec?.key]) ?? "-";
    }

    return "-";
  };

  return (
    <div className=" rounded-lg bg-white px-2 pb-10 pt-2 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.1)] ">
      {loading ? (
        <div className="flex h-full min-h-[50vh] items-center justify-center">
          <LoaderIcon className=" h-12 w-12" />
        </div>
      ) : (
        <table className="w-full border-separate border-spacing-0">
          <thead className=" sticky top-0 z-10 px-10 pb-10 text-[#646464]">
            <tr>
              {TableRows.map((item, i) => {
                return (
                  <th
                    key={i}
                    className="  bg-[#F7F7F7] p-4 text-start font-semibold"
                  >
                    {item.label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="h-full w-full bg-white p-2">
            {invoices.length ? (
              [...invoices]
                .sort((a, b) => b.id - a.id)
                .map((row, i) => (
                  <tr key={i} className=" w-full border-b p-10">
                    {TableRows.map((key, idx) => {
                      return (
                        <td
                          key={idx}
                          className="border-b-[1px] border-[#BABABA] py-6 pl-4 pr-10 text-start"
                        >
                          <div className={` ${key.className ?? ""}`}>
                            {renderKey(key, row)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan={TableRows.length}>
                  <span className="color-black flex justify-center py-4 text-center text-lg font-semibold">
                    No data found
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default InvoicesTable;
