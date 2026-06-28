import { onRequest as withError } from "./_middleware/withError.js";
import { onRequest as requireAuth } from "./_middleware/requireAuth.js";

export const onRequest = [withError, requireAuth];
