import React from "react";

const ArrowLeft = ({ stroke = "currentColor" }: { stroke?: string }) => (
  <>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20px"
      fill="none"
      viewBox="0 0 24 24"
      stroke={stroke}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 19l-7-7m0 0l7-7m-7 7h18"
      />
    </svg>
  </>
);
export default ArrowLeft;
