import { Schema, model } from 'mongoose';

const DriverSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    vehicle: {
      vehicleNumber: { type: String, required: true },
      vehicleType: { type: String, enum: ['Bike', 'Car'], required: true },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    onlineStatus: {
      type: String,
      enum: ['Active', 'Offline'],
      default: 'Offline',
    },
    ridingStatus: {
      type: String,
      enum: ['idle', 'waiting_for_pickup', 'in_transit', 'unavailable'],
      default: 'idle',
    },
    isOnRide: {
      type: Boolean,
      default: false,
    },
    totalEarning: {
      type: Number,
      default: 0,
    },
    drivingLicense: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Approved', 'Pending', 'Suspended'],
      default: 'Pending',
    },
    rating: {
      type: Number,
      default: 0,
    },
    rideHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Ride',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Driver = model('Driver', DriverSchema);
