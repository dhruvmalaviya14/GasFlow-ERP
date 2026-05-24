import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function BillPDF() {
  const { id } = useParams();
  const [bill, setBill] = useState(null);

  useEffect(() => {
    async function fetchBill() {
      try {
        const res = await axios.get(`http://127.0.0.1:5000/api/bill/${id}`);
        setBill(res.data);
      } catch (err) {
        console.error(err);
        alert("Error loading bill data");
      }
    }

    fetchBill();
  }, [id]);

  const downloadPDF = () => {
    window.open(`http://127.0.0.1:5000/api/bill/download/${id}`, "_blank");
  };

  if (!bill) {
    return <p className="text-center text-gray-500 text-lg">Loading bill...</p>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">
        Bill Summary — {bill.hotel}
      </h1>

      {/* Bill Details */}
      <div className="space-y-3 text-lg text-gray-700 dark:text-gray-300">
        
        <p><b>Hotel Name:</b> {bill.hotel}</p>
        <p><b>Rate Per Bottle:</b> ₹{bill.rate}</p>
        <p><b>Total Bottles Supplied:</b> {bill.total_bottles}</p>

        <hr className="my-4" />

        <p className="text-xl">
          <b>Total Amount:</b> ₹{bill.total_amount}
        </p>

        <p className="text-xl">
          <b>Paid:</b>{" "}
          <span className="text-green-600 font-semibold">₹{bill.paid}</span>
        </p>

        <p className="text-xl">
          <b>Pending:</b>{" "}
          <span
            className={bill.pending === 0 ? "text-green-600" : "text-red-600"}
          >
            ₹{bill.pending}
          </span>
        </p>

        <p className="text-lg mt-2">
          <b>Status:</b>{" "}
          <span
            className={
              bill.pending === 0
                ? "px-3 py-1 bg-green-200 text-green-800 rounded-lg"
                : "px-3 py-1 bg-red-200 text-red-800 rounded-lg"
            }
          >
            {bill.status.toUpperCase()}
          </span>
        </p>

      </div>

      {/* Download Button */}
      <button
        onClick={downloadPDF}
        className="mt-8 w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-lg text-lg hover:opacity-90 transition"
      >
        Download PDF Bill
      </button>

    </div>
  );
}
