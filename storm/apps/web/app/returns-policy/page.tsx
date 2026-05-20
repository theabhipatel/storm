import type { Metadata } from "next";

import {
  PlaceholderNotice,
  StaticPage,
} from "../../components/domain/StaticPage";

export const metadata: Metadata = {
  title: "Returns Policy — Storm",
};

export default function ReturnsPolicyPage() {
  return (
    <StaticPage title="Returns Policy">
      <PlaceholderNotice>
        Returns will be available in an upcoming release. For any issue with
        your order, please reach support@storm.example and we will do our best
        to help.
      </PlaceholderNotice>
    </StaticPage>
  );
}
