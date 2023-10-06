import React from "react";
import VerticalTabMenu from "../VerticalTabMenu";


const labels: String[] = [];
export default function Settings() {
  return (
    <VerticalTabMenu title="Settings" labels={labels}>
    </VerticalTabMenu>
  );
}
