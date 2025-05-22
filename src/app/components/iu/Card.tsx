// components/ui/card.tsx
import { FC } from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: FC<CardProps> = ({ children, className }) => {
  return (
    <div className={`bg-white shadow-lg rounded-lg p-4 ${className}`}>
      {children}
    </div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
}

const CardContent: FC<CardContentProps> = ({ children }) => {
  return <div className="p-4">{children}</div>;
};

export { Card, CardContent };
