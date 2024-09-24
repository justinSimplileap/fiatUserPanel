import React, { useState, type ReactNode } from "react";
import { Button, type ButtonProps } from "@mui/material";
import LoaderIcon from "./LoaderIcon";

type MouseButtonEvent = React.MouseEvent<HTMLButtonElement>;
interface MuiButtonProps extends Omit<ButtonProps, "color"> {
  name: string;
  onClick?: ((event?: MouseButtonEvent) => Promise<void> | void) | undefined;
  width?: string;
  background?: string;
  color?: string;
  padding?: string;
  children?: ReactNode;
  borderRadius?: string;
  loading?: boolean;
  useLoading?: boolean;
  borderColor?: string;
  className?: string;
}

const MuiButton: React.FC<MuiButtonProps> = ({
  name,
  onClick,
  width,
  background,
  color,
  padding,
  children,
  borderRadius,
  borderColor,
  className,
  useLoading = false,
  loading = false,
  ...props
}) => {
  const [isLoading, setLoading] = useState(false);

  const _onClick = async () => {
    if (onClick) {
      setLoading(true);
      await onClick();
      setLoading(false);
    }
  };
  return (
    <Button
      {...props}
      sx={{
        textTransform: "none",
        width: width,
        background: `${background ? background : "#C1922E"} !important`,
        color: color ? color : "#FFFFFF",
        border: `2px solid ${borderColor ? borderColor : "#C1922E"} !important`,
        padding: padding ? padding : "0.4rem 1rem",
        borderRadius: borderRadius ? borderRadius : "0.6rem",
      }}
      className={`!font-['Segoe UI'] active:scale-95 ${className}`}
      onClick={useLoading ? _onClick : onClick}
    >
      {loading || isLoading ? <LoaderIcon className="mr-4 h-4 w-4" /> : null}
      {name}
      {children}
    </Button>
  );
};

export default MuiButton;
