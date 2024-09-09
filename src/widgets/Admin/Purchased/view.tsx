"use client";
import React, { useEffect, useState } from "react";
import { IoMdDownload } from "react-icons/io";
import { FaEnvelope } from "react-icons/fa"; // Import mail icon
import { CSVLink } from "react-csv"; // Import CSV link for download
import showTedxToast from "@components/showTedxToast";
import { ScaleLoader } from "react-spinners";
import { useRouter } from "next/navigation";

interface BookingGroup {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  organisation: string;
  designation: string;
  food: "veg" | "non-veg";
  checkedIn: boolean;
  isStudent: boolean;
  isSponsor: boolean;
  NGOTickets: boolean;
  ticketId: string;
}

interface Booking {
  _id: string;
  userId: string;
  orderId: string;
  paymentId: string;
  referal_code?: string;
  count: number;
  amount: number;
  NGOTickets: boolean;
  confirmationMailSent: boolean;
  group: BookingGroup[];
  createdAt: string;
  updatedAt: string;
}

const Purchased: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [ticketStatus, setTicketStatus] = useState<{ ticketSold?: number }[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const router = useRouter();

  const ticketPrices = [75000, 100000, 105000, 50000, 150000, 120000, 0];

  const getTicketCounts = () => {
    const counts: { [key: number]: number } = {};
    let totalCount = 0;

    filteredBookings.forEach((booking) => {
      const pricePerPerson = booking.amount / booking.group.length;
      ticketPrices.forEach((price) => {
        const count = booking.group.filter(
          (person) => pricePerPerson === price
        ).length;

        if (count > 0) {
          counts[price] = (counts[price] || 0) + count;
          totalCount += count;
        }
      });
    });

    return { counts, totalCount };
  };

  const { counts, totalCount } = getTicketCounts();

  const countOrderBookings = () => {
    return filteredBookings.filter(booking => booking.orderId.startsWith("order_"));
  };

  const orderBookings = countOrderBookings();
  const orderBookingsCount = orderBookings.length;
  const totalOrderAmount = orderBookings.reduce((sum, booking) => sum + booking.amount, 0);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/admin/purchased-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
        body: JSON.stringify({ sortOrder }),
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
        setFilteredBookings(data.bookings || []);
        setTicketStatus(data.ticketStatus || []);
      } else {
        const result = await response.json();
        setError(result.message || "Failed to fetch bookings");
      }
    } catch (err) {
      setError("An error occurred while fetching the bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [sortOrder]);

  useEffect(() => {
    if (searchQuery === "") {
      setFilteredBookings(bookings);
    } else {
      const filtered = bookings.filter(
        (booking) =>
          booking.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.group.some(
            (person) =>
              person.firstName
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              person.lastName
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              person.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
              person.ticketId
                .slice(14, person.ticketId.length)
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
          )
      );
      setFilteredBookings(filtered);
    }
  }, [searchQuery, bookings]);

  const totalBookings =
    ticketStatus.length > 0 ? ticketStatus[0]?.ticketSold : 0;
  const totalAmount = filteredBookings.reduce(
    (sum, booking) => sum + booking.amount,
    0
  );

  const formatAmount = (amount: number) => {
    const adjustedAmount = Math.floor(amount / 100);
    return `₹${adjustedAmount.toLocaleString("en-IN")}`;
  };

  const sendMail = async (
    email: string,
    firstName: string,
    lastName: string,
    bookingId: string,
    personId: string
  ) => {
    try {
      const response = await fetch("/api/admin/newTicket/sentMail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          bookingId,
          personId,
        }),
      });
      if (response.ok) {
        showTedxToast({
          type: "success",
          message: "Mail sent Successfully",
        });
      } else {
        showTedxToast({
          type: "error",
          message: "Mail sending failed",
        });
      }
    } catch (error) {
      showTedxToast({
        type: "error",
        message: "An error occurred while sending the mail",
      });
    }
  };

  const checkInPerson = async (personId: string) => {
    try {
      const response = await fetch(`/api/admin/checkin/${personId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        showTedxToast({
          type: "success",
          message: "Checked In Successfully",
        });
        fetchBookings(); // Refresh bookings after check-in
      } else {
        showTedxToast({
          type: "error",
          message: "Check-In failed",
        });
      }
    } catch (error) {
      showTedxToast({
        type: "error",
        message: "An error occurred during check-in",
      });
    }
  };

  const csvData = () => {
    return [
      ["Price", "Count"],
      ...Object.entries(counts).map(([price, count]) => [price, count]),
      ["Total Tickets", totalCount],
    ];
  };

  if (loading) {
    return (
      <div className="w-full h-full items-center justify-center flex">
        <ScaleLoader color="#eb0028" />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-4 bg-black-100 text-white">
      {/* Count and total amount of bookings with order ID starting with "order_" */}
      <div className="mb-6 bg-black-200 text-white rounded-lg shadow-lg p-4">
        <h1 className="text-2xl font-bold mb-4">Bookings Starting with "order_"</h1>
        <p className="text-xl font-semibold">Total Count: {orderBookingsCount}</p>
        <p className="text-xl font-semibold">Total Amount: {formatAmount(totalOrderAmount)}</p>
      </div>

      {/* Ticket status section */}
      <div className="mb-6 bg-black-200 text-white rounded-lg shadow-lg p-4">
        <h1 className="text-2xl font-bold mb-4">Ticket Prices & Counts</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {ticketPrices.map((price) => (
            <div key={price} className="bg-primary-700 p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">Price: ₹{price}</h3>
              <p className="text-3xl font-bold">{counts[price] || 0}</p>
            </div>
          ))}
          <div className="bg-primary-700 p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold">Total Tickets</h3>
            <p className="text-3xl font-bold">{totalCount}</p>
          </div>
        </div>
      </div>

      <div className="mb-6 bg-black-200 text-white rounded-lg shadow-lg p-4">
        <h1 className="text-2xl font-bold mb-4">Total Amount</h1>
        <p className="text-2xl font-bold">{formatAmount(totalAmount)}</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between">
        <div>
          <h3 className="text-xl font-semibold">Total Amount</h3>
          <p className="text-2xl font-bold">{formatAmount(totalAmount)}</p>
        </div>
        <div>
          <CSVLink data={csvData()} filename={"ticket_counts.csv"}>
            <button className="flex items-center bg-primary-700 p-2 rounded-md text-white">
              <IoMdDownload className="mr-2" />
              Download CSV
            </button>
          </CSVLink>
        </div>
      </div>

      {/* Render filtered bookings */}
      <div className="bg-black-200 text-white rounded-lg shadow-lg p-4">
        <h1 className="text-2xl font-bold mb-4">Bookings List</h1>
        {filteredBookings.length > 0 ? (
          <ul>
            {filteredBookings.map((booking) => (
              <li key={booking._id} className="mb-4">
                <h2 className="text-xl font-semibold">Order ID: {booking.orderId}</h2>
                <p>User ID: {booking.userId}</p>
                <p>Amount: {formatAmount(booking.amount)}</p>
                {booking.group.map((person) => (
                  <div key={person._id} className="bg-black-300 p-2 rounded-md my-2">
                    <h3 className="text-lg font-semibold">
                      {person.firstName} {person.lastName}
                    </h3>
                    <p>Email: {person.email}</p>
                    <p>Ticket ID: {person.ticketId}</p>
                    <button
                      onClick={() =>
                        sendMail(
                          person.email,
                          person.firstName,
                          person.lastName,
                          booking._id,
                          person._id
                        )
                      }
                      className="flex items-center bg-primary-700 p-2 rounded-md text-white mt-2"
                    >
                      <FaEnvelope className="mr-2" />
                      Send Mail
                    </button>
                    {!person.checkedIn && (
                      <button
                        onClick={() => checkInPerson(person._id)}
                        className="flex items-center bg-primary-700 p-2 rounded-md text-white mt-2"
                      >
                        Check In
                      </button>
                    )}
                  </div>
                ))}
              </li>
            ))}
          </ul>
        ) : (
          <p>No bookings found.</p>
        )}
      </div>
    </div>
  );
};

export default Purchased;
