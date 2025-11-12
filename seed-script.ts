import { seedDatabase } from "./backend-node/seed-data";

console.log("Starting manual database seeding...");

seedDatabase()
  .then(() => {
    console.log("Database seeding completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  });