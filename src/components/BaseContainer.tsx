import React, { ReactNode } from 'react';

interface BaseContainerProps {
  children: ReactNode;
  className?: string;
}

const BaseContainer: React.FC<BaseContainerProps> = ({ children, className }) => {
  return (
    <section className={`container px-10 ${className}`}>
      {children}
    </section>
  );
};

export default BaseContainer;
