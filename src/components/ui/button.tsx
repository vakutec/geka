import * as React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "secondary";
};

export const Button = React.forwardRef<HTMLButtonElement, Props>(
  ({ variant = "default", className = "", style, ...rest }, ref) => {
    const base: React.CSSProperties = {
      borderRadius: 12,
      padding: "10px 14px",
      fontSize: 14,
      cursor: "pointer",
      border: "1px solid #cbd5e1",
      background: "#0ea5e9",
      color: "#fff",
    };
    if (variant === "outline") {
      base.background = "#fff";
      base.color = "#0f172a";
    }
    if (variant === "secondary") {
      base.background = "#e2e8f0";
      base.color = "#0f172a";
    }
    return (
      <button ref={ref} className={className} style={{ ...base, ...style }} {...rest} />
    );
  }
);
Button.displayName = "Button";
export default Button;
