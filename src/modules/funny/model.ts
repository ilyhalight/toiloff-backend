import { t } from "elysia";

import { MeowSound } from "./entity";

export const FunnyModel = {
  meowRequest: t.Optional(t.Partial(MeowSound)),
  meowResponse: MeowSound,
};
