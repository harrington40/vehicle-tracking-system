import React, { useEffect } from 'react';
import JsBarcode from 'jsbarcode'; // For generating Code 128 barcodes
import QRCode from 'react-qrcode-logo'; // For QR codes

// Serial Number Generation Logic
const generateSerialNumber = (manufacturerCode, modelCode, countryCode, batchDate, lastId) => {
  const batchNumber = batchDate.getFullYear().toString().slice(2) + 
                      ('0' + (batchDate.getMonth() + 1)).slice(-2) + 
                      ('0' + batchDate.getDate()).slice(-2);
  const uniqueId = ('000000' + lastId).slice(-6);
  return `${manufacturerCode}-${modelCode}-${countryCode}-${batchNumber}-${uniqueId}`;
};

// Barcode/Label Component
const LabelComponent = ({ deviceInfo }) => {
  const manufacturerCode = 'TT';  // From your project specs
  const modelCode = deviceInfo.modelCode || 'VT01';  // From your device info
  const countryCode = deviceInfo.countryCode || 'ZA';  // Example: South Africa
  const batchDate = new Date();  // Current date
  const lastId = deviceInfo.lastId || 1;  // ID for the specific device

  const serialNumber = generateSerialNumber(manufacturerCode, modelCode, countryCode, batchDate, lastId);
  const imeiNumber = deviceInfo.imei || '356938035643809'; // Example IMEI number

  // Generate the barcode after the component renders
  useEffect(() => {
    JsBarcode('#barcode', serialNumber, {
      format: 'CODE128',
      lineColor: '#000',
      width: 2,
      height: 100,
      displayValue: true,
    });
  }, [serialNumber]);

  return (
    <div className="label-container">
      <h1>Trans Tech Vehicle Tracker</h1>
      <h2>Model: {modelCode}</h2>
      <h3>Country: {countryCode}</h3>
      <p>Serial Number: {serialNumber}</p>
      <p>IMEI: {imeiNumber}</p>

      {/* Barcode (Code 128) */}
      <svg id="barcode"></svg>

      {/* QR Code Option */}
      <QRCode
        value={`${serialNumber}-${imeiNumber}`}
        size={150}
        bgColor="#ffffff"
        fgColor="#000000"
        level="L"
      />

      <style jsx>{`
        .label-container {
          text-align: center;
          border: 1px solid #ccc;
          padding: 20px;
          width: 300px;
          margin: 0 auto;
          background-color: #f9f9f9;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        h1 {
          font-size: 20px;
          margin-bottom: 10px;
        }

        p {
          font-size: 14px;
          margin-bottom: 5px;
        }

        svg {
          margin: 20px auto;
        }
      `}</style>
    </div>
  );
};

export default LabelComponent;
 