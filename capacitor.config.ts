import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.gotangle.tangle",
  appName: "Tangle",
  webDir: "dist",
  // Hot-reload from the Lovable sandbox while developing on a device.
  // REMOVE the `server` block before submitting to the App Store / Play Store.
  server: {
    url: "https://4165f83d-1f61-402f-bb8d-cc91c478e200.lovableproject.com?forceHideBadge=true",
    cleartext: true,
  },
  plugins: {
    GoogleAuth: {
      // TODO: paste your **iOS** OAuth Client ID from Google Cloud Console here.
      // Create it under: APIs & Services → Credentials → Create OAuth client ID → iOS.
      // Bundle ID must match `appId` above: app.gotangle.tangle
      iosClientId: "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",
      // Web client ID (the one already used for web Google sign-in). Required for ID token issuance.
      serverClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
      scopes: ["profile", "email"],
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
