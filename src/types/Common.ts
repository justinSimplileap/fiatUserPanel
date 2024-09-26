import { Url } from "url";

interface CountryListType {
  id: string;
  name: string;
  currency: string;
  currencySymbol: string;
}

interface DropDownOptionsType {
  value: string;
  label: string;
  flag?: string;
}

interface LegalDocuments extends CommonKeys {
  id: string;
  title: string;
  policyDocumentType: number;
  documentLink: Url;
  PolicyDocumentType: PolicyDocumentType;
  documentText: string;
}

interface PolicyDocumentType extends CommonKeys {
  displayName: string;
  name: string;
}

interface DropDownOptionsResponseType {
  id: string;
  name: string;
  currency?: string;
  from?: string;
  to?: string;
  label?: string;
  countryCode?: string;
}

interface reportHeaderval {
  "CREATION DATE": string;
  ACCOUNT: string;
  "BENEFICIARY NAME": string;
  "BENEFICIARY IBAN": string;
  STATUS: string;
  "CLIENT ID": string;
  AMOUNT: string;
  CURRENCY: string;
  FEE: string;
  BALANCE: string;
}
interface cryptoHeaderval {
 "File Name": string;
  "File Size": string;
  "Date": string;
  "Action": string;
};

interface displayFilterType {
  label: string;
  name: string;
}

type RowData = {
  creationDate: string;
  account: string;
  beneficiaryName: string;
  beneficiaryIban: string;
  status: string;
  clientId: string;
  amount: string;
  currency: string;
  fee: string;
  balance: string;
  icon?: string;
};

type CryptoRowData = {
  fileName: string;
  fileSize: string;
  date: string;
};

export type {
  CountryListType,
  RowData,
  DropDownOptionsType,
  DropDownOptionsResponseType,
  reportHeaderval,
  displayFilterType,
  cryptoHeaderval,
  CryptoRowData
};
