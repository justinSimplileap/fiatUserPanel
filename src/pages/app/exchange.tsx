import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "~/components/layout";
import withAuth from "~/components/withAuth";
import Exchange from "~/components/exchange/Exchange";
import useGlobalStore from "~/store/useGlobalStore";
import { checkUserStatus } from "~/service/api/accounts";

const ExchangePage = () => {
  const router = useRouter();

  const [status, setStatus] = useState(false);

  const checkStatus = async () => {
    const [response, error] = await checkUserStatus();

    if (response?.success) {
      setStatus(response?.success);
    } else {
      router.push("/app/dashboard");
    }
  };

  useEffect(() => {
    void checkStatus();
  }, []);

  return <Layout title="Exchange">{status && <Exchange />}</Layout>;
};

export default withAuth(ExchangePage);
