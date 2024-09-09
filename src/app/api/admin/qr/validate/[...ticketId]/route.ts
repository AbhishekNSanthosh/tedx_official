import Booking from "@models/Booking";
import { connectToDB } from "@utils/database";
import { ObjectId } from 'mongodb';

interface Params {
  ticketId: string[]; // Define ticketId as an array of strings
}

export const GET = async (request: Request, { params }: { params: Params }) => {
  const ticketIdTemp = params.ticketId; // ticketId is now an array

  // Combine the array elements into a   single string, separated by "/"
  let final = ticketIdTemp.join("/");

  // Ensure that final has the correct length or format
  const ticketId = final.slice(0, final.length); // Remove any trailing slash if needed
  try {
    // Connect to the database
    await connectToDB();

    // Validate if `final` is a valid ObjectId
    // if (!ObjectId.isValid(ticketId)) {
    //   return new Response(JSON.stringify({ message: "Invalid Ticket ID format" }), { status: 400 });
    // }



    const ticket = await Booking.findOne({
      group: { $elemMatch: { ticketId } },
    }).exec();

    if (!ticket) {
      return new Response(JSON.stringify({ message: "Ticket not found" }), { status: 404 });
    }
    let groupMember = ticket?.group[0];

    // Check if the group member exists
    if (!groupMember) {
      return new Response(JSON.stringify({ message: "Ticket not found in group" }), { status: 404 });
    }
    const amount = ticket.amount / 100;
    return new Response(JSON.stringify({ groupMember, amount,ticket }), { status: 200 });

  } catch (err) {
    // Handle any errors
    console.error("Database query error:", err);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
};
