# Hakim Car Service Frontend

This is the frontend application for the Hakim Car Service platform, built for IBTIKAR-IT-Dubai. It provides a modern, responsive interface for customers and admins to manage car service requests.

---

## 🚀 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn/ui
- **State Management:** Zustand
- **API Communication:** TanStack Query
- **Form Handling:** React Hook Form + Zod
- **UI Components:** Radix UI (via Shadcn/ui)
- **Icons:** Lucide React
- **Authentication:** JWT (via cookies)

---

## 📦 Framework & Library Versions

- **Next.js:** 14.1.0
- **React:** 18.2.0
- **TypeScript:** 5.3.3
- **Tailwind CSS:** 3.4.1
- **Zustand:** 4.5.1
- **TanStack Query:** 5.20.5
- **React Hook Form:** 7.50.1
- **Zod:** 3.22.4
- **Shadcn/ui:** Latest

---

## 🛠️ Project Structure

```
frontend/
├── app/                # Next.js app directory (App Router)
│   ├── admin/          # Admin pages
│   ├── auth/           # Authentication pages
│   ├── components/     # Reusable React components
│   │   ├── ui/        # Shadcn/ui components
│   │   └── forms/     # Form components
│   ├── lib/           # Utility functions
│   │   ├── store/     # Zustand stores
│   │   ├── api/       # API functions
│   │   └── utils/     # Helper functions
│   ├── services/      # Service request pages
│   └── layout.tsx     # App layout
├── public/            # Static assets
├── styles/            # Global styles (Tailwind)
├── .env.local         # Environment variables (not committed)
├── .gitignore
├── package.json
├── tailwind.config.js
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root of the frontend directory with the following:

```
NEXT_PUBLIC_API_URL=https://your-backend-api-url.com
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

- **NEXT_PUBLIC_API_URL**: The base URL for your backend API
- **NEXT_PUBLIC_GOOGLE_MAPS_API_KEY**: Google Maps JavaScript API key

---

## 🧑‍💻 Local Development

1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

3. **Open your browser:**
   Visit [http://localhost:3000](http://localhost:3000)

---

## 🚢 Deployment Guide

### Vercel (Recommended)

1. Push your code to GitHub.
2. Go to [Vercel](https://vercel.com/) and import your repository.
3. Set the following environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
4. Click **Deploy**.

### Manual (Any Node.js Host)

1. **Build the app:**
   ```bash
   npm run build
   # or
   yarn build
   ```
2. **Start the server:**
   ```bash
   npm start
   # or
   yarn start
   ```
3. Make sure to set the environment variables in your hosting environment.

---

## 🔐 Admin Access

- Admin login: `/auth/login`
- Only users with the `ADMIN` role can access `/admin/*` routes.
- Admin credentials are managed in the backend database.

---

## 📝 Features

- Customer service request form with location picker (Google Maps)
- Admin dashboard to view and manage all requests
- JWT authentication (token stored in cookies)
- Responsive, modern UI with Shadcn/ui components
- Form validation with React Hook Form + Zod
- State management with Zustand
- API data fetching with TanStack Query
- Filtering, searching, and status management for requests

---

## 🧑‍💻 Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary and maintained by IBTIKAR-IT-Dubai.
