import React, {
  type FC,
  useState,
  useMemo,
  useEffect,
  Fragment,
  useRef,
} from "react";
import ReactDOMServer from "react-dom/server";
import Download from "~/assets/general/download.svg";
import Image, { type StaticImageData } from "next/image";
import MuiButton from "./MuiButton";
import {
  Box,
  Fade,
  MenuItem,
  Paper,
  Popper,
  Select,
  Stack,
  TablePagination,
} from "@mui/material";
import ThreeDots from "~/assets/general/menu-dots.svg";
import { getTransactions } from "~/service/api/transaction";
import { bigNumber, formatDate, getStatusColor } from "~/helpers/helper";
import { useRouter } from "next/router";
import useDashboard from "~/hooks/useDashboard";
import ReconciliationReport from "./table-html-templates/ReconciliationReport";
import LoaderIcon from "./LoaderIcon";
import ReconciliationReportSafari from "./table-html-templates/ReconciliationReportSafari";
import ModalWindow from "./common/ModalWindow";
import { useForm } from "react-hook-form";
import { getAllAssets } from "../service/api/accounts";
import StatementReport from "./table-html-templates/StatementReport";
import { fetchUserById } from "~/service/ApiRequests";
import { ApiHandler } from "~/service/UtilService";
import useGlobalStore from "~/store/useGlobalStore";
import StatusText from "./common/StatusText";

interface filterType {
  label: string;
  name: string;
}

interface downloadType {
  label: string;
  action: () => void;
  image?: string;
  disabled: boolean;
}

interface RowSpec {
  label: string;
  name: string;
  key?: keyof TransactionDetails;
  type?: string;
  className?: string;
  getValue?: (row: TransactionDetails) => string | number;
}

interface TableComponentProps {
  selectedCurrency: string;
  selectedTransaction: string;
  startDate: string;
  endDate: string;
}

interface reportHeaderval {
  Date: string;
  "Sender account": string;
  "Receiver account": string;
  "Transaction Type": string;
  "Transaction Id": string;
  "Client Id": string;
  Status: string;
  "Transaction Fee": string;
  "Exchange Fee": string;
  "Debited amount": string;
  Rate: string;
  "Credited amount": string;
  Balance: string;
  Description: string;
}

interface Params {
  id: string;
}

const TableComponent: React.FC<TableComponentProps> = ({
  selectedCurrency,
  selectedTransaction,
  startDate,
  endDate,
}) => {
  const admin = useGlobalStore((state) => state.admin);
  const router = useRouter();
  const { handleSubmit, register } = useForm<FormData>();
  const isDashboard = router.pathname.includes("dashboard");
  const isReports = router.pathname.includes("reports");
  const walletId = useDashboard()?.assets?.[0]?.walletId;
  const userId = useDashboard()?.azureId;

  const [reports, setReports] = useState<TransactionDetails[]>([]);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );
  const [downloadEl, setDownloadEl] = React.useState<HTMLButtonElement | null>(
    null,
  );
  const [open, setOpen] = React.useState(false);
  const [downloadMenuOpen, setDownloadMenuOpen] = React.useState(false);
  const [openSavePDF, setOpenSavePDF] = React.useState(false);

  const [page, setPage] = React.useState(0);
  const [totalPageCount, setTotalPageCount] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const [errorMessage, setErrorMessage] = useState("");
  const [selectedCurrencyFilter, setSelectedCurrencyFilter] =
    useState<string>("");
  const [startDateFilter, setStartDate] = useState<string>("");
  const [endDateFilter, setEndDate] = useState<string>("");

  const [assets, setAssets] = useState<Assets[]>([]);

  const [userAddress, setUserAddress] = useState({ address: "" });

  const [pagination, setPagination] = useState<DatagridPage>({
    pageSize: 10,
    page: 0,
  });

  const handleChangePagination = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPagination({ ...pagination, page: newPage });
  };

  const handleChangeRowsPerPage: React.ChangeEventHandler<
    HTMLTextAreaElement | HTMLInputElement
  > = (event) => {
    const pageSize = parseInt(event.target.value);
    setPagination({ ...pagination, pageSize });
  };

  const fetchUserData = async (param: Params) => {
    try {
      const [res, error]: APIResult<any> = await ApiHandler(
        fetchUserById,
        param,
      );
      if (res?.body) {
        const { user } = res.body;
        const address = {
          address:
            "" +
            user.UserVerification.addressLine1 +
            ", " +
            user.UserVerification.addressLine2 +
            ", " +
            user.UserVerification.city +
            ", " +
            user.UserVerification.state +
            ", " +
            user.UserVerification.Country.name +
            ", " +
            user.UserVerification.postalCode,
        };
        setUserAddress((addr) => ({ ...addr, ...address }));
      }
      if (error) {
        console.log("error", error);
      }
    } catch (err) {
      console.log("error", err);
    }
  };

  const handleClick = (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.currentTarget && setAnchorEl(event?.currentTarget);
    setOpen((open) => !open);
  };

  const handleClickDownloadMenu = (
    event?: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event?.currentTarget && setDownloadEl(event?.currentTarget);
    setDownloadMenuOpen((downloadMenuOpen) => !downloadMenuOpen);
  };

  const [actionMenuEl, setActionMenuEl] =
    React.useState<HTMLButtonElement | null>(null);
  const actionClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setActionMenuEl(event.currentTarget);
  };
  const actionClose = () => {
    setActionMenuEl(null);
  };
  const actionOpen = Boolean(actionMenuEl);
  const id = actionOpen ? "simple-popover" : undefined;

  // filter options
  const filters: filterType[] = [
    { label: "Date and Time", name: "date" },
    { label: "Sender Account ", name: "senderaccount" },
    { label: "Receiver Account", name: "receiveraccount" },
    { label: "Transaction Type", name: "transactionType" },
    { label: "Transaction ID ", name: "transactionId" },
    { label: "Client ID ", name: "clientId" },
    { label: "Status", name: "status" },
    { label: "Transaction fee", name: "transactionFee" },
    { label: "Exchange fee", name: "exchangeFee" },
    { label: "Debited amount", name: "debitedAmount" },
    { label: "Rate", name: "rate" },
    { label: "Credited amount", name: "creditedAmount" },
    { label: "Balance", name: "balance" },
    { label: "Description", name: "description" },
  ];

  const [visibleColumns, setCheckedItems] = useState<string[]>([
    "date",
    "senderaccount",
    "receiveraccount",
    "transactionType",
    "transactionId",
    "clientId",
    "status",
    "transactionFee",
    "exchangeFee",
    "debitedAmount",
    "rate",
    "creditedAmount",
    "balance",
    "description",
  ]);

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
  const navigate = (path: string, data?: any) => {
    void router.push({
      pathname: path,
      query: data,
    });
  };

  const TableRows: RowSpec[] = useMemo(
    () => [
      {
        label: "Date and Time",
        name: "date",
        className: "font-bold",
        getValue: (row) => formatDate(row.createdAt) ?? "-",
      },

      {
        label: "Sender Account ",
        name: "senderaccount",
        type: "image",
        className: "font-bold",
      },
      {
        label: "Receiver Account",
        name: "receiveraccount",
        type: "image",
        className: "font-bold",
      },
      {
        label: "Transaction Type",
        name: "transactionType",
        className: "font-bold",
        getValue: (row) => {
          return row.operationType === 2
            ? "Outgoing Transfer"
            : row.operationType === 1
            ? "Incoming Transfer"
            : "Internal Transfer";
          // if (row.OperationType?.displayName === "Internal Transfer") {
          //   if (row.sourceId === walletId) {
          //     return "Outgoing Transfer";
          //   } else if (row.destinationId === walletId) {
          //     return "Incoming Transfer";
          //   }
          // }
          // return row.OperationType?.displayName ?? "-";
        },
      },
      {
        label: "Transaction ID",
        name: "transactionId",
        key: "txHash",
        className: "font-bold",
        getValue: (row) => row?.txHash ?? "-",
      },
      {
        label: "Client ID",
        name: "clientId",
        // key: "id",
        getValue: (row) => row?.User?.id ?? "-",
      },
      {
        label: "Status",
        name: "status",
        key: "status",
        getValue: (row) => {
          const pendingStatuses = new Set([
            "PENDING_BLOCKCHAIN_CONFIRMATIONS",
            "SUBMITTED",
            "PENDING_AML_SCREENING",
            "PENDING_ENRICHMENT",
            "PENDING_AUTHORIZATION",
            "QUEUED",
            "PENDING_SIGNATURE",
            "PENDING_3RD_PARTY_MANUAL_APPROVAL",
            "PENDING_3RD_PARTY",
            "BROADCASTING",
            "CONFIRMING",
            "CANCELLING",
          ]);
          const pendingStatusesElse = new Set([
            "CANCELLED",
            "BLOCKED",
            "REJECTED",
            "FAILED",
          ]);

          if (pendingStatuses.has(row?.status)) {
            return "PENDING";
          } else if (row?.status === "COMPLETED") {
            return "COMPLETED";
          } else if (pendingStatusesElse.has(row?.status)) {
            return "FAILED";
          } else {
            return row?.operation === "TRANSFER" ? "PENDING" : "";
          }
        },
        className: "text-[#1AD598]",
      },
      {
        label: "Transaction fee",
        name: "transactionFee",
        // getValue: (row) => bigNumber(row?.TransactionFee?.transactionFee),

        getValue: (row) =>
          row.operationType === 2
            ? bigNumber(row?.TransactionFee?.sourceFee)
            : row.operationType === 1
            ? bigNumber(row?.TransactionFee?.destinationFee)
            : bigNumber(row?.TransactionFee?.transactionFee),
        className: "text-[#1AD598]",
      },
      {
        label: "Exchange fee",
        name: "exchangeFee",
        getValue: (row) => bigNumber(row?.TransactionFee?.exchangeFee),
        className: "text-[#1AD598]",
      },
      {
        label: "Debited amount",
        name: "debitedAmount",
        className: "text-[#1AD598]",

        getValue: (row) =>
          row.operationType === 2
            ? bigNumber(row?.TransactionFee?.amount)
            : bigNumber(row?.TransactionFee?.debitedAmount),
      },
      {
        label: "Rate",
        name: "rate",
        className: "text-[#f00000]",
        getValue: (row) => bigNumber(row?.TransactionFee?.clientRate),
      },
      {
        label: "Credited amount",
        name: "creditedAmount",
        className: "text-[#f00000]",
        getValue: (row) =>
          row.operationType === 1
            ? bigNumber(row?.TransactionFee?.amount)
            : bigNumber(row?.TransactionFee?.creditedAmount),
      },
      {
        label: "Balance",
        name: "balance",
        className: "text-[#217EFD]",
        getValue: (row) => bigNumber(row?.TransactionFee?.balance),
      },
      {
        label: "Description",
        name: "description",
        // key: "note",
        className: "font-bold",
        getValue: (row) =>
          row.operation === "EXCHANGE"
            ? `Exchange - Order ${row?.TransactionFee?.type} - ${row?.TransactionFee?.clientRate} @ ${row?.orderType}`
            : row?.note,

        // getValue: (row) => `Exchange - Order `,
      },
    ],
    [],
  );

  const renderKey = (rowSpec: RowSpec, row: TransactionDetails) => {
    if (rowSpec.type === "image") {
      return (
        <div className="flex  items-center gap-2 py-2 pr-2">
          {row?.Asset?.icon && (
            <Image
              className="h-8 w-8 rounded-full object-cover duration-300"
              src={
                (rowSpec.name.includes("sender")
                  ? row?.SourceAsset?.Asset?.icon
                  : row?.DestinationAsset?.Asset?.icon) ?? row?.Asset?.icon
              }
              alt="asset"
              width={20}
              height={20}
            />
          )}
          <div className="flex flex-col items-start">
            <span className=" text-xl font-semibold">
              {(rowSpec.name.includes("sender")
                ? row?.SourceAsset?.Asset?.name
                : row?.DestinationAsset?.Asset?.name) ?? row?.Asset?.name}
            </span>
            <span className=" text-sm font-semibold leading-[1.3rem] text-[#809FB8]">
              {rowSpec.name.includes("sender")
                ? row.sourceAddress
                : row?.operationType === 2 && row.assetId === "EUR"
                ? row?.EuroTransaction?.IBAN
                : row.destinationAddress ?? "Unknown"}
            </span>
          </div>
        </div>
      );
    }

    if (rowSpec?.getValue) {
      const value = rowSpec?.getValue(row);
      if (rowSpec.name === "status") {
        const color = getStatusColor(`${rowSpec?.getValue(row)}`);
        return (
          <StatusText color={color}>
            {value.toString().toLowerCase()}
          </StatusText>
        );
      }
      return value;
    }

    if (rowSpec?.key) {
      return String(row[rowSpec?.key]) ?? "-";
    }

    return "-";
  };

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingUserData, setLoadingUserData] = useState<boolean>(false);

  async function fetchReports(filters: FilterType) {
    setLoading(true);
    const [res, error]: APIResult<{
      data: TransactionDetails[];
      pagination: Pagination;
    }> = await ApiHandler(getTransactions, filters);
    setLoading(false);

    if (res?.success && res?.body?.data) {
      setTotalPageCount(res?.body?.pagination?.totalItems ?? 0);
      setReports(res?.body?.data);
    }
  }

  useEffect(() => {
    const paramsQuery: FilterType = {
      pageSize: pagination.pageSize,
      pageNumber: pagination.page + 1,
      fromDate: startDate,
      toDate: endDate,
    };

    if (selectedCurrency) paramsQuery.assetName = selectedCurrency;
    if (selectedTransaction) paramsQuery.operationType = selectedTransaction;

    void fetchReports(paramsQuery);
  }, [pagination, selectedCurrency, selectedTransaction, startDate, endDate]);

  const convertToCSV = async () => {
    const paramsQuery: FilterType = {
      pageSize: totalPageCount,
      pageNumber: 0,
      fromDate: startDate,
      toDate: endDate,
    };

    if (selectedCurrency) paramsQuery.assetName = selectedCurrency;
    if (selectedTransaction) paramsQuery.operationType = selectedTransaction;

    const [res, error]: APIResult<{
      data: TransactionDetails[];
      pagination: Pagination;
    }> = await ApiHandler(getTransactions, paramsQuery);

    const filteredReports = res?.body?.data ?? [];
    const reportHeaderval: reportHeaderval[] = [];
    filteredReports?.map((item: any) => {
      reportHeaderval.push({
        Date: item?.createdAt,
        "Sender account": item?.sourceAddress,
        "Receiver account": item?.destinationAddress,
        "Transaction Type": item?.OperationType?.displayName,
        "Transaction Id": item?.txHash,
        "Client Id": item?.User?.id ?? "--",
        Status: item?.status,
        "Transaction Fee": String(
          bigNumber(item?.TransactionFee?.transactionFee),
        ),
        "Exchange Fee": String(bigNumber(item?.TransactionFee?.exchangeFee)),
        "Debited amount":
          item?.operationType === 2
            ? String(bigNumber(item?.TransactionFee?.amount))
            : String(bigNumber(item?.TransactionFee?.debitedAmount)),
        Rate: String(bigNumber(item?.TransactionFee?.clientRate)),
        "Credited amount":
          item?.operationType === 1
            ? String(bigNumber(item?.TransactionFee?.amount))
            : String(bigNumber(item?.TransactionFee?.creditedAmount)),
        Balance: String(bigNumber(item?.TransactionFee?.balance)),
        Description:
          item.operation === "EXCHANGE"
            ? `Exchange - Order ${item?.TransactionFee?.type} - ${item?.TransactionFee?.clientRate} @ ${item?.orderType}`
            : item?.note,
      });
    });
    const headerRow = reportHeaderval[0]
      ? Object.keys(reportHeaderval[0]).join(",")
      : "";
    const csvContent =
      "data:text/csv; charset=utf-8,\uFEFF" +
      headerRow +
      "\n" +
      reportHeaderval.map((row) => Object.values(row).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reports.csv");
    document.body.appendChild(link);
    link.click();
    setDownloadMenuOpen((downloadMenuOpen) => !downloadMenuOpen);
  };

  const convertToPDF = () => {
    setOpenSavePDF((openSavePDF) => !openSavePDF);
    setDownloadMenuOpen((downloadMenuOpen) => !downloadMenuOpen);
  };

  const files: downloadType[] = [
    {
      label: "Download CSV",
      action: convertToCSV,
      image: Download,
      disabled: false,
    },
    {
      label: "Download PDF",
      action: convertToPDF,
      image: Download,
      disabled: false,
    },
  ];

  const companyLegalName = admin?.companyLegalName ?? "";
  const adminImage = admin?.profileImgLink ?? "";

  const [checked, setChecked] = React.useState<{ e: any; id: any } | null>(
    null,
  );

  const handleChange = (e: any, id: any) => {
    setChecked((prev) => (prev?.id === id ? null : { e, id }));
  };

  const icon = (
    <Paper className=" cursor-pointer">
      <Box className="p-2 text-[#1AD598]">Refund</Box>
    </Paper>
  );
  const [html2pdf, setHtml2pdf] = useState<any>(null);

  const params: Params = { id: userId };

  useEffect(() => {
    if (isReports) {
      setLoadingUserData(true);
      fetchUserData(params).finally(() => {
        setLoadingUserData(false);
      });
    }

    if (process.browser) {
      import("html2pdf.js")
        .then((module) => {
          setHtml2pdf(module);
        })
        .catch((error) => {
          console.error("Error importing html2pdf:", error);
        });
    }

    const getOperationType = async () => {
      const [res] = await getAllAssets();

      if (res !== null && "body" in res) {
        setAssets(res.body);
      }
    };

    getOperationType();
  }, []);

  // block scrolling when the modal window is open
  useEffect(() => {
    document.body.classList.toggle("overflow-y-hidden", openSavePDF ?? false);
  }, [openSavePDF]);

  const handleClickDownload = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    row: TransactionDetails,
  ) => {
    e.preventDefault();

    const isBrowser = typeof window !== "undefined";

    if (isBrowser) {
      const userAgent = window.navigator.userAgent;
      const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
      if (!isSafari) {
        const htmlTemplate = ReactDOMServer.renderToStaticMarkup(
          <ReconciliationReport
            row={{ companyLegalName, adminImage, ...row }}
          />,
        );
        const pdfOptions = {
          margin: 5,
          filename: `${row?.User?.firstname}_report.pdf`,
          image: { type: "jpeg", quality: 1.0 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
        };

        html2pdf.default().from(htmlTemplate).set(pdfOptions).save();
      } else {
        try {
          // Render the ReconciliationReport component to HTML
          const htmlTemplate: string = ReactDOMServer.renderToStaticMarkup(
            <ReconciliationReportSafari
              companyLegalName={companyLegalName}
              row={row}
            />,
          );

          // Create a new window
          const win = window.open("", "_blank");
          if (win) {
            // Write HTML content to the new window
            win.document.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
            </head>
            <body>
              ${htmlTemplate}
            </body>
            </html>
            `);

            // Trigger printing
            win.print();
          } else {
            console.error("Unable to open new window");
          }
        } catch (error) {
          console.error("Error generating PDF:", error);
        }
      }
    }
  };

  const handleApplyFilters = () => {
    // Perform any necessary actions when filters are applied
    // You can make API calls or update the state as needed
  };

  const handleClickDownloadPDF = (
    rows: TransactionDetails[],
    currency: string,
    startDate: string,
    endDate: string,
  ) => {
    const isBrowser = typeof window !== "undefined";
    if (isBrowser) {
      const sortedRows = rows.slice().sort((a, b) => {
        const dateA = new Date(a.createdAt ?? "");
        const dateB = new Date(b.createdAt ?? "");
        return dateA.getTime() - dateB.getTime();
      });
      const userAgent = window.navigator.userAgent;
      const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
      if (!isSafari) {
        try {
          const htmlTemplate = ReactDOMServer.renderToStaticMarkup(
            <StatementReport
              rows={sortedRows}
              currency={currency}
              startDate={startDate}
              endDate={endDate}
              companyLegalName={admin?.companyLegalName}
              adminImage={admin?.profileImgLink}
              address={userAddress.address}
            />,
          );
          const pdfOptions = {
            margin: [5, 0, 20, 0],
            filename: `${rows[0]?.User?.firstname}_statement_report.pdf`,
            image: { type: "application/pdf", quality: 1.0 },
            pagebreak: { mode: ["avoid-all", "css", "legacy"] },
            html2canvas: { scale: 1 },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          };

          html2pdf
            .default()
            .from(htmlTemplate)
            .set(pdfOptions)
            .toPdf()
            .get("pdf")
            .then((pdf: any) => {
              const totalPages = pdf.internal.getNumberOfPages();
              for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFontSize(6);
                pdf.setTextColor(150);
                pdf.text(
                  pdf.internal.pageSize.getWidth() - 200,
                  pdf.internal.pageSize.getHeight() - 10,
                  admin?.companyAddress,
                );
                pdf.text(
                  pdf.internal.pageSize.getWidth() - 20,
                  pdf.internal.pageSize.getHeight() - 10,
                  `Page ${i} of ${totalPages}`,
                );
                pdf.line(
                  pdf.internal.pageSize.getWidth() - 201,
                  pdf.internal.pageSize.getHeight() - 13,
                  pdf.internal.pageSize.getWidth() - 9,
                  pdf.internal.pageSize.getHeight() - 13,
                  "S",
                );
              }
            })
            .save();
        } catch (error) {
          console.log("Saving PDF error.", error);
        }
      } else {
        try {
          // Render the StatementReportSafari component to HTML
          const htmlTemplate: string = ReactDOMServer.renderToStaticMarkup(
            <StatementReport
              rows={rows}
              currency={currency}
              startDate={startDate}
              endDate={endDate}
              companyLegalName={companyLegalName}
              adminImage={adminImage}
              address={userAddress.address}
            />,
          );

          setTimeout(() => {
            try {
              // Create a new window
              const win = window.open("", "_blank");

              if (win) {
                // Write HTML content to the new window
                win.document.write(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Statement Report</title>
                </head>
                <body>
                  <div style={width: 90%;}>
                  ${htmlTemplate}
                  </div>
                </body>
                </html>
                `);
                // Trigger printing
                win.print();
              }
            } catch (error) {
              console.log("error", error);
            }
          });
        } catch (error) {
          console.error("error generating PDF:", error);
        }
      }
    }
  };

  // Form
  interface FormData {
    currency: string;
    startDate: string;
    endDate: string;
  }

  const getReportData = async (currency = "", startDate = "", endDate = "") => {
    const paramsQuery: FilterType = {
      pageSize: 1000000000,
      pageNumber: 0,
      fromDate: startDate,
      toDate: endDate,
    };

    if (currency) paramsQuery.assetName = currency;

    const [res, error]: APIResult<{
      data: TransactionDetails[];
      pagination: Pagination;
    }> = await ApiHandler(getTransactions, paramsQuery);

    const filteredReports = res?.body.data ?? [];
    let sortedTransactions: TransactionDetails[] = [];
    if (filteredReports.length === 0) {
      setErrorMessage("No transactions were found during this period!");
      return;
    } else {
      // sort by id
      sortedTransactions = filteredReports
        .slice()
        .filter((value) => {
          return (
            value.status === "COMPLETED" &&
            (value.OperationType.id === 1 ||
              value.OperationType.id === 2 ||
              value.OperationType.id === 5)
          );
        })
        .sort((a, b) => {
          const dateA = new Date(a.createdAt ?? "");
          const dateB = new Date(b.createdAt ?? "");
          return dateA.getTime() - dateB.getTime();
        });
    }
    setOpenSavePDF(false);
    handleClickDownloadPDF(sortedTransactions, currency, startDate, endDate);
  };

  const onSubmit = (data: any) => {
    setErrorMessage("");
    if (new Date(data.startDate) > new Date(data.endDate)) {
      setErrorMessage("The start date cannot be longer than the end date!");
      return;
    }
    getReportData(data.currency, data.startDate, data.endDate);
  };

  const onError = (err: any) => {
    setErrorMessage(err);
  };

  const onChangeCurrency = (event: any) => {
    setSelectedCurrencyFilter(event.target.value);
  };

  return (
    <div className="">
      <div className="  flex items-center justify-between">
        <div className="text-lg font-bold">Recent activity</div>

        <div className="flex gap-4">
          {isDashboard ? null : (
            <MuiButton
              name="Download"
              background="#ffffff"
              color="#C1922E"
              onClick={handleClickDownloadMenu}
              disabled={loadingUserData}
            >
              <span className="text-md pl-2 font-semibold">&#9013;</span>
            </MuiButton>
          )}
          <MuiButton
            name="Display"
            background="#ffffff"
            color="#C1922E"
            onClick={handleClick}
          >
            <span className="text-md pl-2 font-semibold">&#9013;</span>
          </MuiButton>
        </div>

        <Popper
          open={open}
          anchorEl={anchorEl}
          placement={"bottom-end"}
          transition
          sx={{
            zIndex: "99",
          }}
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={350}>
              <Paper
                sx={{
                  p: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  maxHeight: "40vh",
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

        <Popper
          open={downloadMenuOpen}
          anchorEl={downloadEl}
          placement={"bottom-end"}
          transition
          sx={{
            zIndex: "99",
          }}
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={350}>
              <Paper
                sx={{
                  p: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  maxHeight: "40vh",
                }}
              >
                {files.map((item, i) => (
                  <div key={i} className="items-right flex px-2">
                    {/* <option disabled={item.disabled} onClick={item.action}> */}
                    <a
                      onClick={item.disabled ? undefined : item.action}
                      className={`${item.disabled ? "disabled" : ""}`}
                    >
                      <div className="flex">
                        <Image src={Download} alt="Download" />
                        <label
                          className="cursor-pointer px-2"
                          htmlFor={`${item.label}`}
                        >
                          {item.label}
                        </label>
                      </div>
                    </a>
                    {/* </option> */}
                  </div>
                ))}
              </Paper>
            </Fade>
          )}
        </Popper>
      </div>

      <div className=" mt-6 h-fit max-h-[65vh] overflow-x-scroll shadow-lg">
        {loading ? (
          <div className="flex h-full min-h-[50vh] items-center justify-center">
            <LoaderIcon className=" h-12 w-12" />
          </div>
        ) : (
          <div className=" max-h-fit max-w-fit">
            <table className="min-w-max border-separate border-spacing-0 ">
              <thead className=" sticky top-0 z-10 px-10 pb-10 text-[#646464]">
                <tr>
                  {TableRows.map((item, i) => {
                    if (visibleColumns.includes(item.name)) {
                      return (
                        <th
                          key={i}
                          className=" border-b-[1px] border-[#BABABA] bg-[#E8E9EB] py-3 pl-4 pr-8 text-start font-semibold"
                        >
                          {item.label}
                        </th>
                      );
                    } else {
                      return <Fragment key={i} />;
                    }
                  })}
                </tr>
              </thead>
              <tbody className="h-full bg-white">
                {reports.length ? (
                  reports.map((row, i) => (
                    <tr key={i} className=" border-b p-10">
                      {TableRows.map((key, idx) => {
                        if (visibleColumns.includes(key.name)) {
                          return (
                            <td
                              key={idx}
                              className="border-b-[1px] border-[#BABABA] py-2 pl-4 pr-10 text-start"
                            >
                              <div className={` ${key.className ?? ""}`}>
                                {renderKey(key, row)}
                              </div>
                            </td>
                          );
                        } else {
                          return <Fragment key={i} />;
                        }
                      })}

                      {row.operationType === 1 && (
                        <td
                          key={row.id}
                          className=" sticky right-[-1px] bg-white md:right-0"
                        >
                          <div className=" relative">
                            <button
                              aria-describedby={id}
                              onClick={(e) => {
                                handleChange(e, row.id);
                              }}
                            >
                              <Image
                                src={ThreeDots as StaticImageData}
                                alt="menu"
                                className="m-auto"
                              />
                            </button>

                            <div className=" absolute right-8 top-[-0.5rem]">
                              {checked?.id === row.id && (
                                <Fade
                                  onClick={() =>
                                    navigate("/app/transfers", {
                                      amount: row?.TransactionFee?.amount,
                                      assetId: row?.assetId,
                                      sourceAddress: row?.sourceAddress,
                                    })
                                  }
                                  in={checked.e}
                                  className="cursor-pointer"
                                >
                                  {icon}
                                </Fade>
                              )}
                            </div>
                          </div>
                        </td>
                      )}

                      {row.operationType === 5 && (
                        <td
                          key={row.id}
                          className=" sticky right-[-1px] bg-white md:right-0"
                        >
                          <div className=" relative">
                            <button
                              aria-describedby={id}
                              onClick={(e) => {
                                handleChange(e, row.id);
                              }}
                            >
                              <Image
                                src={ThreeDots as StaticImageData}
                                alt="menu"
                                className="m-auto"
                              />
                            </button>

                            <div className=" absolute right-8 top-[-0.5rem]">
                              {checked?.id === row.id && (
                                <button
                                  onClick={(e) => {
                                    handleClickDownload(e, row);
                                  }}
                                  className=" rounded-md bg-white p-4 shadow-md"
                                >
                                  <span className="text-[#217EFD]">
                                    Download
                                  </span>
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={visibleColumns.length}>
                      <span className="color-black flex justify-center py-4 text-center text-lg font-semibold">
                        No data found
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="my-4 ml-auto  flex w-fit justify-between">
        <Stack spacing={2}>
          <div className="flex items-center justify-between gap-4">
            <TablePagination
              component="div"
              count={totalPageCount}
              page={pagination.page}
              onPageChange={handleChangePagination}
              rowsPerPage={pagination.pageSize}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </div>
        </Stack>
      </div>
      {/* 
        Modal Window
           Filters 
      */}
      {openSavePDF && (
        <ModalWindow
          title="Download PDF"
          message="Please fill in all fields and press the Download PDF button to save the report as a PDF file."
          onClose={() => {
            setOpenSavePDF(false);
          }}
          errorMessage={errorMessage}
          showCloseButtonInTitle
        >
          <form onSubmit={handleSubmit(onSubmit, onError)}>
            <div>
              <div>Currency</div>
              <Select
                required
                {...register("currency")}
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#e5e7eb",
                  },
                }}
                MenuProps={{
                  style: { maxWidth: "200px" },
                }}
                value={selectedCurrencyFilter}
                size="small"
                onChange={onChangeCurrency}
                className="mb-2 mt-1 w-full rounded-md outline outline-1 outline-[#c4c4c4]"
              >
                {assets.map(
                  (item) =>
                    item.name !== "Any" && (
                      <MenuItem key={item.name} value={item.name}>
                        <div className="flex items-center gap-2">
                          <Image
                            width="30"
                            height="30"
                            src={item.icon}
                            alt="icon"
                          />
                          {item.name}
                        </div>
                      </MenuItem>
                    ),
                )}
              </Select>
            </div>
            <div>
              <div>Start date</div>
              <input
                {...register("startDate")}
                required
                type="date"
                className=" mb-2 mt-1 w-full rounded-md px-2 py-[7px] outline outline-1 outline-[#c4c4c4]"
                value={startDateFilter}
                onChange={(e) => {
                  setStartDate(e.target.value);
                }}
                max={endDate}
              />
            </div>
            <div>
              <div>End date</div>
              <input
                {...register("endDate")}
                required
                type="date"
                className=" mb-2 mt-1 w-full  rounded-md px-2 py-[7px] outline outline-1 outline-[#c4c4c4]"
                value={endDateFilter}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
              />
            </div>
            <button
              type="submit"
              className="w-full justify-center rounded-md bg-[#C1922E] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
            >
              Download PDF
            </button>
          </form>
        </ModalWindow>
      )}
    </div>
  );
};

export default TableComponent;
