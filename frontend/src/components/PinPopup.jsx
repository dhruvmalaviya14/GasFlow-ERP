import { useState } from "react";
import axios from "axios";

export default function PinPopup({ onVerify, onClose }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const verifyPin = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:5000/api/verify-pin", {
        pin,
      });

      if (res.data.success) {
        if (onVerify) onVerify(); 
      } else {
        setError("Incorrect PIN");
      }
    } catch (err) {
      console.error(err);
      setError("Server error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl shadow-xl w-80">
        <h2 className="text-xl font-bold mb-3 text-center">Enter PIN</h2>

        <input
          type="password"
          className="w-full p-3 border rounded-lg mb-3 bg-gray-100"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />

        {error && <p className="text-red-500 text-center mb-2">{error}</p>}

        <button
          className="w-full bg-blue-600 text-white py-2 rounded-lg"
          onClick={verifyPin}
        >
          Verify
        </button>

        <button
          className="w-full mt-2 bg-gray-400 text-white py-2 rounded-lg"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
