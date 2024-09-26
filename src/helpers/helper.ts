import Router from "next/router";
import useGlobalStore from "~/store/useGlobalStore";
import CryptoJS from "crypto-js";
import localStorageService from "~/service/LocalstorageService";
import { CryptoRowData, displayFilterType, RowData } from "~/types/Common";
import EURO_COIN from "../assets/currency/EURO_COIN.svg";
import GBP_COIN from "../assets/currency/GBP_COIN.svg";
import USD_COIN from "../assets/currency/USD_COIN.svg";
const maskAddress = (maskString: string, assetId: string) => {
  const masked = maskString?.split("");
  const numberOfletter = assetId === "EUR" ? 4 : 5;
  const firstFiveLetters = masked.slice(0, numberOfletter);
  const lastFiveLetters = masked.slice(-numberOfletter);
  return firstFiveLetters.join("") + "*****" + lastFiveLetters.join("");
};

const encryptionKey =
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY ??
  "Xca{J*3CM-#1S!EmVLryqE,a;x+Bu/L+_XxgaFhGJPi_8Vu7kx2?";
export const encryptPayload = (data: any) => {
  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    encryptionKey,
  );
  const encrypt = encryptedData.toString();

  return { data: encrypt };
};
export const decryptResponse = (data: any) => {
  const decryptedData = CryptoJS.AES.decrypt(data, encryptionKey).toString(
    CryptoJS.enc.Utf8,
  );

  return JSON.parse(decryptedData);
};

export const euroFormat = Intl.NumberFormat("en-DE", {
  style: "currency",
  currency: "EUR",
});

export const bigNumber = (v: any, currency?: any) => {
  if (v) {
    return Number(v ?? 0).toFixed(6);
  }
  return 0;
};

export function coinName(value: any) {
  if (process.env.NEXT_PUBLIC_DEPLOYMENT_TYPE === "qa") {
    return value === "BTC"
      ? "BTC"
      : value === "USDT.t"
      ? "USDT_TRC20"
      : value === "USDC"
      ? "USDC_ERC20"
      : value === "USDT"
      ? "USDT_ERC20"
      : value === "ETH"
      ? "ETH"
      : value;
  } else {
    return value === "BTC"
      ? "BTC"
      : value === "USDT.t"
      ? "USDT_TRC20"
      : value === "USDC"
      ? "USDC_ERC20"
      : value === "USDT"
      ? "USDT_ERC20"
      : value === "ETH"
      ? "ETH"
      : value;
  }
}

export function coinForKrakenName(value: any) {
  if (process.env.NEXT_PUBLIC_DEPLOYMENT_TYPE === "qa") {
    return value === "USDC_TRC20" || value === "USDT_TRC20"
      ? "USDT"
      : value === "USDC_ERC20"
      ? "USDC"
      : value === "USDT_ERC20"
      ? "USDT"
      : value;
  } else {
    return value === "BTC"
      ? "BTC"
      : value === "TRX_USDT_S2UZ"
      ? "USDT"
      : value === "USDC"
      ? "USDC"
      : value === "USDT_ERC20"
      ? "USDT"
      : value === "ETH"
      ? "ETH"
      : value;
  }
}

export function changeName(value: string) {
  const parts = value.split("/");
  if (parts[0] === "USDT.t") {
    parts[0] = "USDT";
  }
  if (parts[1] === "USDT.t") {
    parts[1] = "USDT";
  }
  const result = parts.join("/");
  return result;
}

function dateValidation(item: any) {
  const currentDate = new Date();
  if (!item.validFrom || !item.validTo) {
    return true;
  }
  const validFromDate = new Date(item.validFrom);
  const validToDate = new Date(item.validTo);
  return currentDate >= validFromDate && currentDate <= validToDate;
}

const formatDate = (date: string | undefined): string => {
  if (!date) return "";

  const utcDate = new Date(date);
  // Get user's time zone
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  // Convert UTC time to local time based on user's time zone
  const localDate = new Date(
    utcDate.toLocaleString("en-US", { timeZone: userTimeZone }),
  );
  // Format the local date and time
  const day = localDate.getDate().toString().padStart(2, "0");
  const month = (localDate.getMonth() + 1).toString().padStart(2, "0");
  const year = localDate.getFullYear();
  let hours = localDate.getHours().toString().padStart(2, "0");
  const minutes = localDate.getMinutes().toString().padStart(2, "0");
  const ampm = localDate.getHours() >= 12 ? "PM" : "AM";
  hours = (parseInt(hours) % 12 || 12).toString();
  const formattedDate = `${day}-${month}-${year}\n${hours}:${minutes} ${ampm}`;
  return formattedDate;
};
const tableFormatDate = (date: string | undefined): string => {
  if (!date) return "";
  const utcDate = new Date(date);
  // Get user's time zone
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  // Convert UTC time to local time based on user's time zone
  const localDate = new Date(
    utcDate.toLocaleString("en-US", { timeZone: userTimeZone }),
  );
  // Format the local date and time
  const day = localDate.getDate().toString().padStart(2, "0");
  const month = (localDate.getMonth() + 1).toString().padStart(2, "0");
  const year = localDate.getFullYear();

  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
};
const logout = async () => {
  localStorage.clear();
  useGlobalStore.getState().resetStore();

  const ip = await fetch("https://api.ipify.org?format=json");
  const res = await ip.json();

  localStorageService.setIpAddress(res?.ip);
  void Router.replace("/auth/login");
};

const findIp = async () => {
  return fetch("https://api.ipify.org?format=json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch IP address");
      }
      return response.json();
    })
    .then(async (data) => {
      const res = await data.ip;
      return res;
    })
    .catch((error) => {
      console.error("Error fetching IP address:", error);
      throw error; // Re-throw the error to propagate it
    });
};

export function convertUrlParams(params: FilterType) {
  const paramsObject: Record<string, string> = {};

  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      paramsObject[key] = String(params[key]);
    }
  }

  const queryParams = new URLSearchParams(paramsObject);

  return queryParams.toString(); // Convert URLSearchParams to string
}

const getStatusColor = (status: string): string => {
  if (status.toUpperCase() === "COMPLETED") {
    return "#A8E6CF";
  } else if (status.toUpperCase() === "PENDING") {
    return "#FDFFB6";
  } else if (status.toUpperCase() === "FAILED") {
    return "#FF8B94";
  } else {
    return "white";
  }
};

export const dummyData: RowData[] = [
  {
    creationDate: "22 Apr at 08:14",
    account: "12345678",
    beneficiaryName: "John Doe",
    beneficiaryIban: "Qweeeer34a",
    status: "Completed",
    clientId: "C123456",
    amount: "1,000.00",
    currency: "EUR",
    fee: "5.00",
    balance: "9,995.00",
  },
  {
    creationDate: "22 Apr at 08:14",
    account: "98765432",
    beneficiaryName: "Jane Smith",
    beneficiaryIban: "Qweeeer34a",
    status: "Pending",
    clientId: "C654321",
    amount: "2,500.00",
    currency: "GBP",
    fee: "10.00",
    balance: "7,490.00",
  },

  {
    creationDate: "22 Apr at 08:14",
    account: "98765432",
    beneficiaryName: "Jane Smith",
    beneficiaryIban: "Qweeeer34a",
    status: "Pending",
    clientId: "C654321",
    amount: "2,500.00",
    currency: "GBP",
    fee: "10.00",
    balance: "7,490.00",
  },
  {
    creationDate: "22 Apr at 08:14",
    account: "98765432",
    beneficiaryName: "Jane Smith",
    beneficiaryIban: "Qweeeer34a",
    status: "Pending",
    clientId: "C654321",
    amount: "2,500.00",
    currency: "GBP",
    fee: "10.00",
    balance: "7,490.00",
  },
  {
    creationDate: "22 Apr at 08:14",
    account: "98765432",
    beneficiaryName: "Jane Smith",
    beneficiaryIban: "Qweeeer34a",
    status: "Pending",
    clientId: "C654321",
    amount: "2,500.00",
    currency: "GBP",
    fee: "10.00",
    balance: "7,490.00",
  },
  {
    creationDate: "22 Apr at 08:14",
    account: "98765432",
    beneficiaryName: "Jane Smith",
    beneficiaryIban: "FR7630004000031234567890143",
    status: "Pending",
    clientId: "C654321",
    amount: "2,500.00",
    currency: "GBP",
    fee: "10.00",
    balance: "7,490.00",
  },
  {
    creationDate: "22 Apr at 08:14",
    account: "98765432",
    beneficiaryName: "Jane Smith",
    beneficiaryIban: "FR7630004000031234567890143",
    status: "Pending",
    clientId: "C654321",
    amount: "2,500.00",
    currency: "GBP",
    fee: "10.00",
    balance: "7,490.00",
  },
  {
    creationDate: "22 Apr at 08:14",
    account: "98765432",
    beneficiaryName: "Jane Smith",
    beneficiaryIban: "FR7630004000031234567890143",
    status: "Pending",
    clientId: "C654321",
    amount: "2,500.00",
    currency: "GBP",
    fee: "10.00",
    balance: "7,490.00",
  },
  {
    creationDate: "22 Apr at 08:14",
    account: "98765432",
    beneficiaryName: "Jane Smith",
    beneficiaryIban: "FR7630004000031234567890143",
    status: "Pending",
    clientId: "C654321",
    amount: "2,500.00",
    currency: "GBP",
    fee: "10.00",
    balance: "7,490.00",
  },
  {
    creationDate: "22 Apr at 08:14",
    account: "98765432",
    beneficiaryName: "Jane Smith",
    beneficiaryIban: "FR7630004000031234567890143",
    status: "Pending",
    clientId: "C654321",
    amount: "2,500.00",
    currency: "GBP",
    fee: "10.00",
    balance: "7,490.00",
  },
  {
    creationDate: "22 Apr at 08:14",
    account: "98765432",
    beneficiaryName: "Jane Smith",
    beneficiaryIban: "FR7630004000031234567890143",
    status: "Pending",
    clientId: "C654321",
    amount: "2,500.00",
    currency: "GBP",
    fee: "10.00",
    balance: "7,490.00",
  },
  {
    creationDate: "22 Apr at 08:14",
    account: "98765432",
    beneficiaryName: "Jane Smith",
    beneficiaryIban: "FR7630004000031234567890143",
    status: "Pending",
    clientId: "C654321",
    amount: "2,500.00",
    currency: "GBP",
    fee: "10.00",
    balance: "7,490.00",
  },
  {
    creationDate: "22 Apr at 08:14",
    account: "98765432",
    beneficiaryName: "Jane Smith",
    beneficiaryIban: "FR7630004000031234567890143",
    status: "Pending",
    clientId: "C654321",
    amount: "2,500.00",
    currency: "GBP",
    fee: "10.00",
    balance: "7,490.00",
  },
  {
    creationDate: "22 Apr at 08:14",
    account: "98765432",
    beneficiaryName: "Jane Smith",
    beneficiaryIban: "FR7630004000031234567890143",
    status: "Pending",
    clientId: "C654321",
    amount: "2,500.00",
    currency: "GBP",
    fee: "10.00",
    balance: "7,490.00",
  },

  {
    creationDate: "22 Apr at 08:14",
    account: "98765432",
    beneficiaryName: "Jane Smith",
    beneficiaryIban: "FR7630004000031234567890143",
    status: "Pending",
    clientId: "C654321",
    amount: "2,500.00",
    currency: "GBP",
    fee: "10.00",
    balance: "7,490.00",
  },
  {
    creationDate: "22 Apr at 08:14",
    account: "98765432",
    beneficiaryName: "Jane Smith",
    beneficiaryIban: "FR7630004000031234567890143",
    status: "Pending",
    clientId: "C654321",
    amount: "2,500.00",
    currency: "GBP",
    fee: "10.00",
    balance: "7,490.00",
  },
  {
    creationDate: "22 Apr at 08:14",
    account: "98765432",
    beneficiaryName: "Jane Smith",
    beneficiaryIban: "FR7630004000031234567890143",
    status: "Pending",
    clientId: "C654321",
    amount: "2,500.00",
    currency: "GBP",
    fee: "10.00",
    balance: "7,490.00",
  },
  {
    creationDate: "22 Apr at 08:14",
    account: "98765432",
    beneficiaryName: "Jane Smith",
    beneficiaryIban: "FR7630004000031234567890143",
    status: "Pending",
    clientId: "C654321",
    amount: "2,500.00",
    currency: "GBP",
    fee: "10.00",
    balance: "7,490.00",
  },
  {
    creationDate: "22 Apr at 08:14",
    account: "98765432",
    beneficiaryName: "Jane Smith",
    beneficiaryIban: "FR7630004000031234567890143",
    status: "Pending",
    clientId: "C654321",
    amount: "2,500.00",
    currency: "GBP",
    fee: "10.00",
    balance: "7,490.00",
  },
  {
    creationDate: "22 Apr at 08:14",
    account: "98765432",
    beneficiaryName: "Jane Smith",
    beneficiaryIban: "FR7630004000031234567890143",
    status: "Pending",
    clientId: "C654321",
    amount: "2,500.00",
    currency: "GBP",
    fee: "10.00",
    balance: "7,490.00",
  },
  {
    creationDate: "22 Apr at 08:14",
    account: "98765432",
    beneficiaryName: "Jane Smith",
    beneficiaryIban: "FR7630004000031234567890143",
    status: "Pending",
    clientId: "C654321",
    amount: "2,500.00",
    currency: "GBP",
    fee: "10.00",
    balance: "7,490.00",
  },
];

export const cards = [
  {
    name: "EUR",
    icon: EURO_COIN,
    balance: 58808764.25,
    accountNumber: "1JunQ*****1Q2N",
    accountName: "Name",
    bic: "PYYY123423",
    vIBAN: "GB907097978687AHJHBAS",
    bankName: "EUbank",
    bankAddress: "24, Williams street, London",
    country: "United Kingdom",
  },

  {
    name: "GBP",
    icon: GBP_COIN,
    balance: 58764.64,
    accountNumber: "1JunQ*****1Q2N",
    accountName: "Name",
    bic: "PYYY123423",
    vIBAN: "GB907097978687AHJHBAS",
    bankName: "EUbank",
    bankAddress: "24, Williams street, London",
    country: "United Kingdom",
  },

  {
    name: "USD",
    icon: USD_COIN,
    balance: 58764.64,
    accountNumber: "1JunQ*****1Q2N",
    accountName: "Name",
    bic: "PYYY123423",
    vIBAN: "GB907097978687AHJHBAS",
    bankName: "EUbank",
    bankAddress: "24, Williams street, London",
    country: "United Kingdom",
  },
];

export const cryptoDummyData: CryptoRowData[] = [
  {
    fileName: "Document1.docx",
    fileSize: "28.50 KB",
    date: "16/11/2022",
  }, {
    fileName: "Document1.docx",
    fileSize: "28.50 KB",
    date: "16/11/2022",
  }, {
    fileName: "Document1.docx",
    fileSize: "28.50 KB",
    date: "16/11/2022",
  }, {
    fileName: "Document1.docx",
    fileSize: "28.50 KB",
    date: "16/11/2022",
  }, {
    fileName: "Document1.docx",
    fileSize: "28.50 KB",
    date: "16/11/2022",
  }, {
    fileName: "Document1.docx",
    fileSize: "28.50 KB",
    date: "16/11/2022",
  }, {
    fileName: "Document1.docx",
    fileSize: "28.50 KB",
    date: "16/11/2022",
  },
];

export {
  maskAddress,
  formatDate,
  logout,
  tableFormatDate,
  dateValidation,
  findIp,
  getStatusColor,
};
