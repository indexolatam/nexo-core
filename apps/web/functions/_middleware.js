import { onRequest as withError } from "./_middleware/withError.js";
import { onRequest as requireAuth } from "./_middleware/requireAuth.js";
import { onRequest as requireRoot } from "./_middleware/requireRoot.js";

export const onRequest = [withError, requireAuth, requireRoot];
