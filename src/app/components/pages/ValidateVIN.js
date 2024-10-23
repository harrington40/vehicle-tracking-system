function validateVIN(vin) {
    // Check if the length is 17 characters
    if (vin.length !== 17) {
      return { isValid: false, message: "VIN must be exactly 17 characters long." };
    }
  
    // Ensure VIN contains only allowed characters
    const invalidChars = /[IOQioq]/;
    if (invalidChars.test(vin)) {
      return { isValid: false, message: "VIN contains invalid characters (I, O, Q)." };
    }
  
    // VIN weights for each position (excluding the check digit)
    const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
  
    // VIN transliteration map (A = 1, B = 2, etc.)
    const transliteration = {
      A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, J: 1, K: 2, L: 3, M: 4, N: 5,
      P: 7, R: 9, S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
      '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9
    };
  
    // Convert VIN to its numeric value based on transliteration
    const getNumericValue = (char) => transliteration[char.toUpperCase()] || 0;
  
    // Compute weighted sum
    let weightedSum = 0;
    for (let i = 0; i < 17; i++) {
      const char = vin[i];
      weightedSum += getNumericValue(char) * weights[i];
    }
  
    // Calculate check digit (the 9th character in the VIN)
    const remainder = weightedSum % 11;
    const expectedCheckDigit = remainder === 10 ? 'X' : remainder.toString();
  
    // Verify the check digit
    const actualCheckDigit = vin[8].toUpperCase();
    if (actualCheckDigit !== expectedCheckDigit) {
      return { isValid: false, message: "Invalid VIN check digit." };
    }
  
    return { isValid: true, message: "VIN is valid." };
  }
  
  // Example usage
  const vin = "1HGCM82633A123456";
  const result = validateVIN(vin);
  if (result.isValid) {
    console.log("VIN is valid.");
  } else {
    console.log("Invalid VIN: " + result.message);
  }
  