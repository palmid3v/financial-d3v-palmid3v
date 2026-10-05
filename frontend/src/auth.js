const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY || "";
const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID || "";
const AUTH_ENABLED = (import.meta.env.VITE_FIREBASE_AUTH_ENABLED || "false") === "true";
const SESSION_KEY = "financial-d3v-auth";
function readSession(){try{const raw=sessionStorage.getItem(SESSION_KEY);return raw?JSON.parse(raw):null}catch{return null}}
function writeSession(session){sessionStorage.setItem(SESSION_KEY,JSON.stringify(session))}
function clearSession(){sessionStorage.removeItem(SESSION_KEY)}
function assertConfigured(){if(!API_KEY||!PROJECT_ID)throw new Error("Firebase Auth is enabled but VITE_FIREBASE_API_KEY or VITE_FIREBASE_PROJECT_ID is missing.")}
async function firebaseRequest(path,body){assertConfigured();const response=await fetch(`https://${path}?key=${encodeURIComponent(API_KEY)}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const data=await response.json().catch(()=>null);if(!response.ok){const code=data?.error?.message||"AUTH_ERROR";throw new Error(code.replaceAll("_"," ").toLowerCase())}return data}
export function isAuthEnabled(){return AUTH_ENABLED}
export function currentSession(){return readSession()}
export async function signIn(email,password){const data=await firebaseRequest("identitytoolkit.googleapis.com/v1/accounts:signInWithPassword",{email,password,returnSecureToken:true});const session={uid:data.localId,email:data.email||email,accessToken:data.idToken,refreshToken:data.refreshToken,expiresAt:Date.now()+Number(data.expiresIn||3600)*1000};writeSession(session);return session}
export async function refreshSession(){const session=readSession();if(!session?.refreshToken)return null;const response=await fetch(`https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(API_KEY)}`,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"refresh_token",refresh_token:session.refreshToken})});const data=await response.json().catch(()=>null);if(!response.ok){clearSession();return null}const next={uid:data.user_id||session.uid,email:session.email,accessToken:data.id_token,refreshToken:data.refresh_token||session.refreshToken,expiresAt:Date.now()+Number(data.expires_in||3600)*1000};writeSession(next);return next}
export async function getAuthToken(){if(!AUTH_ENABLED)return null;const session=readSession();if(!session)return null;if(session.expiresAt&&session.expiresAt>Date.now()+60000)return session.accessToken;return(await refreshSession())?.accessToken||null}
export function signOut(){clearSession()}
