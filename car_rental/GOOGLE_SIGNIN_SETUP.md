# Google Sign-In Implementation Guide

This guide explains how to configure and enable real Google Sign-In for the Car Rental application.

## 1. Create a Google Cloud Project

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Click the project dropdown in the top bar and select **"New Project"**.
3.  Enter a name (e.g., "Car Rental App") and click **Create**.

## 2. Configure OAuth Consent Screen

1.  In the left sidebar, navigate to **APIs & Services > OAuth consent screen**.
2.  Select **External** for User Type and click **Create**.
3.  Fill in the required fields:
    *   **App name**: Car Rental
    *   **User support email**: Select your email.
    *   **Developer contact information**: Enter your email.
4.  Click **Save and Continue** through the "Scopes" and "Test Users" sections (defaults are fine for development).
5.  On the Summary page, click **Back to Dashboard**.

## 3. Create OAuth Credentials (Client ID)

1.  In the left sidebar, click **Credentials**.
2.  Click **+ CREATE CREDENTIALS** at the top and select **OAuth client ID**.
3.  Select **Web application** as the Application type.
4.  Name it "Car Rental Frontend".
5.  **Important:** Under **Authorized JavaScript origins**, click **ADD URI** and enter your frontend URL:
    *   `http://localhost:5173`
    *(Note: If your app runs on a different port, use that instead).*
6.  Click **Create**.
7.  A popup will appear with your **Client ID**. Copy this string (it looks like `12345...apps.googleusercontent.com`).

## 4. Configure the Application

### Step A: Add Client ID to `main.tsx`

1.  Open the file `frontend/src/main.tsx`.
2.  Locate the `GOOGLE_CLIENT_ID` constant.
3.  Replace the placeholder with your actual Client ID:

    ```typescript
    // frontend/src/main.tsx
    const GOOGLE_CLIENT_ID = "YOUR_PASTED_CLIENT_ID_HERE";
    ```

### Step B: Enable Real Login in `Login.tsx`

1.  Open `frontend/src/pages/Login.tsx`.
2.  Find the `social-buttons` section at the bottom of the component.
3.  Change the Google button's `onClick` handler from the mock function to the real hook:

    **Change this:**
    ```tsx
    <button className="social-btn google-btn" onClick={() => handleMockGoogleLogin()}>
      <FaGoogle /> Sign in with Google (Demo)
    </button>
    ```

    **To this:**
    ```tsx
    <button className="social-btn google-btn" onClick={() => googleLogin()}>
      <FaGoogle /> Sign in with Google
    </button>
    ```

## 5. Test the Integration

1.  Restart your frontend server if needed (`npm run dev`).
2.  Click the "Sign in with Google" button.
3.  A Google popup should appear.
4.  Select your Google account.
5.  Upon success, you will be redirected to the Dashboard, and your Google Name and Profile Picture will be stored in the database.
