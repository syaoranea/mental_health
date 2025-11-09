import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
} from 'amazon-cognito-identity-js'

const poolData = {
  UserPoolId: 'us-east-1_MTpOnlI5f',
  ClientId: '2u6dkn6qb6cb35mmvk9nvf67au',
}

export const userPool = new CognitoUserPool(poolData)

export async function signUp(email: string, password: string, extraAttrs: any) {
  const attributeList = [
    new CognitoUserAttribute({ Name: 'email', Value: email }),
    new CognitoUserAttribute({ Name: 'name', Value: extraAttrs.name }),
    new CognitoUserAttribute({ Name: 'birthdate', Value: extraAttrs.birthdate }),
    new CognitoUserAttribute({ Name: 'gender', Value: extraAttrs.gender }),
    new CognitoUserAttribute({ Name: 'picture', Value: extraAttrs.picture }),
  ]

  return new Promise((resolve, reject) => {
    userPool.signUp(email, password, attributeList, [], (err, result) => {
      if (err) reject(err)
      else resolve(result)
    })
  })
}

export function confirmSignUp(email: string, code: string) {
  const user = new CognitoUser({ Username: email, Pool: userPool })
  return new Promise((resolve, reject) => {
    user.confirmRegistration(code, true, (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
}

export function signIn(email: string, password: string) {
  const authDetails = new AuthenticationDetails({ Username: email, Password: password })
  const user = new CognitoUser({ Username: email, Pool: userPool })
  return new Promise<{ user: CognitoUser; session: any }>((resolve, reject) => {
    user.authenticateUser(authDetails, {
      onSuccess: (session) => resolve({ user, session }),
      onFailure: (err) => reject(err),
      newPasswordRequired: (userAttributes) => {
        // caso política force troca de senha no primeiro login
        reject({ code: 'NEW_PASSWORD_REQUIRED', details: userAttributes })
      },
    })
  })
}

export function refreshSession(email: string, refreshTokenStr: string) {
  const user = new CognitoUser({ Username: email, Pool: userPool })
  const refreshToken = new (require('amazon-cognito-identity-js').CognitoRefreshToken)({ RefreshToken: refreshTokenStr })
  return new Promise<any>((resolve, reject) => {
    user.refreshSession(refreshToken, (err: any, session: any) => {
      if (err) return reject(err)
      resolve(session)
    })
  })
}

