"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the login page
    router.push('/login');
  }, [router]);

  return null; // Optionally, you could add a loading message or spinner here
}
