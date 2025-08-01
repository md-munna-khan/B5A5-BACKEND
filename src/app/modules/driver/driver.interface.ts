import { Types } from 'mongoose';

export interface IDriver {
   _id?: Types.ObjectId,
  userId: Types.ObjectId;

  vehicle?: {
    vehicleNumber: string;
    vehicleType: 'Bike' | 'Car';
  };

location?: {
  type: 'Point';
  coordinates: [number, number]; 
};


  onlineStatus?: 'Active' | 'Offline';
  ridingStatus?: "idle" | 'waiting_for_pickup' | 'in_transit' | 'Complete';
  isOnRide?: boolean;
  totalEarning?: number;
  drivingLicense?: string; 

  status?: 'Approved' | 'Pending' | 'Suspended';
  rating?: number;
  rideHistory?: Types.ObjectId[];

  createdAt?: Date;
  updatedAt?: Date;
}

