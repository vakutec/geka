import * as React from "react";

export function Card({ className = "", style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={className}
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        background: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,.06)",
        ...style,
      }}
      {...props}
    />
  );
}

export function CardContent({ className = "", style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} style={{ padding: 16, ...style }} {...props} />
  );
}

export default Card;
