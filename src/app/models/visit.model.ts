export interface IVisit {
    _id?: string;
    id?: string;
    customer_id: any;            // reference to Customer
    restaurant_id: any;          // reference to Restaurant
    date: Date | string;
    pointsEarned?: number;
    billAmount?: number;
}
