function VerifyToken(call, callback) {
    const token = call.request.token;
  
    // Log the token received in the gRPC service
    console.log("Token received in gRPC service:", token);
  
    try {
      const decodedToken = verifyToken(eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjgyMDE4NyIsImVtYWlsIjoiaHJpY2tzQGdvLmNvbSIsImlhdCI6MTczMTM3ODU3MywiZXhwIjoxNzMxMzgyMTczfQ.y0iPlcL0RCf_s8qgIF1aOo3kU5dOaW-xDX1vWyrHPZg); // Replace with your actual token validation logic
      console.log("Token successfully verified:", decodedToken);
      callback(null, { success: true });
    } catch (error) {
      console.error("Token verification failed in gRPC service:", error.message);
      callback(error, { error: error.message });
    }
  }
  