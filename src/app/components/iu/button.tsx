// components/ui/button.tsx
import { FC } from "react";

interface ButtonProps {
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

const Button: FC<ButtonProps> = ({ onClick, className, children }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md text-white font-semibold transition-all ${className}`}
    >
      {children}
    </button>
  );
};

export { Button };
