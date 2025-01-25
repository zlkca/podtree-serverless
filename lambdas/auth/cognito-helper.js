import {
    SignUpCommand,
    InitiateAuthCommand,
    ConfirmSignUpCommand,
    // AdminDeleteUserCommand,
    // AdminUserGlobalSignOutCommand,
    // GlobalSignOutCommand,
    // RevokeTokenCommand,
    CognitoIdentityProviderClient,
    // ConfirmForgotPasswordCommand,
    // ResendConfirmationCodeCommand,
    // ForgotPasswordCommand,
    // AdminCreateUserCommand,
    // AdminGetUserCommand,
    // AdminResetUserPasswordCommand,
    // RespondToAuthChallengeCommand,
  } from "@aws-sdk/client-cognito-identity-provider";
  
import { CognitoCfg } from "../../const";

const clientId = '2fm5focugakc2254timbpnphg3'; // process.env.COGNITO_CLIENT_ID;
const client = new CognitoIdentityProviderClient({
    region: CognitoCfg.region,
});

export async function cognitoSignIn(username, password) {
    const command = new InitiateAuthCommand({
        ClientId: clientId,
        AuthFlow: "USER_PASSWORD_AUTH",
        AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
        },
    });

    return await client.send(command); // {AccessToken, ExpiresIn: 3600, IdToken, RefreshToken, TokenType}
}

// username should be email
export async function cognitoSignUp(email, password, school) {
    try {
        const command = new SignUpCommand({
            ClientId: clientId,
            Username: email,
            Password: password,
            UserAttributes: [{ Name: "email", Value: email }],
            ClientMetadata: {
                trigger: "CustomMessage_SignUp",
                school: school? school.name : '',
                email, // need check dup
            },
            ForceAliasCreation: true,
        });
    
        return await client.send(command);
    } catch (error) {
        console.error('Cognito SignUp error:', error);
        
        // Handle specific Cognito errors
        switch (error.name) {
            case 'UsernameExistsException':
                throw new Error('An account with this email already exists');
            case 'InvalidPasswordException':
                throw new Error('Password does not meet requirements');
            case 'InvalidParameterException':
                throw new Error('Invalid email format');
            case 'CodeDeliveryFailureException':
                throw new Error('Failed to send verification code');
            case 'LimitExceededException':
                throw new Error('Too many attempts. Please try again later');
            default:
                throw new Error(error.message || 'Failed to create account');
        }
    }
}

  export async function cognitoConfirmSignUp(username, confirmationCode) {
    const command = new ConfirmSignUpCommand({
      ClientId: clientId,
      Username: username,
      ConfirmationCode: confirmationCode,
    });
  
    try {
      const response = await client.send(command);
      return {
        success: true,
        message: "User confirmed successfully",
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to confirm user",
        error: error.message,
      };
    }
  }

//   export async function createUserByAdmin(username, email, school){
//     const client = new CognitoIdentityProviderClient({
//       region: CognitoCfg.region,
//     });
//     try {
//       const command = new AdminCreateUserCommand({
//         UserPoolId: CognitoCfg.userPoolId,
//         Username: username,
//         UserAttributes: [
//           { Name: "email", Value: email },
//           { Name: "email_verified", Value: "true" },
//         ],
//         // MessageAction: "SUPPRESS",
//         DesiredDeliveryMediums: ["EMAIL"], // Sends activation email
//         ClientMetadata: {
//           trigger: "CustomMessage_AdminCreateUser",
//           school: school.name
//         }
//       });
  
//       const response = await client.send(command);
//       console.log("User created:", response);
//       return response;
//     } catch (error) {
//       console.error("Error creating user:", error);
//       throw error;
//     }
//   }
  
//   export async function forceChangePassword({ session, username, password }) {
//     const client = new CognitoIdentityProviderClient({
//       region: CognitoCfg.region,
//     });
  
//     const challengeCommand = new RespondToAuthChallengeCommand({
//       ClientId: CognitoCfg.clientId,
//       ChallengeName: "NEW_PASSWORD_REQUIRED",
//       Session: session, // From the previous response of the InitiateAuthCommand
//       ChallengeResponses: {
//         USERNAME: username,
//         NEW_PASSWORD: password,
//       },
//     });
  
//     const challengeResponse = await client.send(challengeCommand);
//     console.log("Password updated successfully:", challengeResponse);
//     return challengeResponse;
//   }
  
  
  

  
//   export async function resendVerificationCode(username, school) {
//     const client = new CognitoIdentityProviderClient({
//       region: CognitoCfg.region,
//     });
//     try {
//       const command = new ResendConfirmationCodeCommand({
//         ClientId: CognitoCfg.clientId,
//         Username: username,
//         ClientMetadata: {
//           trigger: "CustomMessage_ResendCode", // This will be available in lambda
//           school: school?.name || ''
//         }
//       });
  
//       const response = await client.send(command);
//       return {
//         success: true,
//         deliveryDetails: response.CodeDeliveryDetails
//       };
//     } catch (error) {
//       console.error('Resend code error:', error);
//       throw new Error(error.message || 'Failed to resend verification code');
//     }
//   }
  
//   export async function forgotPasswordByAdmin(username, school){
//     const client = new CognitoIdentityProviderClient({
//       region: CognitoCfg.region,
//     });
//     try {
//       // First, get existing user attributes
//       const getUserCommand = new AdminGetUserCommand({
//         UserPoolId: CognitoCfg.userPoolId,
//         Username: username
//       });
  
//       const userResponse = await client.send(getUserCommand);
      
//       // Reset the user's password (this invalidates their old password)
//       const resetCommand = new AdminResetUserPasswordCommand({
//         UserPoolId: CognitoCfg.userPoolId,
//         Username: username
//       });
  
//       await client.send(resetCommand);
  
//       // Send verification code using AdminCreateUser with RESEND
//       const createCommand = new AdminCreateUserCommand({
//         UserPoolId: CognitoCfg.userPoolId,
//         Username: username,
//         MessageAction: 'RESEND',
//         UserAttributes: userResponse.UserAttributes,
//         DesiredDeliveryMediums: ['EMAIL'],
//         ClientMetadata: {
//           trigger: "CustomMessage_ForgotPassword",
//           school: school?.name || ''
//         }
//       });
  
//       await client.send(createCommand);
      
//       return {
//         success: true,
//         deliveryDetails: {
//           AttributeName: 'email',
//           DeliveryMedium: 'EMAIL',
//           Destination: userResponse.UserAttributes.find(attr => attr.Name === 'email')?.Value
//         }
//       };
//     } catch (error) {
//       console.error('Forgot password error:', error);
//       throw new Error(error.message || 'Failed to request password reset');
//     }
//   }
  
//   export async function forgotPassword(username, school){
//     const client = new CognitoIdentityProviderClient({
//       region: CognitoCfg.region,
//     });
//     try {
//       const command = new ForgotPasswordCommand({
//         ClientId: CognitoCfg.clientId,
//         Username: username,
//         ClientMetadata: {
//           trigger: "CustomMessage_ForgotPassword",
//           school: school?.name || ''
//         }
//       });
  
//       const response = await client.send(command);
//       return {
//         success: true,
//         deliveryDetails: response.CodeDeliveryDetails
//       };
//     } catch (error) {
//       console.error('Forgot password error:', error);
//       throw new Error(error.message || 'Failed to request password reset');
//     }
//   }
  
//   export async function changePasswordAfterVerification({ username, verificationCode, newPassword }) {
//     const client = new CognitoIdentityProviderClient({
//       region: CognitoCfg.region,
//     });
//     try {
//       const command = new ConfirmForgotPasswordCommand({
//         ClientId: CognitoCfg.clientId,
//         Username: username,
//         ConfirmationCode: verificationCode,
//         Password: newPassword
//       });
  
//       const response = await client.send(command);
//       return { success: true, data: response };
//     } catch (error) {
//       console.error('Change password error:', error);
//       throw new Error(error.message || 'Failed to change password');
//     }
//   }
  
//   export async function removeUserFromCognito(username) {
//     // Create a Cognito Identity Provider client
//     const client = new CognitoIdentityProviderClient({
//       region: CognitoCfg.region,
//     });
  
//     // Set up the command parameters
//     const input = {
//       UserPoolId: CognitoCfg.userPoolId,
//       Username: username,
//     };
  
//     // Create the command
//     const command = new AdminDeleteUserCommand(input);
  
//     try {
//       // Send the command to delete the user
//       const response = await client.send(command);
//       console.log("User successfully deleted from Cognito");
//       return response;
//     } catch (error) {
//       console.error("Error deleting user from Cognito:", error);
//       throw error;
//     }
//   }
  
//   export const cognitoLogout = async ({ username, accessToken }) => {
//     try {
//       const operations = [];
//       const client = new CognitoIdentityProviderClient({
//         region: CognitoCfg.region,
//       });
  
//       // If we have an access token, perform global sign-out for the current session
//       if (accessToken) {
//         operations.push(
//           client.send(
//             new GlobalSignOutCommand({
//               AccessToken: accessToken,
//             })
//           )
//         );
  
//         // Revoke the refresh token
//         operations.push(
//           client.send(
//             new RevokeTokenCommand({
//               Token: accessToken,
//               ClientId: CognitoCfg.clientId,
//             })
//           )
//         );
//       }
  
//       // If we have a username, perform admin global sign-out
//       if (username) {
//         operations.push(
//           client.send(
//             new AdminUserGlobalSignOutCommand({
//               UserPoolId: CognitoCfg.userPoolId,
//               Username: username,
//             })
//           )
//         );
//       }
  
//       // Execute all logout operations
//       const results = await Promise.allSettled(operations);
  
//       // Check for any failures
//       const failures = results.filter((result) => result.status === "rejected");
//       if (failures.length > 0) {
//         console.error("Some logout operations failed:", failures);
//         throw new Error("Partial logout failure");
//       }
  
//       return {
//         success: true,
//         message: "User logged out successfully",
//       };
//     } catch (error) {
//       console.error("Cognito logout error:", error);
//       throw {
//         success: false,
//         message: "Failed to logout user",
//         error: error.message || "Unknown error occurred",
//       };
//     }
//   };
  