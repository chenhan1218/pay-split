# Web Application (Next.js)

This is the frontend web application for Pay-Split, built with Next.js, TypeScript, Tailwind CSS, and Shadcn UI.

## Getting Started

Follow these steps to set up and run the web application locally.

### 1. Install Dependencies

Navigate to the `web/` directory and install the required Node.js packages:

```bash
cd web/
npm install
# or yarn install
# or pnpm install
# or bun install
```

### 2. Environment Variables

This project uses environment variables for sensitive configurations, particularly for Firebase.
Create a file named `.env.local` in the `web/` directory by copying the provided example:

```bash
cp .env.example .env.local
```

Then, open `.env.local` and fill in your Firebase project configuration details. You can obtain these from your Firebase project settings in the Firebase Console.

Example `.env.local` content:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Important**: Do not commit `.env.local` to Git. It is already ignored by `.gitignore`.

### 3. Run the Development Server

Once dependencies are installed and environment variables are set, you can run the development server:

```bash
npm run dev
# or yarn dev
# or pnpm dev
# or bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The page auto-updates as you edit the files.

## Project Structure

- `app/`: Next.js App Router pages and layouts.
- `src/config/`: Application configuration files, including environment variable validation.
- `src/lib/`: Utility functions and external service initializations (e.g., Firebase).
- `src/services/`: Core business logic and data access layers (framework-agnostic).

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn UI Documentation](https://ui.shadcn.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
