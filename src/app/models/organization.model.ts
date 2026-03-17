import { User } from './user.model';

export interface Organization {
  _id: string;
  name: string;
  Users?: User[];
}
