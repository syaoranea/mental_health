// lib/cognito-token.ts
import jwt, { JwtPayload } from 'jsonwebtoken';

// ... (restante do código) ...

export type CognitoUser = {
  sub: string;
  email?: string;
  username?: string;
  name?: string; // Adicionado
  given_name?: string; // Adicionado
  family_name?: string; // Adicionado
  groups?: string[];
  raw: JwtPayload;
};

export function parseCognitoIdToken(idToken: string): CognitoUser | null {
  try {
    const decoded = jwt.decode(idToken) as JwtPayload | null;
    if (!decoded || typeof decoded !== 'object') return null;

    // ... (validações de iss, aud, exp, etc.) ...

    const sub = decoded.sub as string | undefined;
    if (!sub) return null;

    const email = decoded.email as string | undefined;
    const username =
      (decoded['cognito:username'] as string | undefined) ?? email ?? sub;
    
    // Extrair campos de nome
    const name = decoded.name as string | undefined;
    const given_name = decoded.given_name as string | undefined;
    const family_name = decoded.family_name as string | undefined;

    const groups = (decoded['cognito:groups'] as string[]) || [];

    return {
      sub,
      email,
      username,
      name, // Incluído no retorno
      given_name, // Incluído no retorno
      family_name, // Incluído no retorno
      groups,
      raw: decoded,
    };
  } catch (err) {
    console.error('Erro ao decodificar idToken:', err);
    return null;
  }
}