import { forbidden } from "../_core/errors.js";

export async function onRequest(context) {
  const user = context.data?.user;
  if (!user || user.role !== "root") return forbidden("Solo root puede acceder");
  return context.next();
}
