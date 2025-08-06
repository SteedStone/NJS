export type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  archived?: boolean;
};

export type RestockMap = {
  [id: string]: number;
};


type Order = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bakery?: string;
  createdAt: string;
  validated: boolean;
  pin?: string; // Code PIN pour la commande
  time?: string; // Heure de la commande
  status?: "pending" | "ready" | "picked_up";
  items: {
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: number;
    };
  }[];
};