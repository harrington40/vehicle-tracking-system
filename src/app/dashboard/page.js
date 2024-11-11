"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Retrieve token from cookies
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1];

    // If no token, redirect to login
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch verification from API route
    fetch('/api/verify-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.error("Authentication failed:", data.error);
          router.push('/login');
        } else {
          setIsAuthenticated(true);
        }
      })
      .catch((err) => {
        console.error("API call error:", err);
        router.push('/login');
      });
  }, [router]);

  if (!isAuthenticated) return null; // Render nothing until authenticated

  return <div>Welcome to the dashboard!</div>;
}
