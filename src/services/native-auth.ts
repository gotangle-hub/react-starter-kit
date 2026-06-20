import { supabase } from "@/integrations/supabase/client";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { SignInWithApple, type SignInWithAppleResponse } from "@capacitor-community/apple-sign-in";
import { platform } from "@/lib/native";

let googleInitialized = false;
function ensureGoogleInit() {
  if (googleInitialized) return;
  GoogleAuth.initialize();
  googleInitialized = true;
}

/**
 * Native Google sign-in (iOS/Android). Uses the platform SDK, then hands the
 * ID token to Supabase via signInWithIdToken — no browser redirect.
 */
export async function nativeGoogleSignIn() {
  ensureGoogleInit();
  const user = await GoogleAuth.signIn();
  const idToken = user.authentication?.idToken;
  if (!idToken) throw new Error("Google did not return an ID token.");
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: idToken,
  });
  if (error) throw error;
  return data;
}

/**
 * Native Apple sign-in (iOS only). Required by Apple if Google is offered on iOS.
 * On Android this will throw — fall back to web OAuth there.
 */
export async function nativeAppleSignIn() {
  if (platform() !== "ios") throw new Error("Apple native sign-in is iOS-only.");
  const res: SignInWithAppleResponse = await SignInWithApple.authorize({
    clientId: "app.gotangle.tangle", // your iOS bundle ID (also your Services ID for Apple)
    redirectURI: "https://gotangle.app/", // not used on native, but required by the plugin
    scopes: "email name",
  });
  const idToken = res.response?.identityToken;
  if (!idToken) throw new Error("Apple did not return an identity token.");
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "apple",
    token: idToken,
  });
  if (error) throw error;
  return data;
}
