import { platformTagline } from "@moviescore/shared";

export type PlatformInfo = {
  name: string;
  tagline: string;
};

export const getPlatformInfo = (): PlatformInfo => ({
  name: "MovieScore",
  tagline: platformTagline,
});
