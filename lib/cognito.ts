import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession
} from 'amazon-cognito-identity-js';

/**
 * Inicializa o userPool somente quando todas as envs existem.
 * Isso impede erro durante o build do Next.js no GitHub Actions.
 */
function getUserPool() {
  const UserPoolId = 'process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID';
  const ClientId = 'process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID';

  // Evita crash no build
  if (!UserPoolId || !ClientId) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Missing Cognito environment variables.');
    }
    console.warn('⚠️ Cognito env vars faltando (OK em dev).');
    return null;
  }

  return new CognitoUserPool({
    UserPoolId,
    ClientId,
  });
}

const userPool = getUserPool();

// ----------------------------- SIGN IN ----------------------------------

export async function signIn(
  email: string,
  password: string
): Promise<{ session: CognitoUserSession }> {

  if (!userPool) {
    throw new Error('Cognito not configured.');
  }

  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: userPool });
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    user.authenticateUser(authDetails, {
      onSuccess: (session) => resolve({ session }),
      onFailure: reject,
    });
  });
}

// ----------------------------- SIGN UP ----------------------------------

export function signUp(email: string, password: string, attributes: Record<string, string>) {
  if (!userPool) throw new Error('Cognito not configured.');

  return new Promise((resolve, reject) => {
    const attributeList = Object.entries(attributes).map(
      ([Name, Value]) => new CognitoUserAttribute({ Name, Value })
    );

    userPool.signUp(email, password, attributeList, [], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

// --------------------------- CONFIRM USER --------------------------------

export function confirmUser(email: string, code: string) {
  if (!userPool) throw new Error('Cognito not configured.');

  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: userPool });

    user.confirmRegistration(code, true, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

// --------------------------- LOGIN COGNITO --------------------------------

export function loginCognito(email: string, password: string) {
  if (!userPool) throw new Error('Cognito not configured.');

  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: userPool });
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    user.authenticateUser(authDetails, {
      onSuccess: (result) => {
        resolve({
          email,
          token: result.getIdToken().getJwtToken(),
        });
      },
      onFailure: reject,
    });
  });
}
