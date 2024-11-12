"use client"; // Client-side only

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/verify-token', {
      method: 'POST',
      credentials: 'include', // Include cookies
    })
      .then((response) => {
        if (response.ok) {
          return response.json(); // Token is valid
        }
        throw new Error('Unauthorized'); // Token is invalid
      })
      .then(() => {
        setLoading(false);
      })
      .catch((error) => {
        console.error("API call error:", error);
        setLoading(false);
        router.push('/login'); // Redirect on error
      });
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <div>Welcome to the dashboard!</div>;
}
