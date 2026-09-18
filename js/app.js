/**
 * DIPU BOYS PG - Receipt Generator JavaScript Application Logic
 * Supports Real-time Binding, Indian Currency Number-to-Words, LocalStorage, PDF Export, and A4 Printing.
 */

// Global State for Particulars
let particulars = [
  { id: 1, name: "Room Rent & Lodging", amount: 6500 }
];

// LocalStorage Keys
const STORAGE_KEY_OWNER = "dipu_boys_pg_owner_details";

// Initialize on DOM Load
document.addEventListener("DOMContentLoaded", () => {
  initDefaults();
  loadSavedOwnerDetails();
  renderParticularsInputs();
  updateReceipt();
});

/**
 * Initialize default date and default values
 */
function initDefaults() {
  const dateInput = document.getElementById("inputDate");
  if (dateInput && !dateInput.value) {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    dateInput.value = `${day}/${month}/${year}`;
  }

  // Initial calculation of amount in words
  handleAmountChange();
}

/**
 * Load saved owner payment details from browser localStorage
 */
function loadSavedOwnerDetails() {
  const savedData = localStorage.getItem(STORAGE_KEY_OWNER);
  const badge = document.getElementById("storageStatusBadge");

  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      if (parsed.paymentTo) document.getElementById("inputPaymentTo").value = parsed.paymentTo;
      if (parsed.upiId) document.getElementById("inputUpiId").value = parsed.upiId;
      
      if (badge) {
        badge.innerHTML = `<i class="fa-solid fa-circle-check"></i> Saved Payment Details Loaded`;
        badge.style.background = "rgba(74, 222, 128, 0.2)";
        badge.style.borderColor = "#4ade80";
      }
    } catch (e) {
      console.error("Error parsing saved owner details", e);
    }
  } else {
    if (badge) {
      badge.innerHTML = `<i class="fa-solid fa-shield-halved"></i> Device Local Storage Ready`;
    }
  }
}

/**
 * Save owner payment details to localStorage
 */
function saveOwnerDetails() {
  const paymentTo = document.getElementById("inputPaymentTo").value.trim();
  const upiId = document.getElementById("inputUpiId").value.trim();

  if (!paymentTo || !upiId) {
    showToast("Please fill both Payment To and UPI ID before saving.", "error");
    return;
  }

  const payload = { paymentTo, upiId, savedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY_OWNER, JSON.stringify(payload));

  const badge = document.getElementById("storageStatusBadge");
  if (badge) {
    badge.innerHTML = `<i class="fa-solid fa-circle-check"></i> Defaults Saved to Device`;
    badge.style.background = "rgba(74, 222, 128, 0.2)";
    badge.style.borderColor = "#4ade80";
  }

  showToast("✓ Payment details saved! They will auto-fill for future receipts.");
}

/**
 * Render dynamic input rows for particulars in form
 */
function renderParticularsInputs() {
  const container = document.getElementById("particularsInputsContainer");
  if (!container) return;

  container.innerHTML = "";

  particulars.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "particular-input-row";
    row.innerHTML = `
      <input type="text" class="item-name" placeholder="Particulars description" value="${escapeHtml(item.name)}" oninput="updateParticularItem(${item.id}, 'name', this.value)">
      <input type="number" class="item-price" placeholder="Amount (₹)" value="${item.amount !== null ? item.amount : ''}" min="0" step="any" oninput="updateParticularItem(${item.id}, 'amount', this.value)">
      ${particulars.length > 1 ? `<button type="button" class="btn-remove-row" onclick="removeParticularRow(${item.id})" title="Remove Line"><i class="fa-solid fa-trash-can"></i></button>` : ''}
    `;
    container.appendChild(row);
  });
}

/**
 * Add a new line to particulars
 */
function addParticularRow() {
  const newId = Date.now();
  particulars.push({ id: newId, name: "", amount: 0 });
  renderParticularsInputs();
  updateReceipt();
}

/**
 * Remove a row from particulars
 */
function removeParticularRow(id) {
  if (particulars.length <= 1) return;
  particulars = particulars.filter(item => item.id !== id);
  renderParticularsInputs();
  calculateAndUpdateTotalFromItems();
}

/**
 * Update particular item state
 */
function updateParticularItem(id, field, value) {
  const item = particulars.find(i => i.id === id);
  if (!item) return;

  if (field === 'name') {
    item.name = value;
  } else if (field === 'amount') {
    item.amount = value === '' ? 0 : parseFloat(value);
    calculateAndUpdateTotalFromItems();
  }

  updateReceipt();
}

/**
 * Auto calculate Total Amount from items list
 */
function calculateAndUpdateTotalFromItems() {
  const sum = particulars.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);
  const totalInput = document.getElementById("inputTotalAmount");
  if (totalInput) {
    totalInput.value = sum > 0 ? sum : '';
  }
  handleAmountChange();
}

/**
 * Handle total amount change to recalculate words
 */
function handleAmountChange() {
  const totalVal = parseFloat(document.getElementById("inputTotalAmount").value) || 0;
  const wordsInput = document.getElementById("inputAmountWords");
  
  if (wordsInput) {
    wordsInput.value = numberToIndianWords(totalVal);
  }

  updateReceipt();
}

/**
 * Main function to synchronize Form values to the Printable Receipt Canvas
 */
function updateReceipt() {
  // 1. Date & Resident Info
  const dateVal = document.getElementById("inputDate").value || "--";
  const nameVal = document.getElementById("inputResidentName").value || "--";
  const periodVal = document.getElementById("inputPeriod").value || "--";

  document.getElementById("previewDate").innerText = dateVal;
  document.getElementById("previewResidentName").innerText = nameVal;
  document.getElementById("previewPeriod").innerText = periodVal;

  // 2. Particulars List
  const listContainer = document.getElementById("previewParticularsList");
  if (listContainer) {
    listContainer.innerHTML = "";
    
    if (particulars.length === 0 || (particulars.length === 1 && !particulars[0].name && !particulars[0].amount)) {
      listContainer.innerHTML = `
        <div class="particular-row-item">
          <span class="item-desc">Room Rent & Lodging</span>
          <span class="item-amt">--</span>
        </div>
      `;
    } else {
      particulars.forEach(item => {
        const itemRow = document.createElement("div");
        itemRow.className = "particular-row-item";
        const formattedAmt = item.amount ? `₹ ${formatCurrency(item.amount)}` : "--";
        itemRow.innerHTML = `
          <span class="item-desc">${escapeHtml(item.name || "Payment Charges")}</span>
          <span class="item-amt">${formattedAmt}</span>
        `;
        listContainer.appendChild(itemRow);
      });
    }
  }

  // 3. Total Paid & Amount in Words
  const totalVal = parseFloat(document.getElementById("inputTotalAmount").value) || 0;
  const totalDisplay = totalVal > 0 ? `₹ ${formatCurrency(totalVal)}/-` : "₹ 0/-";
  document.getElementById("previewTotalAmount").innerText = totalDisplay;

  const wordsVal = document.getElementById("inputAmountWords").value || numberToIndianWords(totalVal);
  document.getElementById("previewAmountWords").innerText = wordsVal;

  // 4. Payment Details Box
  const paymentToVal = document.getElementById("inputPaymentTo").value || "DIPU BOYS PG";
  const upiIdVal = document.getElementById("inputUpiId").value || "dipuboyspg01@cnrb";
  const txnIdVal = document.getElementById("inputTxnId").value.trim();
  const modeVal = document.getElementById("inputPaymentMode").value;

  document.getElementById("previewPaymentTo").innerText = paymentToVal;
  document.getElementById("previewUpiId").innerText = upiIdVal;

  // Txn ID row visibility & value
  const txnRow = document.getElementById("previewTxnRow");
  if (txnIdVal) {
    txnRow.style.display = "flex";
    document.getElementById("previewTxnId").innerText = txnIdVal;
  } else {
    txnRow.style.display = "none";
  }

  // Payment Mode row visibility
  const modeRow = document.getElementById("previewModeRow");
  if (modeVal) {
    modeRow.style.display = "flex";
    document.getElementById("previewPaymentMode").innerText = modeVal;
  } else {
    modeRow.style.display = "none";
  }
}

/**
 * Generate Receipt Action (Triggers update & mobile tab view)
 */
function generateReceiptAction() {
  updateReceipt();
  
  // Highlight preview animation
  const paper = document.getElementById("receiptDocument");
  if (paper) {
    paper.style.transition = "transform 0.2s ease, box-shadow 0.2s ease";
    paper.style.transform = "scale(1.01)";
    paper.style.boxShadow = "0 0 20px rgba(22, 50, 79, 0.4)";
    setTimeout(() => {
      paper.style.transform = "scale(1)";
      paper.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.2)";
    }, 400);
  }

  // Switch to preview tab if on mobile
  if (window.innerWidth <= 768) {
    switchMobileTab("preview");
  }

  showToast("✨ Receipt updated successfully!");
}

/**
 * Download High-Quality A4 PDF using html2pdf
 */
function downloadPDF() {
  updateReceipt();
  const element = document.getElementById("receiptDocument");
  const residentName = document.getElementById("inputResidentName").value.trim() || "Resident";
  const dateStr = document.getElementById("inputDate").value.replace(/[\/\\]/g, "-") || "receipt";

  const filename = `DIPU_BOYS_PG_Receipt_${residentName.replace(/\s+/g, "_")}_${dateStr}.pdf`;

  showToast("⏳ Generating high-quality PDF...");

  const opt = {
    margin: [8, 8, 8, 8],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 3, // High DPI scaling for crisp text
      useCORS: true,
      logging: false
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'landscape'
    }
  };

  html2pdf().set(opt).from(element).save().then(() => {
    showToast("✓ PDF downloaded successfully!");
  }).catch(err => {
    console.error("PDF generation failed:", err);
    showToast("Error generating PDF. Triggering print window as fallback.", "error");
    window.print();
  });
}

/**
 * Print Receipt via browser modal
 */
function printReceipt() {
  updateReceipt();
  window.print();
}

/**
 * Reset form to initial state (preserves saved owner payment info)
 */
function resetForm() {
  if (!confirm("Are you sure you want to reset the receipt form?")) return;

  document.getElementById("inputResidentName").value = "";
  document.getElementById("inputTxnId").value = "";
  document.getElementById("inputPeriod").value = "01/09/2026 to 30/09/2026";
  
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  document.getElementById("inputDate").value = `${day}/${month}/${today.getFullYear()}`;

  particulars = [{ id: Date.now(), name: "Room Rent & Lodging", amount: 6500 }];
  renderParticularsInputs();
  handleAmountChange();
  updateReceipt();

  showToast("🔄 Form reset to default values.");
}

/**
 * Mobile tab switching logic
 */
function switchMobileTab(tab) {
  const formPanel = document.getElementById("formPanel");
  const previewPanel = document.getElementById("previewPanel");
  const tabFormBtn = document.getElementById("tabFormBtn");
  const tabPreviewBtn = document.getElementById("tabPreviewBtn");

  if (tab === "form") {
    formPanel.classList.remove("hidden-mobile");
    previewPanel.classList.add("hidden-mobile");
    tabFormBtn.classList.add("active");
    tabPreviewBtn.classList.remove("active");
  } else {
    formPanel.classList.add("hidden-mobile");
    previewPanel.classList.remove("hidden-mobile");
    tabFormBtn.classList.remove("active");
    tabPreviewBtn.classList.add("active");
  }
}

/**
 * Convert number to Indian Rupee Words (e.g. 6500 -> "Six Thousand Five Hundred Rupees Only")
 */
function numberToIndianWords(num) {
  if (num === 0 || isNaN(num) || num === null) return "Zero Rupees Only";

  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n) {
    if ((n = n.toString()).length > 9) return 'Overflow';
    let n_array = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n_array) return '';
    let str = '';
    str += (n_array[1] != 0) ? (a[Number(n_array[1])] || b[n_array[1][0]] + ' ' + a[n_array[1][1]]) + 'Crore ' : '';
    str += (n_array[2] != 0) ? (a[Number(n_array[2])] || b[n_array[2][0]] + ' ' + a[n_array[2][1]]) + 'Lakh ' : '';
    str += (n_array[3] != 0) ? (a[Number(n_array[3])] || b[n_array[3][0]] + ' ' + a[n_array[3][1]]) + 'Thousand ' : '';
    str += (n_array[4] != 0) ? (a[Number(n_array[4])] || b[n_array[4][0]] + ' ' + a[n_array[4][1]]) + 'Hundred ' : '';
    str += (n_array[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n_array[5])] || b[n_array[5][0]] + ' ' + a[n_array[5][1]]) : '';
    return str;
  }

  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  let result = inWords(integerPart).trim() + " Rupees";
  if (decimalPart > 0) {
    result += " and " + inWords(decimalPart).trim() + " Paise";
  }
  result += " Only";

  return result;
}

/**
 * Format currency with Indian comma separators (e.g. 6500 -> 6,500.00)
 */
function formatCurrency(amount) {
  const num = parseFloat(amount);
  if (isNaN(num)) return "0.00";
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Toast Notification Utility
 */
function showToast(message, type = "success") {
  const toast = document.getElementById("toastNotification");
  const msgEl = document.getElementById("toastMessage");

  if (!toast || !msgEl) return;

  msgEl.innerText = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3500);
}

/**
 * Helper to escape HTML characters
 */
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}
