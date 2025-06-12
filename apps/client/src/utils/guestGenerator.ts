import { faker } from "@faker-js/faker";

function generateGuest() {
  return {
    userId: faker.string.uuid(),
    username: faker.internet.username(),
  };
}

export default generateGuest;
