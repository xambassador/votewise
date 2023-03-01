import { faker } from "@faker-js/faker";

const getUser = (props: object) => ({
  id: 1,
  name: faker.name.firstName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  username: faker.internet.userName(),
  about: faker.lorem.paragraph(),
  twitter: "",
  facebook: "",
  instagram: "",
  profile_image: "",
  cover_image: "",
  created_at: new Date(),
  updated_at: new Date(),
  location: "",
  onboarded: false,
  gender: null,
  is_email_verify: false,
  last_login: new Date(),
  ...props,
});

export { getUser };
export * from "./generator";
