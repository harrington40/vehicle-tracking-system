const streamVehicleUpdates = () => {
    const eventSource = new EventSource('/api/streamVehicleUpdates');
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Vehicle Update:', data);
    };
  };
  