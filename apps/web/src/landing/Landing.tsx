import { CLIENT } from "../config/client";
import { DefaultLandingTemplate } from "./templates/default";
import { MinimalLandingTemplate } from "./templates/minimal";
import { PremiumLandingTemplate } from "./templates/premium";

export function Landing() {
  if (CLIENT.landing.template === "minimal") {
    return <MinimalLandingTemplate />;
  }

  if (CLIENT.landing.template === "premium") {
    return <PremiumLandingTemplate />;
  }

  return <DefaultLandingTemplate />;
}
