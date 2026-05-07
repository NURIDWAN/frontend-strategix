import React from "react";
import Affiliate from "../components/Affiliate/Affiliate";

const AffiliatePage = ({ activeSubSection, setActiveSubSection }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <Affiliate activeSubSection={activeSubSection} />
      </div>
    </div>
  );
};

export default AffiliatePage;
