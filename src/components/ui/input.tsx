import * as React from "react";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", style, ...rest }, ref) => {
    return (
      <input
        ref={ref}
        className={className}
        style={{
          border: "1px solid #cbd5e1",
          borderRadius: 12,
          padding: "10px 12px",
          fontSize: 14,
          ...style,
        }}
        {...rest}
      />
    );
  }
);
Input.displayName = "Input";
export default Input;
