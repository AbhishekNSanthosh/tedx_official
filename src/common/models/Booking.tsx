import { Schema, model, models } from "mongoose";

const BookingSchema = new Schema(
  {
    userId: {
      type: String,
      require: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    paymentId: {
      type: String,
      rquire: true,
    },
    referal_code: {
      type: String,
    },
    count: {
      type: Number,
      required: true,
    },
    isSponsor:{
      type: Boolean,
      default: false,
    },
    NGOTickets:{
      type: Boolean,
      default: false,
    },
    confirmationMailSent: {
      type: Boolean,
      default: false,
    },
    amount: {
      type: Number,
      require: true,
    },
    group: [
      {
        firstName: {
          type: String,
          require: true,
        },
        lastName: {
          type: String,
          require: true,
        },
        email: {
          type: String,
          require: true,
        },
        food: {
          type: String,
          require: true,
        },
        organisation: {
          type: String,
          require: true,
        },
        designation: {
          type: String,
          require: true,
        },
        checkedIn: {
          type: Boolean,
          default: false,
        },
        isStudent: {
          type: Boolean,
          default: false,
        },
        ticketId: {
          type: String,
          require: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const Booking = models.Booking || model("Booking", BookingSchema);
export default Booking;
