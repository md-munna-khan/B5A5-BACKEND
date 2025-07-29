import { Types } from 'mongoose';

export interface IDriver {
   _id?: Types.ObjectId,
  userId: Types.ObjectId;

  vehicle?: {
    vehicleNumber: string;
    vehicleType: 'Bike' | 'Car';
  };

  location?: {
    lat: number;
    lng: number;
  };

  onlineStatus?: 'Active' | 'Offline';
  ridingStatus?:  'waiting_for_pickup' | 'in_transit' | 'Complete';
  isOnRide?: boolean;
  totalEarning?: number;

  nid?: string; 
  drivingLicense?: string; 

  status?: 'Approved' | 'Pending' | 'Suspended';
  rating?: number;
  rideHistory?: Types.ObjectId[];

  createdAt?: Date;
  updatedAt?: Date;
}

