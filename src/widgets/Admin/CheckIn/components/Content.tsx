"use client";
import showTedxToast from "@components/showTedxToast";
import TedxToast from "@components/TedxToast";
import TitleBar from "@components/TitleBar";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ScaleLoader } from "react-spinners";

interface GroupMember {
  firstName: string;
  lastName: string;
  ticketId: string;
  checkedIn: boolean;
  [key: string]: any; // Additional fields, if any
}

interface TicketData {
  ticket: {
    NGOTickets: boolean;
  };
  amount: number;
  groupMember: GroupMember;
}

export default function Content() {
  const pathname = usePathname();
  const ticketId = pathname.slice(16);
  const [checked, setChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [data, setData] = useState<TicketData | null>(null); // Define state with a type
  const [loading, setLoading] = useState<boolean>(true); // Loader state
  const router = useRouter();
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true); // Show loader before fetching data
      const response = await fetch(`/api/admin/qr/validate/${ticketId}`);
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false); // Hide loader after data is fetched
    }
  };

  const handleCheckIn = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/qr/checkIn/${ticketId}`);
      if (response.ok) {
        setChecked(true);
        setData((prevData) => {
          if (!prevData) return null; // Handle case where prevData is null

          return {
            ...prevData, // Spread the previous state
            groupMember: {
              ...prevData.groupMember, // Spread the existing groupMember properties
              checkedIn: true, // Update the checkedIn property
            },
          };
        });

        showTedxToast({
          type: "success",
          message: "Successfully checked in",
        });
        setTimeout(() => {
          router.push("/admin/checkedIn");
        }, 500);
      } else {
        showTedxToast({
          type: "error",
          message: "Failed to check in",
        });
        console.error("Failed to check in");
      }
    } catch (err) {
      console.error("Error checking in:", err);
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="w-full h-full items-center justify-center flex">
        <ScaleLoader color="#eb0028" />
      </div>
    );
  }

  return (
    <div className="w-full h-full items-center justify-center flex">
      {data ? (
        <div className="flex flex-col items-center justify-center bg-black-100 p-5 bg-black rounded-[10px]">
          <div className="w-full max-w-xl p-6 bg-black rounded-lg shadow-md">
            <TitleBar title="User" titleSecond="Check-In" />
            <p className="text-lg text-white mb-2 pt-6">
              <span className="font-semibold">Name: </span>
              {`${data.groupMember.firstName} ${data.groupMember.lastName}`}
            </p>
            <p className="text-lg text-white mb-4">
              <span className="font-semibold">Designation: </span>
              {data.groupMember.designation}
            </p>
            <p className="text-lg text-white mb-4">
              <span className="font-semibold">Email: </span>
              {data.groupMember.email}
            </p>
            <p className="text-lg text-white mb-4">
              <span className="font-semibold">Organisation: </span>
              {data.groupMember.organisation}
            </p>
            <p className="text-lg text-white mb-4">
              <span className="font-semibold">Is Student: </span>
              {data.groupMember.isStudent ? "Yes" : "No"}
            </p>
            <p className="text-lg text-white mb-4">
              <span className="font-semibold">Is NGO Tickets: </span>
              {data.ticket.NGOTickets ? (
                <span className="ml-2 px-3 py-1 text-xs font-semibold bg-green-800 text-white rounded-full">
                  NGO
                </span>
              ) : (
                "No"
              )}
            </p>
            <p className="text-lg text-white mb-4">
              <span className="font-semibold">Amount: </span>
              {data.amount}
            </p>
            <p className="text-lg text-white mb-4">
              <span className="font-semibold">Ticket Id: </span>
              <span className="font-sans"> {data.groupMember.ticketId}</span>
            </p>
            <p className="text-lg text-white mb-4">
              <span className="font-semibold">CheckedIn: </span>
              {data.groupMember.checkedIn ? "Yes" : "No"}
            </p>
            {!checked ? (
              <button
                onClick={handleCheckIn}
                disabled={isSubmitting}
                className={`w-full py-2 px-4 ${
                  isSubmitting ? "bg-gray-600" : "bg-[#eb0028]"
                } text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-[#eb0028] focus:ring-offset-2`}
              >
                {isSubmitting ? "Submitting..." : "Check In"}
              </button>
            ) : (
              <button
                onClick={handleCheckIn}
                disabled={isSubmitting}
                className={`w-full py-2 px-4 bg-green-500 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2`}
              >
                Checked In
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-white">No data found</p>
        </div>
      )}
    </div>
  );
}
