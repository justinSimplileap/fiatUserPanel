import Button from "../../common/Button";
import ExchangeInput from "../../common/ExchangeInput";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import CloseBtn from "~/assets/general/close.svg";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { getLegalDocuments } from "~/service/ApiRequests";
import { ApiHandler } from "~/service/UtilService";
import { Dialog } from "@mui/material";

interface VerifyEmailProps {
  close: () => void;
  handleChangeScreen: (screen: string) => void;
  companyEmail: string;
  onEmailSubmit: (companyEmail: string, hitAPI?: boolean) => void;
  loading: boolean;
}

interface Form {
  companyEmail: string;
  checkbox: string;
}

const VerifyEmail: React.FC<VerifyEmailProps> = ({
  close,
  companyEmail,
  onEmailSubmit,
  handleChangeScreen,
  loading,
}) => {
  const { handleSubmit, control, watch, reset } = useForm<Form>();
  const [legalDocuments, setLegalDocuments] = useState<LegalDocuments[]>([]);
  const [open, setOpen] = useState<string>("");
  const [selectedLegalDocument, setSelectedLegalDocument] =
    useState<LegalDocuments | null>(null);

  const getDocumentList = async () => {
    const [data] = await ApiHandler(getLegalDocuments);

    if (data?.success) {
      const docValue = data.body as LegalDocuments[];
      setLegalDocuments(docValue);
    }
    return [];
  };

  useEffect(() => {
    getDocumentList();
  }, []);
  const onSubmit = (data: any) => {
    onEmailSubmit(data.companyEmail);
  };

  useEffect(() => {
    companyEmail && reset({ companyEmail });
  }, [companyEmail]);

  const renderSections = (content: string) => {
    const sections = content.split(/<\/?h[1-6]>/g);

    return sections.map((section, index) => (
      <div key={index}>
        {section.startsWith("<h") ? (
          <h2
            className="my-4 text-lg font-medium"
            dangerouslySetInnerHTML={{ __html: section }}
          />
        ) : (
          <p dangerouslySetInnerHTML={{ __html: section }} />
        )}
      </div>
    ));
  };

  return (
    <div>
      <div className="mb-2 flex items-center ">
        <Dialog
          fullScreen
          open={open === "legalDocPopup"}
          onClose={() => {
            setOpen("");
            setSelectedLegalDocument(null);
          }}
        >
          <div className="">
            <div className=" m-auto w-[90%]">
              <div className="mt-8 flex justify-between pb-4">
                <p className=" m-auto text-sm font-bold sm:text-base lg:text-lg">
                  {selectedLegalDocument?.PolicyDocumentType?.displayName}
                </p>
                <button
                  onClick={() => {
                    setOpen("");
                  }}
                >
                  <div>
                    <Image src={CloseBtn as StaticImageData} alt="Close" />
                  </div>
                </button>
              </div>
              <div className="">
                <div className=" flex flex-col justify-between py-4 text-xs sm:text-sm lg:text-base">
                  {/* ================================== */}
                  {selectedLegalDocument ? (
                    <div>
                      <p className="my-4 text-xl font-semibold">
                        {selectedLegalDocument.title}
                      </p>
                      {renderSections(selectedLegalDocument.documentText)}
                    </div>
                  ) : null}

                  {/* =================================== */}
                </div>
              </div>
            </div>
          </div>
        </Dialog>
        <div className="text-2xl font-bold">Company Profile creation</div>
        <button className="ml-auto" onClick={close}>
          <Image
            className="scale-125 cursor-pointer"
            src={CloseBtn as StaticImageData}
            alt="close"
          />
        </button>
      </div>
      <p className="my-6 font-semibold">Create entity account</p>
      <form>
        <div className="mb-4">
          <ExchangeInput
            control={control}
            label="Enter Email"
            name="companyEmail"
            type="text"
            placeholder="Somebody@somemail.com"
            rules={{
              required: "Email is required",
              validate: (value: string) => {
                const emailPattern =
                  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
                if (!emailPattern.test(value)) {
                  return "Invalid companyEmail address";
                }
                return true; // Return true to indicate the validation passed
              },
            }}
          />
        </div>
        <div className="flex gap-2">
          <label className="flex">
            {/* <ExchangeInput
              name="checkbox"
              type="checkbox"
              control={control}
              label=""
              rules={{
                required: "Checkbox is required",
              }}
            /> */}

            <Controller
              name="checkbox"
              control={control}
              rules={{
                required: "Checkbox is required",
              }}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...field}
                      value={field.value || ""}
                      className="mt-[2.5px]"
                    />

                    <div className="flex items-center">
                      I agree to the{" "}
                      {legalDocuments
                        .filter((item) => item?.PolicyDocumentType?.id === 1)
                        .map((item, i) => (
                          <div key={i}>
                            <span className=" text-sm"> </span>
                            {item?.documentText !== "" ? (
                              <span
                                onClick={() => {
                                  setSelectedLegalDocument(item);
                                  setOpen("legalDocPopup");
                                }}
                                className=" mx-1 cursor-pointer text-sm font-semibold text-[#C1922E]"
                              >
                                Terms and conditions
                              </span>
                            ) : (
                              <Link
                                target="_blank"
                                href={item?.documentLink}
                                className="mx-1 text-sm font-semibold text-[#C1922E]"
                              >
                                Terms and conditions
                              </Link>
                            )}
                          </div>
                        ))}{" "}
                      {legalDocuments
                        .filter((item) => item?.PolicyDocumentType?.id === 2)
                        .map((item, i) => (
                          <div key={i}>
                            {item?.documentText !== "" ? (
                              <p
                                onClick={() => {
                                  setSelectedLegalDocument(item);
                                  setOpen("legalDocPopup");
                                }}
                                className=" cursor-pointer text-sm font-semibold text-[#C1922E]"
                              >
                                <span className="mx-1 text-black"> and </span>{" "}
                                Privacy policy
                              </p>
                            ) : (
                              <Link
                                target="_blank"
                                href={item.documentLink}
                                className="text-sm font-semibold text-[#C1922E]"
                              >
                                <span className="mx-1 text-black"> and</span>{" "}
                                Privacy policy
                              </Link>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-red-500">{error?.message}</p>
                </div>
              )}
            />
          </label>
        </div>

        {/* ==================== */}
        <div className="mt-4 flex">
          <button
            type="button"
            className="font-bold"
            onClick={() => {
              onEmailSubmit(watch().companyEmail, false);
              handleChangeScreen("profileCreation");
            }}
          >
            Back
          </button>
          <Button
            onClick={handleSubmit(onSubmit)}
            className="ml-auto px-10 py-3"
            title="Next"
            type="submit"
            loading={loading}
          />
        </div>
      </form>
    </div>
  );
};

export default VerifyEmail;
