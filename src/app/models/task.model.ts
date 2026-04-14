export interface ITask {
  _id: string;
  restaurant_id: string;
  tasks: { [key: string]: boolean };  // Key: Description, Boolean: completed, not completed
}
