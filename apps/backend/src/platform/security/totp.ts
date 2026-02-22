import { authenticator } from "otplib";

authenticator.options = {
  window: 1,
  step: 30,
};

const generateTotpSecret = (): string => authenticator.generateSecret();

const buildTotpUri = (email: string, secret: string): string =>
  authenticator.keyuri(email, "MovieScore", secret);

const verifyTotpCode = (code: string, secret: string): boolean =>
  authenticator.verify({
    token: code,
    secret,
  });

export { buildTotpUri, generateTotpSecret, verifyTotpCode };
