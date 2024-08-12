import React from "react";

interface RightSideProps {
  activeTab: "individual" | "group";
  subtotal: number;
  discount: number;
  total: number;
  isChecked: boolean;
  setIsChecked: React.Dispatch<React.SetStateAction<boolean>>;
  onBuy: () => Promise<void>; // Add the onBuy prop
}

const RightSide: React.FC<RightSideProps> = ({
  activeTab,
  subtotal,
  discount,
  total,
  isChecked,
  setIsChecked,
  onBuy,
}) => {
  return (
    <div className="flex-1 p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">
        {activeTab === "individual" ? "Individual Ticket" : "Group Ticket"}
      </h3>
      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span>Subtotal:</span>
          <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-500">
            <span>Discount:</span>
            <span className="font-semibold">-₹{discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold">
          <span>Total:</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
      </div>
      <div className="flex flex-col mt-6 gap-4">
        <div className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
            className="form-checkbox"
          />
          <label htmlFor="terms">I agree to the terms and conditions</label>
        </div>
        <button
          onClick={onBuy} // Use the onBuy function here
          disabled={!isChecked}
          className={`py-2 px-4 rounded-md font-semibold ${
            isChecked
              ? "bg-primary-700 text-white hover:bg-primary-800"
              : "bg-gray-400 cursor-not-allowed text-gray-700"
          } transition-colors`}
        >
          Checkout
        </button>
      </div>
    </div>
  );
};

export default RightSide;
