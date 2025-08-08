export const BAKERIES = [
  {
    id: "1",
    name: "Boulangerie Centrale",
    address: "123 Rue de la République, Paris",
    latitude: 48.8566,
    longitude: 2.3522,
    password: "centrale2024"
  },
  {
    id: "2", 
    name: "Pain d'Or",
    address: "456 Avenue des Champs, Paris",
    latitude: 48.864716,
    longitude: 2.349014,
    password: "paindor2024"
  },
  {
    id: "3",
    name: "Le Croissant Doré",
    address: "789 Boulevard Saint-Germain, Paris", 
    latitude: 48.86,
    longitude: 2.34,
    password: "croissant2024"
  }
] as const;

export type BakeryInfo = typeof BAKERIES[number];