import * as React from "react";

export function Badge({ className = "", style, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={className}
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 999,
        background: "#e2e8f0",
        color: "#0f172a",
        fontSize: 12,
        ...style,
      }}
      {...props}
    />
  );
}

export default Badge;
