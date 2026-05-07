import React from "react";
import ExportPDFLengkapComponent from "../components/ManagementFinancial/ExportPDFLengkap/ExportPDFLengkap";

const ExportPDFLengkap = ({ activeSubSection, setActiveSubSection }) => {
  return (
    <div className="export-pdf-lengkap-page p-6">
      <ExportPDFLengkapComponent />
    </div>
  );
};

export default ExportPDFLengkap;
