import React from "react";
import AffiliateLink from "./AffiliateLink";

import AffiliateCommissions from "./AffiliateCommissions";

const Affiliate = ({ activeSubSection }) => {
  const renderComponent = () => {
    switch (activeSubSection) {
      case "affiliate-link":
        return <AffiliateLink />;

      case "affiliate-commissions":
        return <AffiliateCommissions />;
      default:
        return <AffiliateLink />;
    }
  };

  return <div className="w-full">{renderComponent()}</div>;
};

export default Affiliate;
