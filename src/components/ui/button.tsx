import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base = "font-semibold py-2 px-4 rounded transition-colors disabled:opacity-50";
  const variants = {
    primary: "bg-gold text-obsidian hover:bg-yellow-500",
    outline: "border border-gray-600 text-white hover:border-gold",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
