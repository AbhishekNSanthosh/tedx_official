import { connectToDB } from "@utils/database";
import Booking from "@models/Booking";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  try {
    // Ensure connection to the database
    await connectToDB();
  } catch (err) {
    console.error("Database connection error:", err);
    return NextResponse.json(
      { message: "Error connecting to the database" },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  try {
    // Parse request body to get the sort order
    const body = await req.json();
    const sortOrder = body.sortOrder || "asc"; // Default sort order is ascending

    // Aggregation pipeline to get only checked-in members
    const tickets = await Booking.aggregate([
      {
        $match: {
          "group.checkedIn": true, // Filter only checked-in members
        },
      },
      {
        $project: {
          userId: 1, // Return relevant fields
          amount: 1,
          NGOTickets: 1,
          group: {
            $filter: {
              input: "$group",
              as: "member",
              cond: { $eq: ["$$member.checkedIn", true] }, // Return only checked-in members
            },
          },
        },
      },
      {
        $sort: {
          "group.ticketId": sortOrder === "asc" ? 1 : -1, // Sort based on ticket ID and the sortOrder
        },
      },
    ]);

    console.log("Checked-in list =>", tickets);

    // If no tickets found, return an empty array
    if (!tickets.length) {
      return NextResponse.json([], {
        status: 200,
        headers: { 'Cache-Control': 'no-store' } // Disable caching
      });
    }

    // Successful response with checked-in tickets
    return NextResponse.json(tickets, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store', // Disable caching
      },
    });
  } catch (err) {
    console.error("Error retrieving users:", err);
    return NextResponse.json(
      { message: "Error retrieving users" },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
};
