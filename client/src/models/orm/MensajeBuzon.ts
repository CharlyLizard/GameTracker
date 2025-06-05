export interface MensajeBuzon {
    _id: string;
    userId: string;
    subject: string;
    sender: string;
    body: string;
    date: string;
    read: boolean;
  }