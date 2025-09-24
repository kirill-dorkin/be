import React, { ReactNode } from 'react';

interface BaseContainerProps {
  children: ReactNode;
  className?: string;
}

const BaseContainer: React.FC<BaseContainerProps> = ({
  children,
  className = "",
}) => {
  return (
    <section
      className={`mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8 lg:px-10 ${className}`}
    >
      {children}
    </section>
  );
};

export default BaseContainer;
