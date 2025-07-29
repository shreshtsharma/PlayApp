import React from "react";

const PrimaryButton = ({
  children,
  onClick,
  type = "button",
  className = "",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`bg-purple-500 text-black font-semibold px-4 py-2 shadow-[4px_4px_0_#3f3f46] ${className}`}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;
