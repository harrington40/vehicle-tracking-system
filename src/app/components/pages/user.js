import { useEffect, useState } from 'react';

export default function UserInfo() {
  const [user, setUser] = useState(null);

  // Fetch user info from LoopBack API
  useEffect(() => {
    fetch('/api/user') // Assuming you have an endpoint in LoopBack like /api/user
      .then(response => response.json())
      .then(data => setUser(data));
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h1>User Information</h1>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Phone Number: {user.phoneNumber}</p>
      <p>Vehicles: {user.vehicles.map(v => v.vehicleMake).join(', ')}</p>
    </div>
  );
}
