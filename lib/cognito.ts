import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession
} from 'amazon-cognito-identity-js';

export async function signIn(
  email: string,
  password: string
): Promise<{ session: CognitoUserSession }> {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: userPool })
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    })

    user.authenticateUser(authDetails, {
      onSuccess: (session) => resolve({ session }),
      onFailure: (err) => reject(err),
    })
  })
}

const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!, // ex: 'us-east-1_xxxxx'
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID! // ex: 'xxxxxxxxxxxxxxxxxxxxxx'
};

export const userPool = new CognitoUserPool(poolData);

export const signUp = (
  email: string,
  password: string,
  attributes: { [key: string]: string }
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const attributeList = Object.entries(attributes).map(
      ([Name, Value]) => new CognitoUserAttribute({ Name, Value })
    );

    userPool.signUp(email, password, attributeList, [], (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};

export const confirmUser = (email: string, code: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const userData = { Username: email, Pool: userPool }
    const cognitoUser = new CognitoUser(userData)

    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}

export async function loginCognito(email: string, password: string) {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: userPool })
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    })

    user.authenticateUser(authDetails, {
      onSuccess: (result) => {
        resolve({
          email,
          token: result.getIdToken().getJwtToken(),
        })
      },
      onFailure: (err) => {
        reject(err)
      },
    })
  })
}


