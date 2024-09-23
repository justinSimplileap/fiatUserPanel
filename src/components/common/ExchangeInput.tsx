import { useState, type FC } from "react";
import { Controller } from "react-hook-form";
import { FiEye, FiEyeOff } from "react-icons/fi";

interface InputProps {
  name: string;
  label: any;
  control: any;
  type: "text" | "number" | "email" | "password" | "date" | "checkbox";
  rules?: {
    required?: string;
    validate?: any;
  };
  placeholder?: string;
  max?: any;
}

const ExchangeInput: FC<InputProps> = ({
  name,
  label,
  control,
  rules,
  type,
  max,
  placeholder,
}) => {
  const [eye, setEye] = useState(false);
  const toggleBtn = () => {
    setEye((prevState) => !prevState);
  };
  return (
    <div className="mb-4 mt-3">
      {type !== "checkbox" && (
        <label htmlFor="firstName" className="mb-1 block ">
          {label}
          {rules?.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState: { error } }) => (
          <div className="relative">
            <input
              max={max}
              type={eye ? "text" : type}
              id={name}
              className={` rounded-md px-4 py-2  placeholder:text-sm placeholder:font-normal ${
                type === "checkbox"
                  ? ""
                  : "w-full outline  outline-1 outline-[#c4c4c4]"
              }`}
              {...field}
              value={field.value || ""}
              placeholder={placeholder}
            />
            {type === "password" && (
              <div className="absolute right-5 top-[12px]" onClick={toggleBtn}>
                {eye ? (
                  <FiEyeOff size={15} className="text-[#666666]" />
                ) : (
                  <FiEye size={15} className="text-[#666666]" />
                )}
              </div>
            )}
            <p className="text-xs text-red-500">{error?.message}</p>
          </div>
        )}
      />
    </div>
  );
};

export default ExchangeInput;
