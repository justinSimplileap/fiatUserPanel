import { ApiHandler } from "../UtilService";
import ProtectedAxiosInstance from "../ProtectedAxiosInstance";
import { convertUrlParams } from "~/helpers/helper";

const createTransaction = (data: CryptoWithdrawalForm) =>
  ApiHandler(() => ProtectedAxiosInstance.post("/transaction", data));

const getTransactionFee = (
  data: CryptoWithdrawalForm | CryptoTransferForm,
): APIFunction<CalculatedFee> =>
  ApiHandler(() => ProtectedAxiosInstance.post("/transaction/fee", data));

const createInternalTransaction = (data: CryptoTransferForm) =>
  ApiHandler(() => ProtectedAxiosInstance.post("/transaction/internal", data));

const getTransactions = (params: FilterType) => {
  return ProtectedAxiosInstance.get(
    `transaction/reports?${convertUrlParams(params)}`,
  );
};

const getEcomTransactions = (params: FilterType) => {
  return ProtectedAxiosInstance.get(
    `transaction/ecom-transaction-reports?${convertUrlParams(params)}`,
  );
};

const getLimits = async (): APIFunction<Limits[]> =>
  await ApiHandler(() => ProtectedAxiosInstance.get("/exchange-limits"));

const getEuroTemplates = async (): APIFunction<EuroMail[]> =>
  await ApiHandler(() =>
    ProtectedAxiosInstance.get("/exchange/euro-templates"),
  );

export {
  createTransaction,
  getTransactionFee,
  createInternalTransaction,
  getEuroTemplates,
  getLimits,
  getTransactions,
  getEcomTransactions,
};
