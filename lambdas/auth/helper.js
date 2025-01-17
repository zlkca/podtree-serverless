import { cognitoSignIn, cognitoSignUp } from "./cognito-helper.js";

export async function login(body) {
    console.log('login:', body);
    const { email, password } = JSON.parse(body);
    const rsp = await cognitoSignIn(email, password);
    console.log(rsp);
    return rsp.AuthenticationResult;
}

export async function signup(body) {
    const { email, password, school } = JSON.parse(body);
    try{
        const rsp = await cognitoSignUp(email, password, school);
        console.log(rsp);
        return rsp;
    }catch(e){
        throw new Error(e.message);
    }
}
