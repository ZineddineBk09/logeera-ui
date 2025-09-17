import { SignJWT, jwtVerify } from 'jose';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  [key: string]: any;
}

const getSecret = (secret: string) => new TextEncoder().encode(secret);

export const signAccessToken = async (payload: JWTPayload): Promise<string> => {
  const secret = getSecret(process.env.JWT_ACCESS_SECRET!);
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret);
};

export const signRefreshToken = async (payload: JWTPayload): Promise<string> => {
  const secret = getSecret(process.env.JWT_REFRESH_SECRET!);
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
};

export const verifyAccessToken = async (token: string): Promise<JWTPayload> => {
  const secret = getSecret(process.env.JWT_ACCESS_SECRET!);
  const { payload } = await jwtVerify(token, secret);
  return payload as JWTPayload;
};

export const verifyRefreshToken = async (token: string): Promise<JWTPayload> => {
  const secret = getSecret(process.env.JWT_REFRESH_SECRET!);
  const { payload } = await jwtVerify(token, secret);
  return payload as JWTPayload;
};
