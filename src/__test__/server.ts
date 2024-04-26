import { setupServer } from "msw/node";
import { trpcMsw } from "./utils";

export const server = setupServer(
  trpcMsw.example.hello.query((input) => {
    return { greeting: `Hello ${input.text}` };
  })
);
