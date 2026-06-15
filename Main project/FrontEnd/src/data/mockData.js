// This file contains initial mock data. 
// When you build the backend, you will delete this and fetch from your SQL/MongoDB database.

export const initialItems = [
  {
    id: "SKU-9901",
    name: "Sony WH-1000XM5 Headphones",
    category: "Electronics",
    description: "Industry leading noise canceling wireless headphones.",
    stock: 45,
    minThreshold: 15,
    location: "Warehouse A",
    status: "healthy",
    price: 29990
  },
  {
    id: "SKU-9902",
    name: "Samsung 4K Smart Monitor",
    category: "Displays",
    description: "32-inch 4K UHD smart monitor.",
    stock: 8,
    minThreshold: 10,
    location: "Warehouse B",
    status: "low",
    price: 34999
  },
  {
    id: "SKU-9904",
    name: "Keychron K2 Mechanical Keyboard",
    category: "Accessories",
    description: "75% layout wireless mechanical keyboard.",
    stock: 4,
    minThreshold: 15,
    location: "Warehouse A",
    status: "critical",
    price: 9500
  }
];
