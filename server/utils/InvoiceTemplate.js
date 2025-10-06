export const invoiceTemplate = (invoiceData) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Invoice - Solvit</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      body {
        font-family: 'Inter', sans-serif;
        margin: 0;
        padding: 0;
        /* Ensures background doesn’t exceed print area */
        background: #fff;
      }
      .invoice-box {
        width: 210mm;
        height: 297mm;
        margin: 0 auto;
        padding: 0;
        box-sizing: border-box;
        background: #fff;
        display: flex;
        flex-direction: column;
        /* Remove shadow/border for print */
      }
      .inner-content {
        padding: 18mm 14mm 13mm 14mm;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
      }
      .header-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 10mm;
      }
      .header-content {
        flex: 2;
      }
      .logo-container {
        flex: 1;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        height: 100px;
      }
      .logo-img {
        max-height: 80px;
        width: auto;
        object-fit: contain;
        padding-left: 25px;
      }
      .table-header {
        background: #1f2937;
        color: #fff;
      }
      .table-row:nth-child(even) {
        background: #f9fafb;
      }
      .totals-table tr:hover {
        background: #f1f5f9;
      }
      @media print {
        body {
          margin: 0;
        }
        .invoice-box {
          box-shadow: none;
          border: none;
        }
      }
    </style>
  </head>
  <body class="bg-white">
    <div class="invoice-box">
      <div class="inner-content">
        <!-- Header -->
        <div class="header-container">
          <div class="header-content">
            <h1 class="text-3xl font-bold text-red-600">TAX INVOICE</h1>
            <div class="mt-1 text-gray-600 text-xs leading-relaxed">
              <p class="font-semibold">Solvit</p>
              <p>123 MG Road, Bangalore, India</p>
              <p>CIN: L12345KA2025PTC0001 | GST: 29ABCDE1234F1Z5</p>
              <p>Email: support@solvit.com | Phone: +91-9876543210</p>
            </div>
          </div>
          <div class="logo-container">
            <img src="https://res.cloudinary.com/dwraqe5qy/image/upload/v1755358914/logo_ml6sdz.png"
              alt="Solvit Logo"
              class="logo-img"
              style="max-height:120px; min-height:80px;"
            />
          </div>
        </div>

        <!-- Invoice Metadata -->
        <div class="mb-4">
          <h3 class="text-base font-semibold text-gray-800 border-b border-gray-200 pb-1 mb-2">Invoice Details</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
            <p><span class="font-medium">Invoice Number:</span> ${invoiceData.invoiceNumber}</p>
            <p><span class="font-medium">Invoice Date:</span> ${invoiceData.invoiceDate}</p>
          </div>
        </div>

        <!-- Client Details -->
        <div class="mb-4">
          <h3 class="text-base font-semibold text-gray-800 border-b border-gray-200 pb-1 mb-2">Bill To</h3>
          <div class="text-xs text-gray-600 leading-relaxed">
            <p>${invoiceData.clientName}</p>
            <p>${invoiceData.clientEmail}</p>
            <p>${invoiceData.clientPhone}</p>
            ${invoiceData.clientAddress ? `<p>${invoiceData.clientAddress}</p>` : ''}
          </div>
        </div>

        <!-- Line Items -->
        <div class="mb-4">
          <h3 class="text-base font-semibold text-gray-800 border-b border-gray-200 pb-1 mb-2">Services</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-gray-600">
              <thead>
                <tr class="table-header">
                  <th class="py-2 px-3 text-left font-semibold">Description</th>
                  <th class="py-2 px-3 text-left font-semibold">Date/Time</th>
                  <th class="py-2 px-3 text-left font-semibold">Duration</th>
                  <th class="py-2 px-3 text-left font-semibold">Rate</th>
                  <th class="py-2 px-3 text-left font-semibold">Qty</th>
                  <th class="py-2 px-3 text-left font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${invoiceData.items
                  .map(
                    (item) => `
                  <tr class="table-row border-b border-gray-200">
                    <td class="py-2 px-3">${item.description}</td>
                    <td class="py-2 px-3">${item.dateTime}</td>
                    <td class="py-2 px-3">${item.duration}</td>
                    <td class="py-2 px-3">₹${item.rate}</td>
                    <td class="py-2 px-3">${item.quantity}</td>
                    <td class="py-2 px-3">₹${item.amount}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Totals -->
        <div class="mb-4">
          <table class="totals-table w-full sm:w-1/2 ml-auto text-xs text-gray-600">
            <tr class="border-b border-gray-200">
              <td class="py-1 px-3 font-medium">Subtotal</td>
              <td class="py-1 px-3 text-right">₹${invoiceData.subtotal}</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="py-1 px-3 font-medium">GST (${invoiceData.taxRate || 0}%)</td>
              <td class="py-1 px-3 text-right">₹${invoiceData.taxAmount || 0}</td>
            </tr>
            ${
              invoiceData.discount
                ? `
            <tr class="border-b border-gray-200">
              <td class="py-1 px-3 font-medium">Discount</td>
              <td class="py-1 px-3 text-right text-red-500">-₹${invoiceData.discount}</td>
            </tr>`
                : ''
            }
            <tr>
              <td class="py-1 px-3 font-semibold text-gray-800">Total</td>
              <td class="py-1 px-3 text-right font-semibold text-gray-800">₹${invoiceData.total}</td>
            </tr>
          </table>
        </div>

        <!-- Payment Info -->
        <div class="mb-4">
          <h3 class="text-base font-semibold text-gray-800 border-b border-gray-200 pb-1 mb-2">Payment Info</h3>
          <div class="text-xs text-gray-600 leading-relaxed">
            <p><span class="font-medium">Method:</span> ${invoiceData.paymentMethod}</p>
            <p><span class="font-medium">Transaction ID:</span> ${invoiceData.paymentId}</p>
            <p><span class="font-medium">Status:</span> <span class="${invoiceData.paymentStatus === 'Paid' ? 'text-green-600' : 'text-yellow-600'}">${invoiceData.paymentStatus}</span></p>
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t border-gray-200 pt-3 text-center text-xs text-gray-500">
          <p>This is a computer-generated invoice. No signature required.</p>
          <p>Refund Policy: ${invoiceData.refundPolicy || 'No refunds after service delivery.'}</p>
          <p class="mt-1 font-medium text-gray-600">Thank you for choosing Solvit!</p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
};
