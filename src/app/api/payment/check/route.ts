import Booking from "@models/Booking";
import { connectToDB } from "@utils/database";
import Razorpay from "razorpay";
import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";
import Ticket from "@models/Ticket";
import { customAlphabet } from 'nanoid';
import User from "@models/User";

interface GroupMember {
  firstName: string;
  lastName: string;
  organisation: string;
  isStudent: boolean | false;
  email: string;
  referal_code?: string;
  ticketId?: string;
}

interface RequestBody {
  userId: string;
  count: number;
  isStudent?: boolean;
  referal_code?: string;
  paymentId: string;
  orderId: string;
  group: GroupMember[];
}

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const POST = async (request: NextRequest): Promise<NextResponse> => {

  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const generateId = customAlphabet(alphabet, 9);
  try {
    const { userId, count, isStudent, referal_code, paymentId, orderId, group }: RequestBody = await request.json();
    console.log(isStudent)
    const razorpay = new Razorpay({
      key_id: process.env.RAZOR_KEY_ID as string,
      key_secret: process.env.RAZOR_KEY_SECRET as string,
    });

    const paymentData = await razorpay.orders.fetch(orderId);

    if (
      paymentData.amount === paymentData.amount_paid &&
      paymentData.status === "paid"
    ) {
      await connectToDB();

      const refreredUser = await User.findOne({ referal_code: referal_code });
      if (refreredUser) {
        refreredUser.referals.push(userId);
        refreredUser.wallet += 80;
        await refreredUser.save();
      }

      const currentUser = await User.findOne({ _id: userId });
      currentUser.isStudent = isStudent;
      if (currentUser.referal_code === "") {
        console.log(currentUser)
        const referal_code = generateId();
        currentUser.isBought = true;
        currentUser.referal_code = referal_code;
      }
      await currentUser.save();

      const ticket = await Ticket.findOne({ _id: "66bcdf73381f6901e8ed2532" });
      group.forEach((groupMember) => {
        ticket.ticketSold = ticket?.ticketSold + 1;
        ticket.ticketRemaning = ticket?.ticketRemaning - 1;
        groupMember.ticketId = `TEDXCCET/2024/${("00" + ticket.ticketSold).slice(-3)}`
      })
      // Set isStudent for each group member
      group.forEach(member => {
        member.isStudent = isStudent ?? false;
      });

      const amount = paymentData.amount_paid;
      const newBooking = new Booking({
        userId,
        orderId,
        paymentId,
        referal_code,
        isStudent,
        count,
        confirmationMailSent:true,
        amount,
        group,
      });
      await newBooking.save();
      await ticket.save();

      // Send individual ticket confirmation emails
      for (const data of group) {
        const mailOptions = {
          from: process.env.EMAIL,
          to: data?.email,
          subject: "Your TEDxCCET Ticket Confirmation",
          html: `
    <html>
    <head>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          background-color: #000000;
          color: #ffffff;
        }
        .container {
          width: 100%;
          max-width: 700px;
          display:flex;
          align-items:center;
          justify-content:center;
          margin: auto;
          background-image: url('https://firebasestorage.googleapis.com/v0/b/tedxccet.appspot.com/o/assets%2FWhatsApp%20Image%202024-08-17%20at%2007.35.16.jpeg?alt=media&token=8fc04ca9-dce3-4f01-97b7-c015b5074743');
          background-size: cover;
          background-position: center;
          border-radius: 10px;
          overflow: hidden;
          padding: 20px 2;
        }
        .wrap {
          width: 100%;
          max-width: 600px;
          margin: auto;
          background-color: rgba(0, 0, 0, 0.8); /* Semi-transparent black background */
          padding: 20px;
          text-align: center;
          border-radius: 10px;
        }
        .header {
          background-image: url('https://firebasestorage.googleapis.com/v0/b/tedxccet.appspot.com/o/assets%2FWhatsApp%20Image%202024-08-17%20at%2007.41.38.jpeg?alt=media&token=7a3519c0-690c-47c8-b686-7d972bf82534'); /* Header background image */
          background-size: cover;
          background-position: center;
          padding: 30px 20px;
          border-radius: 10px;
          text-align: center;
          color: #ffffff;
        }

        .name{
         text-transform:capitalize;
        }
        .header h1 {
          font-size: 24px;
          font-weight: bold;
          margin: 0;
          color: #ffffff;
        }
        .header p {
          font-family: 'Brush Script MT', cursive;
          font-size: 36px;
          margin: 10px 0 0;
        }
        .content {
          padding: 20px;
        }
        .content h2 {
          color: #eb0028;
          margin-top: 0;
        }
        .content p {
          margin: 0 0 15px;
          color:#fff;
          line-height: 1.6;
        }
        .content .tedx-text {
          font-weight: bold;
          color: #eb0028; /* TEDx in red */
        }
        .content .ccet-text {
          font-weight: bold;
          color: #ffffff; /* CCET in white */
        }
        .social-links {
          text-align: center;
          margin: 20px 0;
        }
        .social-links a {
          margin: 0 10px;
          text-decoration: none;
          color: #ffffff;
          font-weight: bold;
        }
        .social-links a:hover {
          text-decoration: underline;
        }
        .footer {
          background-color: #000000;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #333333;
          border-radius: 10px;
        }
        .footer a {
          color: #eb0028;
          text-decoration: none;
          margin: 0 10px;
        }
        .footer p {
          margin: 5px 0;
          color:#fff;
        }
        .red {
          color: #eb0028;
        }

        @media (max-width: 600px) {
          .header h1 {
            font-size: 20px;
          }
          .header p {
            font-size: 28px;
          }
          .content h2 {
            font-size: 20px;
          }
          .content p {
            font-size: 14px;
          }
          .social-links a {
            display: block;
            margin: 10px 0;
          }
          .links{
          font-size:12px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="wrap">
          <div class="header">
            <h1><b><span class="tedx-text red">TEDx</span><span class="ccet-text">CCET</span></b></h1>
            <p>Your Ticket Confirmation</p>
          </div>
          <div class="content">
            <h2 class="name">Dear ${data?.firstName} ${data?.lastName},</h2>
            <p>Thank you for registering and completing your payment for <b><span class="tedx-text">TEDx</span><span class="ccet-text">CCET</span></b>. We're thrilled to have you join us for this exciting event!</p>
            <p>You can find your event tickets and additional details in your profile on our registration platform. Simply log in to your account and navigate to the "My Tickets" section to access and download your tickets.</p>
            <p>Should you have any questions or require further assistance, please do not hesitate to reach out to us at <a href="mailto:tedxsupport@carmelcet.in" style="color: #eb0028;">tedxsupport@carmelcet.in</a>.</p>
            <p>We look forward to welcoming you to <b><span class="tedx-text">TEDx</span><span class="ccet-text">CCET</span></b>!</p>
          </div>
          <div class="social-links">
            <a href="https://www.facebook.com/people/TEDx-CCET/61563436965963/" target="_blank">Facebook</a>
            <a href="https://linkedin.com/in/tedxccet/" target="_blank">LinkedIn</a>
            <a href="https://instagram.com/tedxccet" target="_blank">Instagram</a>
          </div>
          <div class="footer">
            <p>For support, contact us at <a href="mailto:tedxsupport@carmelcet.in">tedxsupport@carmelcet.in</a> or via WhatsApp: <a href="https://wa.me/917907247909" style="color: #eb0028;">+91 79072 47909</a></p>
            <p>Visit our website: <a href="https://www.tedxccet.in" target="_blank">www.tedxccet.in</a></p>
            <p class="links"><a href="#">Terms and Conditions</a> | <a href="#">Privacy Policy</a> | <a href="#">Refund Policy</a></p>
            <p>© Copyright 2024 | Crafted by TEDxCCET</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,
        };


        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email:", error);
            return new NextResponse(
              JSON.stringify({
                message: "Failed to send Ticket email",
                desc: "There was an error sending the Booking email. Please try again later or contact support.",
              }),
              { status: 500 }
            );
          }
        });
      }

      // Send summary email to Abhishek
      const summaryMailOptions = {
        from: process.env.EMAIL,
        to: "abhisheksanthoshofficial19@gmail.com",
        subject: "TEDxCCET Ticket Purchase Summary",
        html: `
          <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
              }
              .container {
                width: 100%;
                max-width: 800px;
                margin: auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                padding: 20px;
              }
              .header {
                background-color: #eb0028;
                color: #ffffff;
                padding: 20px;
                text-align: center;
                border-bottom: 5px solid #000000;
              }
              .header h1 {
                font-size: 28px;
                margin: 0;
                font-weight: bold;
              }
              .content {
                padding: 20px;
              }
              .content p {
                margin: 10px 0;
                font-size: 16px;
              }
              .content strong {
                color: #eb0028;
              }
              .footer {
                text-align: center;
                padding: 15px;
                background-color: #eb0028;
                color: #ffffff;
                border-top: 1px solid #cccccc;
              }
              .footer p {
                margin: 5px 0;
              }
              .footer a {
                color: #ffffff;
                text-decoration: none;
                font-weight: bold;
              }
              .footer a:hover {
                text-decoration: underline;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>TEDxCCET Ticket Purchase Summary</h1>
              </div>
              <div class="content">
                <p><strong>User:</strong> ${group.map(member => `${member.firstName} ${member.lastName}`).join(', ')}</p>
                <p><strong>User ID:</strong> ${userId}</p>
                <p><strong>Organisation:</strong> ${group.map(member => member.organisation).join(', ')}</p>
                <p><strong>School Student:</strong> ${group.map(member => member.isStudent ? 'Yes' : 'No').join(', ')}</p>
                <p><strong>Email:</strong> ${group.map(member => member.email).join(', ')}</p>
                <p><strong>Count:</strong> ${count}</p>
                <p><strong>Amount:</strong> ₹${amount / 100}</p>
              </div>
              <div class="footer">
                <p>For any queries, please contact us at <a href="mailto:tedxsupport@carmelcet.in">tedxsupport@carmelcet.in</a></p>
              </div>
            </div>
          </body>
          </html>
        `,
      };


      transporter.sendMail(summaryMailOptions, (error, info) => {
        if (error) {
          console.error("Error sending summary email:", error);
          return new NextResponse(
            JSON.stringify({
              message: "Failed to send summary email",
              desc: "There was an error sending the summary email. Please try again later or contact support.",
            }),
            { status: 500 }
          );
        }
      });

      return new NextResponse(JSON.stringify({ message: "Save successful" }), {
        status: 200,
      });
    }
    return new NextResponse(
      JSON.stringify({ message: "Payment Save Unsuccessful" }),
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Internal Server Error:", err);
    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error" }),
      { status: 500 }
    );
  }
};
