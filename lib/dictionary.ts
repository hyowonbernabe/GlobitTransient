export type Unit = {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  price: number;
  pax: number;
  bedrooms: number;
  bathrooms: number;
  location: string;
  amenities: string[];
  gallery: string[];
};

export const units: Unit[] = [
  {
    id: "u1",
    slug: "pine-haven-suite",
    title: "Pine Haven Suite",
    description:
      "Experience the authentic Baguio vibe in this cozy suite surrounded by pine trees. Features a modern rustic interior, private balcony with mountain views, and high-speed internet. Perfect for couples or small families looking for a peaceful retreat while being close to the city center.",
    image: "/assets/gallery/LCM01710.webp",
    price: 3500,
    pax: 4,
    bedrooms: 1,
    bathrooms: 1,
    location: "Mines View Park Area, Baguio City",
    amenities: [
      "Fast Wifi",
      "Free Parking",
      "Smart TV with Netflix",
      "Hot Shower",
      "Balcony",
      "Kitchenette",
    ],
    gallery: [
      "/assets/gallery/LCM01710.webp",
      "/assets/gallery/LCM01711.webp",
      "/assets/gallery/LCM01712.webp",
      "/assets/gallery/LCM01715.webp",
      "/assets/gallery/LCM01717.webp",
    ],
  },
  {
    id: "u2",
    slug: "cordillera-cloud-loft",
    title: "Cordillera Cloud Loft",
    description:
      "Wake up to the famous Baguio fog in this airy loft apartment. High ceilings, large windows, and a fully equipped kitchen make this an ideal home away from home. Located just minutes away from Wright Park and The Mansion.",
    image: "/assets/gallery/LCM01731.webp",
    price: 4200,
    pax: 6,
    bedrooms: 2,
    bathrooms: 1,
    location: "Gibraltar Road, Baguio City",
    amenities: [
      "Fiber Internet",
      "Dedicated Workspace",
      "Full Kitchen",
      "Hot Water",
      "Mountain View",
      "Pet Friendly",
    ],
    gallery: [
      "/assets/gallery/LCM01731.webp",
      "/assets/gallery/LCM01738.webp",
      "/assets/gallery/LCM01744.webp",
      "/assets/gallery/LCM01784.webp",
      "/assets/gallery/LCM01786.webp",
    ],
  },
  {
    id: "u3",
    slug: "heritage-hill-home",
    title: "Heritage Hill Home",
    description:
      "A spacious family home that blends classic Baguio charm with modern comforts. Enjoy the cool breeze on the veranda, gather around the fireplace (electric), and explore the nearby botanical gardens. Great for larger groups.",
    image: "/assets/gallery/LCM01886.webp",
    price: 5500,
    pax: 8,
    bedrooms: 3,
    bathrooms: 2,
    location: "Leonard Wood Road, Baguio City",
    amenities: [
      "High-Speed Wifi",
      "2 Car Parking",
      "Cable TV",
      "Water Heater",
      "Veranda",
      "Cooking Essentials",
    ],
    gallery: [
      "/assets/gallery/LCM01886.webp",
      "/assets/gallery/LCM01888.webp",
      "/assets/gallery/LCM01892.webp",
      "/assets/gallery/LCM01898.webp",
      "/assets/gallery/LCM01902.webp",
    ],
  },
];