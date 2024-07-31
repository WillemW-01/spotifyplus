import React from "react";
import ContentLoader, { Rect } from "react-content-loader/native";

import { Colors } from "@/constants/Colors";

export default function LoaderCard() {
  return (
    <ContentLoader speed={1} height={130} width={90} foregroundColor={Colors.light.grey}>
      <Rect x="0" y="0" rx="12" ry="12" width="90" height="90" />
      <Rect x="5" y="100" rx="2" ry="2" width="80" height="10" />
    </ContentLoader>
  );
}
