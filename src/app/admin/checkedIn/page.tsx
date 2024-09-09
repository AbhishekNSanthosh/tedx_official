"use client";
import { useEffect, useState, ChangeEvent } from "react";
import { ScaleLoader } from "react-spinners"; // Spinner for loading state

interface Member {
  firstName: string;
  lastName: string;
  email: string;
  organisation: string;
  designation: string;
  food: string;
  checkedIn: boolean;
  isStudent: boolean;
  ticketId: string;
}

interface Booking {
  userId: string;
  amount: number;
  NGOTickets: boolean;
  count: number;
  group: Member[];
}

const Page = () => {
  const [checkedInUsers, setCheckedInUsers] = useState<Booking[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Booking[]>([]);
  const [totalBookings, setTotalBookings] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"Ascending" | "Descending">(
    "Descending"
  );
  const [loading, setLoading] = useState<boolean>(true); // Loading state

  useEffect(() => {
    fetchCheckedIn();
  }, []);

  useEffect(() => {
    const filtered = checkedInUsers.filter((booking) =>
      booking.group.some(
        (member) =>
          member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.ticketId
            .slice(14, member.ticketId.length) // Extracting relevant part of ticket ID
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      )
    );

    // Sort the filtered users
    const sorted = filtered.sort((a, b) => {
      const aTicketId = a.group[0].ticketId;
      const bTicketId = b.group[0].ticketId;
      return sortOrder === "Ascending"
        ? aTicketId.localeCompare(bTicketId)
        : bTicketId.localeCompare(aTicketId);
    });

    setFilteredUsers(sorted);
  }, [searchTerm, sortOrder, checkedInUsers]);

  const fetchCheckedIn = async () => {
    setLoading(true); // Set loading to true before fetching
    try {
      const response = await fetch("/api/admin/purchased-list/checkIn/fetch", {
        method: "POST", // Changed to POST method
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sortOrder: sortOrder === "Ascending" ? "asc" : "desc", // Send sort order
        }),
      });
      const data: Booking[] = await response.json();

      setCheckedInUsers(data);
      setFilteredUsers(data);

      // Calculate total count
      setTotalBookings(data.length);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value as "Ascending" | "Descending");
  };

  return (
    <div className="bg-black-100 min-h-screen block p-8 text-white">
      {/* Header with stats */}
      <div className="flex justify-center mb-8">
        <div className="bg-gradient-to-r from-red-500 to-red-800 p-6 rounded-lg text-center shadow-lg w-full max-w-xs">
          <h3 className="text-2xl font-extrabold">Total Check In</h3>
          <p className="text-4xl font-extrabold mt-2">{totalBookings}</p>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="flex mb-4 justify-center">
        <input
          type="text"
          placeholder="Search by name, email, or ticket ID..."
          className="p-3 rounded-lg placeholder-gray-400 bg-gray-800 text-white w-1/2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-600"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <select
          className="ml-4 p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-600"
          value={sortOrder}
          onChange={handleSortChange}
        >
          <option value="Descending">Sort: Descending</option>
          <option value="Ascending">Sort: Ascending</option>
        </select>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center mt-16">
          <ScaleLoader color="#eb0028" /> {/* Show a spinner while loading */}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center text-xl text-gray-400 mt-16">
          No checked-in users found.
        </div>
      ) : (
        /* Bookings List */
        <div>
          <h3 className="text-3xl font-bold mb-4 text-center">Check-In List</h3>
          {filteredUsers.map((booking, index) => (
            <div
              key={index}
              className="bg-black-200 p-6 rounded-lg mb-4 shadow-md"
            >
              <h3 className="font-bold text-lg">Booking ID: {booking.userId}</h3>
              <p className="text-sm text-gray-400">
                <strong>Total Tickets:</strong> {booking.count}
              </p>
              <p className="text-sm text-gray-400">
                <strong>NGO Tickets:</strong> {booking.NGOTickets ? "Yes" : "No"}
              </p>

              <h4 className="mt-4 text-xl font-bold">Group Members:</h4>
              {booking.group.map((member, idx) => (
                <div
                  key={idx}
                  className="bg-gray-900 p-4 rounded-lg mt-2 shadow-inner"
                >
                  <p className="text-gray-300">
                    <strong>Name:</strong> {member.firstName} {member.lastName}
                  </p>
                  <p className="text-gray-300">
                    <strong>Email:</strong> {member.email}
                  </p>
                  <p className="text-gray-300">
                    <strong>Organisation:</strong> {member.organisation}
                  </p>
                  <p className="text-gray-300">
                    <strong>Designation:</strong> {member.designation}
                  </p>
                  <p className="text-gray-300">
                    <strong>Food preference:</strong> {member.food}
                  </p>
                  <p className="text-gray-300">
                    <strong>Checked In:</strong>{" "}
                    {member.checkedIn ? "Yes" : "No"}
                  </p>
                  <p className="text-gray-300">
                    <strong>Student:</strong> {member.isStudent ? "Yes" : "No"}
                  </p>
                  <p className="text-gray-300">
                    <strong>Ticket ID:</strong> {member.ticketId}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;
