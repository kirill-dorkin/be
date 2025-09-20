import React from "react";
import DashboardSummaryItem from "./DashboardSummaryItem";

interface IDashboardSummary {
  label: string;
  value: number;
  icon: JSX.Element;
}

const DashboardSummary = ({
  data
}: {
  data: IDashboardSummary[]
}) => {
  return (
    <ul className="col-span-full grid grid-cols-responsive gap-6">
      {data.map((item, index) => (
        <DashboardSummaryItem key={index} item={item} />
      ))}
    </ul>
  );
};

export default DashboardSummary;

