interface OTCMail {
  clientName: string;
  contactPerson: string;
  accountNumber: string;
  ordertype: string;
  date: string;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
}

interface EuroMail {
  assetId: string;
  from: string;
  amount: string;
  paymentSystem: string;
  IBAN: string;
  customerName: string | undefined;
  customerAddress: string;
  Zipcode: string;
  Customercity: string;
  Country: string;
  Reference: string;
  Description: string;
  swiftBic: string;
  Bankname: string;
  Bankaddress: string;
  Banklocation: string;
  bankcountry: string;
  isApproved: boolean;
}
