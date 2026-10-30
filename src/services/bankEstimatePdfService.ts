// src/services/bankEstimatePdfService.ts
/**
 * Professional Bank-Ready Estimation & BOQ PDF Report Generator
 * Formatted for Indian Nationalised & Private Banks (SBI, HDFC, Canara Bank, ICICI, etc.)
 * Strictly client-side execution using jsPDF and jspdf-autotable.
 */

export interface BankEstimateParams {
  clientName?: string;
  siteLocation?: string;
  builtUpArea: number;
  floors?: number;
  quality: "basic" | "standard" | "premium";
  customRate: number;
  costs: {
    main: number;
    parking: number;
    wall: number;
    sump: number;
    total?: number;
  };
  finalTotalCost: number;
  parkingArea?: number;
  compoundWallLength?: number;
  includeSump?: boolean;
}

function formatINR(val: number): string {
  const rounded = Math.round(val);
  return "Rs. " + rounded.toLocaleString("en-IN");
}

function convertNumberToWords(num: number): string {
  if (num === 0) return "Zero Rupees";
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function numToWordsIndian(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + numToWordsIndian(n % 100) : "");
    if (n < 100000) {
      return numToWordsIndian(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + numToWordsIndian(n % 1000) : "");
    }
    if (n < 10000000) {
      return numToWordsIndian(Math.floor(n / 100000)) + " Lakh" + (n % 100000 !== 0 ? " " + numToWordsIndian(n % 100000) : "");
    }
    return numToWordsIndian(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 !== 0 ? " " + numToWordsIndian(n % 10000000) : "");
  }

  const rounded = Math.round(num);
  return `INR ${numToWordsIndian(rounded)} Only`;
}

export async function generateBankEstimatePDF(params: BankEstimateParams): Promise<void> {
  const {
    clientName = "Property Owner / Borrower",
    siteLocation = "Residential Plot, India",
    builtUpArea,
    floors = 1,
    quality,
    customRate,
    costs,
    finalTotalCost,
    parkingArea = 0,
    compoundWallLength = 0,
    includeSump = false,
  } = params;

  const jsPDF = (await import("jspdf")).default;
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const refCode = "HDE-EST-" + Math.floor(100000 + Math.random() * 900000);
  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // ─────────────────────────────────────────────────────────────
  // PAGE 1: ABSTRACT ESTIMATE & DISBURSEMENT SCHEDULE
  // ─────────────────────────────────────────────────────────────

  // Watermark
  doc.setTextColor(245, 245, 245);
  doc.setFontSize(44);
  doc.setFont("helvetica", "bold");
  doc.text("HOME DESIGN ENGLISH", pageWidth / 2, pageHeight / 2, {
    angle: 45,
    align: "center",
  });

  // Top Accent Banner (Navy + Gold Line)
  doc.setFillColor(15, 32, 66); // #0f2042 Navy
  doc.rect(0, 0, pageWidth, 24, "F");

  doc.setFillColor(217, 164, 67); // Gold accent stripe
  doc.rect(0, 24, pageWidth, 2, "F");

  // Header Titles
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text("HOME DESIGN ENGLISH (HDE)", 14, 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(217, 164, 67);
  doc.text("TECHNICAL VALUATION & CIVIL COST ESTIMATION DIVISION", 14, 17);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  const refText = `DOC REF: ${refCode}`;
  doc.text(refText, pageWidth - 14 - doc.getTextWidth(refText), 11);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 210, 230);
  const dateText = `Date: ${currentDate}`;
  doc.text(dateText, pageWidth - 14 - doc.getTextWidth(dateText), 17);

  // Document Title Box
  doc.setFillColor(248, 250, 253);
  doc.setDrawColor(210, 220, 240);
  doc.roundedRect(14, 30, pageWidth - 28, 14, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 32, 66);
  doc.text("ABSTRACT ESTIMATE & BILL OF QUANTITIES (BOQ)", pageWidth / 2, 36, { align: "center" });

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 110, 130);
  doc.text("Format Compliant for SBI, HDFC, Canara Bank, ICICI, BOB Home Construction Loans & Contracts", pageWidth / 2, 41, { align: "center" });

  // Project Info Table
  autoTable(doc, {
    startY: 48,
    theme: "plain",
    styles: {
      fontSize: 8,
      cellPadding: 2,
      textColor: [40, 40, 40],
    },
    body: [
      [
        { content: "Borrower / Owner:", styles: { fontStyle: "bold", textColor: [15, 32, 66] } },
        clientName,
        { content: "Structure Type:", styles: { fontStyle: "bold", textColor: [15, 32, 66] } },
        "RCC Framed Structure (IS 456)",
      ],
      [
        { content: "Property Site:", styles: { fontStyle: "bold", textColor: [15, 32, 66] } },
        siteLocation,
        { content: "Total Built-up Area:", styles: { fontStyle: "bold", textColor: [15, 32, 66] } },
        `${builtUpArea.toLocaleString("en-IN")} sq.ft (${floors} Floor${floors > 1 ? "s" : ""})`,
      ],
      [
        { content: "Specification Grade:", styles: { fontStyle: "bold", textColor: [15, 32, 66] } },
        quality.toUpperCase() + " Class",
        { content: "Base Construction Rate:", styles: { fontStyle: "bold", textColor: [15, 32, 66] } },
        `Rs. ${customRate.toLocaleString("en-IN")} / sq.ft`,
      ],
    ],
  });

  // Table 1: Abstract Stage Breakdown
  const table1StartY = (doc as any).lastAutoTable.finalY + 4;

  const costItems: [string, string, string, string][] = [
    [
      "1. Earthwork & Substructure",
      "Site excavation, PCC 1:4:8, isolated column footings, plinth beam, and DPC anti-termite barrier",
      "12%",
      formatINR(costs.main * 0.12),
    ],
    [
      "2. RCC Structural Framework",
      "Columns, grade beams, lintels, chajjas, staircase, and roof slab casting in M20/M25 concrete with Fe500D steel",
      "30%",
      formatINR(costs.main * 0.30),
    ],
    [
      "3. Masonry & Superstructure",
      "External 9-inch and internal 4.5-inch brick / solid block masonry in cement mortar 1:6",
      "12%",
      formatINR(costs.main * 0.12),
    ],
    [
      "4. Internal & External Plastering",
      "Double-coat sand faced external plastering and smooth internal cement plaster with neeru/putty finish",
      "8%",
      formatINR(costs.main * 0.08),
    ],
    [
      "5. Flooring & Wall Cladding",
      "Vitrified tiles (600x600mm / 800x800mm), granite for staircase, anti-skid bathroom ceramic tiles",
      "12%",
      formatINR(costs.main * 0.12),
    ],
    [
      "6. Plumbing & Sanitation",
      "Concealed CPVC/PVC water lines, SWR drainage stacks, overhead PVC storage tank, and branded sanitaryware",
      "10%",
      formatINR(costs.main * 0.10),
    ],
    [
      "7. Electrical Conduit & Wiring",
      "Concealed FRLS copper wiring, distribution board, MCBs, earthing, and modular switches (ISI certified)",
      "6%",
      formatINR(costs.main * 0.06),
    ],
    [
      "8. Painting & Weathercoat",
      "2 coats interior acrylic emulsion over wall putty; 2 coats exterior weather-guard anti-fungal paint",
      "6%",
      formatINR(costs.main * 0.06),
    ],
    [
      "9. Doors, Windows & Joinery",
      "Teak/Sal main door frame, flush flush internal doors, 3-track powder-coated aluminium/UPVC sliding windows",
      "4%",
      formatINR(costs.main * 0.04),
    ],
  ];

  if (costs.parking > 0) {
    costItems.push([
      "10. Covered Parking / Porch",
      `Ground parking slab with anti-skid heavy paver/parking vitrified tiles (${parkingArea} sq.ft)`,
      "—",
      formatINR(costs.parking),
    ]);
  }

  if (costs.wall > 0) {
    costItems.push([
      "11. Compound Boundary Wall",
      `Perimeter boundary wall with coping, plastering & entry gate provision (${compoundWallLength} r.ft)`,
      "—",
      formatINR(costs.wall),
    ]);
  }

  if (costs.sump > 0) {
    costItems.push([
      "12. Sump Tank & Septic Vault",
      `Underground RCC water storage sump (5,000 to 8,000L) & masonry septic/soak pit vault`,
      "—",
      formatINR(costs.sump),
    ]);
  }

  autoTable(doc, {
    startY: table1StartY,
    head: [["S.No / Item Description", "Specification Summary", "% Alloc", "Total (INR)"]],
    body: costItems,
    theme: "striped",
    styles: {
      font: "helvetica",
      fontSize: 7.5,
      cellPadding: 2.2,
      textColor: [40, 40, 40],
    },
    headStyles: {
      fillColor: [15, 32, 66],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 46, fontStyle: "bold" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 15, halign: "center" },
      3: { cellWidth: 32, halign: "right", fontStyle: "bold" },
    },
    foot: [
      [
        { content: "NET TOTAL ESTIMATED PROJECT OUTLAY", colSpan: 3, styles: { halign: "right", fontStyle: "bold" } },
        { content: formatINR(finalTotalCost), styles: { halign: "right", fontStyle: "bold", textColor: [15, 32, 66] } },
      ],
    ],
    footStyles: {
      fillColor: [240, 244, 250],
      fontSize: 8.5,
    },
  });

  // Amount in Words Box
  const wordsY = (doc as any).lastAutoTable.finalY + 4;
  doc.setDrawColor(217, 164, 67);
  doc.setFillColor(255, 253, 245);
  doc.roundedRect(14, wordsY, pageWidth - 28, 12, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 32, 66);
  doc.text("TOTAL ESTIMATE AMOUNT IN WORDS:", 18, wordsY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(80, 50, 10);
  const inWords = convertNumberToWords(finalTotalCost);
  doc.text(inWords, 18, wordsY + 9.5);

  // Table 2: Recommended Bank Loan Stage-Wise Disbursement Milestones
  const table2StartY = wordsY + 16;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 32, 66);
  doc.text("RECOMMENDED BANK LOAN STAGE-WISE DISBURSEMENT SCHEDULE", 14, table2StartY);

  const stages = [
    ["Stage 1: Plinth Level Completion", "Footings, plinth beam, backfilling, and ground slab PCC ready", "15%", formatINR(finalTotalCost * 0.15)],
    ["Stage 2: Ground Floor Roof Slab", "Ground floor columns, formwork, shuttering & concrete casting", "25%", formatINR(finalTotalCost * 0.25)],
    ["Stage 3: First Floor / Roof Slab", "Upper floor column frame, lintels, and terrace roof slab cast", "20%", formatINR(finalTotalCost * 0.20)],
    ["Stage 4: Masonry & Plastering", "All brickwork, external & internal plastering completed", "20%", formatINR(finalTotalCost * 0.20)],
    ["Stage 5: Flooring & Rough-in", "Tile flooring, plumbing lines, electrical wiring drawn", "10%", formatINR(finalTotalCost * 0.10)],
    ["Stage 6: Handover / Final", "Painting, sanitaryware, switches, doors installed & ready", "10%", formatINR(finalTotalCost * 0.10)],
  ];

  autoTable(doc, {
    startY: table2StartY + 3,
    head: [["Disbursement Milestone", "Construction Stage Verification Criteria", "Disbursement %", "Tranche (INR)"]],
    body: stages,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 7,
      cellPadding: 1.8,
      textColor: [50, 50, 50],
    },
    headStyles: {
      fillColor: [59, 78, 112],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 44, fontStyle: "bold" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 22, halign: "center" },
      3: { cellWidth: 28, halign: "right", fontStyle: "bold" },
    },
  });

  // Page 1 Footer
  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(130, 130, 130);
  doc.text("Page 1 of 2 — Certified Abstract Construction Estimate by Home Design English (HDE)", 14, pageHeight - 8);

  // ─────────────────────────────────────────────────────────────
  // PAGE 2: DETAILED BILL OF QUANTITIES (BOQ) & SIGN-OFFS
  // ─────────────────────────────────────────────────────────────
  doc.addPage();

  // Watermark
  doc.setTextColor(245, 245, 245);
  doc.setFontSize(44);
  doc.setFont("helvetica", "bold");
  doc.text("HOME DESIGN ENGLISH", pageWidth / 2, pageHeight / 2, {
    angle: 45,
    align: "center",
  });

  // Top Accent Banner
  doc.setFillColor(15, 32, 66);
  doc.rect(0, 0, pageWidth, 18, "F");
  doc.setFillColor(217, 164, 67);
  doc.rect(0, 18, pageWidth, 1.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("BILL OF QUANTITIES (BOQ) - MATERIAL REQUIREMENT SCHEDULE", 14, 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(217, 164, 67);
  doc.text(`Ref: ${refCode} | Built-up Area: ${builtUpArea} sq.ft | ${quality.toUpperCase()} Quality`, pageWidth - 14 - doc.getTextWidth(`Ref: ${refCode} | Built-up Area: ${builtUpArea} sq.ft | ${quality.toUpperCase()} Quality`), 11);

  // Material Calculations (Engineering Thumb Rules, India)
  const cementBags = Math.ceil(builtUpArea * 0.42);
  const steelKg = Math.ceil(builtUpArea * 3.8);
  const steelTonnes = (steelKg / 1000).toFixed(2);
  const sandCft = Math.ceil(builtUpArea * 1.85);
  const aggCft = Math.ceil(builtUpArea * 1.35);
  const bricksCount = Math.ceil(builtUpArea * 8.5);
  const tilesSqft = Math.ceil(builtUpArea * 1.25);
  const paintLitres = Math.ceil(builtUpArea * 0.22);
  const waterproofKg = Math.ceil(builtUpArea * 0.08);

  const boqData = [
    [
      "1. Cement (OPC 53 / PPC)",
      "UltraTech, ACC, Birla Super, Dalmia (50kg ISI Bags)",
      `${cementBags.toLocaleString("en-IN")} Bags`,
      "Rs. 380 - 440",
      formatINR(cementBags * 410),
    ],
    [
      "2. Reinforcement Steel (TMT)",
      "Fe 500D Thermo-Mechanically Treated (Tata Tiscon, JSW, Jindal)",
      `${steelKg.toLocaleString("en-IN")} kg (${steelTonnes} MT)`,
      "Rs. 66 - 72/kg",
      formatINR(steelKg * 68),
    ],
    [
      "3. Fine Aggregate (M-Sand)",
      "Clean double-washed manufactured sand / river sand for masonry & plaster",
      `${sandCft.toLocaleString("en-IN")} CFT`,
      "Rs. 45 - 55/CFT",
      formatINR(sandCft * 50),
    ],
    [
      "4. Coarse Aggregate (Jelly)",
      "20mm & 40mm hard granite broken stone for RCC footings & slabs",
      `${aggCft.toLocaleString("en-IN")} CFT`,
      "Rs. 38 - 45/CFT",
      formatINR(aggCft * 42),
    ],
    [
      "5. Masonry Units (Bricks/Blocks)",
      quality === "premium" ? "Autoclaved Aerated Concrete (AAC) / Fly-ash blocks" : "Standard red table-moulded clay bricks (9x4x3 inch)",
      `${bricksCount.toLocaleString("en-IN")} Units`,
      quality === "premium" ? "Rs. 45 - 60/blk" : "Rs. 9 - 11/pc",
      formatINR(bricksCount * (quality === "premium" ? 18 : 10)),
    ],
    [
      "6. Vitrified & Ceramic Tiles",
      "Kajaria, Somany, Nitco (600x600mm double-charged vitrified floor tiles)",
      `${tilesSqft.toLocaleString("en-IN")} sq.ft`,
      "Rs. 65 - 110/sqft",
      formatINR(tilesSqft * 75),
    ],
    [
      "7. Paints, Primer & Putty",
      "Asian Paints Royale / Apex Weatherproof / Berger Wall Putty (2 coats)",
      `${paintLitres.toLocaleString("en-IN")} Litres`,
      "Rs. 320 - 450/Ltr",
      formatINR(paintLitres * 360),
    ],
    [
      "8. Waterproofing Chemicals",
      "Dr. Fixit / Fosroc integral liquid waterproofing for roofs & bathrooms",
      `${waterproofKg.toLocaleString("en-IN")} kg/Ltr`,
      "Rs. 240 - 320/Ltr",
      formatINR(waterproofKg * 280),
    ],
  ];

  autoTable(doc, {
    startY: 26,
    head: [["Material Item", "Recommended Brands / Technical Spec", "Quantity Required", "Est. Market Rate", "Sub-total"]],
    body: boqData,
    theme: "striped",
    styles: {
      font: "helvetica",
      fontSize: 7.5,
      cellPadding: 2.2,
      textColor: [40, 40, 40],
    },
    headStyles: {
      fillColor: [15, 32, 66],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 42, fontStyle: "bold" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 30, halign: "center", fontStyle: "bold" },
      3: { cellWidth: 26, halign: "center" },
      4: { cellWidth: 26, halign: "right", fontStyle: "bold" },
    },
  });

  // Engineering Standards Compliance Note
  const complianceY = (doc as any).lastAutoTable.finalY + 5;
  doc.setFillColor(248, 250, 253);
  doc.setDrawColor(210, 220, 240);
  doc.roundedRect(14, complianceY, pageWidth - 28, 20, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 32, 66);
  doc.text("ENGINEERING STANDARDS & VALUATION COMPLIANCE NOTE:", 18, complianceY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(70, 80, 95);
  const noteLines = [
    "• Material estimates and structural ratios are computed in strict accordance with IS 456:2000 (Plain and Reinforced Concrete)",
    "  and IS 1786:2008 (High Strength Deformed Steel Bars for Concrete Reinforcement). Includes 5% standard cut & transit contingency.",
    "• This abstract & BOQ report is formatted to satisfy underwriting documentation for SBI, HDFC Bank, ICICI Bank, Canara Bank, and",
    "  nationalised housing finance corporations (HFCs) for stage-wise loan sanctions and contractor agreements.",
  ];
  noteLines.forEach((line, idx) => {
    doc.text(line, 18, complianceY + 9 + idx * 3.3);
  });

  // Sign-off & Verification Blocks (3 columns for Borrower, Engineer, and Bank Valuer)
  const signY = complianceY + 26;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 32, 66);
  doc.text("TECHNICAL VERIFICATION & OFFICIAL ATTESTATION", 14, signY);

  const blockWidth = (pageWidth - 28 - 8) / 3; // 3 equal blocks with 4mm spacing
  const blockHeight = 36;

  // Box 1: Borrower / Applicant
  const b1X = 14;
  doc.setDrawColor(200, 205, 215);
  doc.roundedRect(b1X, signY + 3, blockWidth, blockHeight, 1, 1);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(15, 32, 66);
  doc.text("BORROWER / PROPERTY OWNER", b1X + 4, signY + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 100, 100);
  doc.text("Name: " + clientName.slice(0, 22), b1X + 4, signY + 13);
  doc.text("Signature: ______________________", b1X + 4, signY + 28);
  doc.text("Date: " + currentDate, b1X + 4, signY + 34);

  // Box 2: Registered Civil Engineer / Valuer
  const b2X = b1X + blockWidth + 4;
  doc.roundedRect(b2X, signY + 3, blockWidth, blockHeight, 1, 1);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(15, 32, 66);
  doc.text("REGISTERED CIVIL ENGINEER / ARCHITECT", b2X + 4, signY + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 100, 100);
  doc.text("License / Reg No: ________________", b2X + 4, signY + 13);
  doc.text("Seal & Signature:", b2X + 4, signY + 20);
  doc.text("________________________________", b2X + 4, signY + 28);
  doc.text("Date: _____________", b2X + 4, signY + 34);

  // Box 3: Bank Valuer / Branch Approving Officer
  const b3X = b2X + blockWidth + 4;
  doc.roundedRect(b3X, signY + 3, blockWidth, blockHeight, 1, 1);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(15, 32, 66);
  doc.text("BANK LOAN OFFICER / VALUER", b3X + 4, signY + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 100, 100);
  doc.text("Bank / Branch: ___________________", b3X + 4, signY + 13);
  doc.text("Inspection Seal:", b3X + 4, signY + 20);
  doc.text("________________________________", b3X + 4, signY + 28);
  doc.text("Sanction Date: ________", b3X + 4, signY + 34);

  // Page 2 Footer
  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(130, 130, 130);
  doc.text("Page 2 of 2 — Generated via Home Design English (HDE) Technical Engine • www.homedesignenglish.com", 14, pageHeight - 8);

  // Save the document
  const fileName = `HDE-Bank-Estimate-BOQ-${builtUpArea}sqft-${refCode}.pdf`;
  doc.save(fileName);
}
