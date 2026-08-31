"use client";
import { useState } from 'react';
import { useRouter } from "next/navigation";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '../config/supabaseClient';
import { useUser } from '../context/UserContext';
import { ProjectService } from '../services/projectService';
import { useToast } from '../context/ToastContext';

export const useProjectActions = (projectType: string) => {
  const { user, credits, planTier, refreshProfile } = useUser();
  const navigate = useRouter();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // --- 1. SAVE PROJECT LOGIC ---
  const saveProject = async (data: any, totalCost: number) => {
    if (!user) {
      showToast("Please sign in to save projects", "info");
      navigate.push('/signin');
      return;
    }

    // Client-side quick check for non-Pro users to avoid unnecessary DB calls
    if (planTier !== 'pro' && credits <= 0) {
      showToast("No credits remaining. Please upgrade your plan.", "error");
      navigate.push('/upgrade');
      return;
    }

    const name = prompt("Enter a name for this project:");
    if (!name) return;

    setIsSaving(true);
    try {
      // Step 1: Call the RPC function FIRST to verify usage limits and deduct credits
      // This ensures we don't save a project if the user has reached their daily/monthly cap
      const { error: rpcError } = await supabase.rpc('deduct_project_credit', {
        user_uuid: user.id
      });

      if (rpcError) {
        // Handle specific Pro limit errors from the SQL function
        if (rpcError.message.includes("limit")) {
          showToast(rpcError.message, "error");
          return;
        }
        // Handle standard credit exhaustion
        if (rpcError.message.includes("Insufficient credits")) {
          showToast("Insufficient credits. Redirecting to upgrade page...", "error");
          navigate.push('/upgrade');
          return;
        }
        throw rpcError;
      }

      // Step 2: Save project data after successful credit validation/deduction
      await ProjectService.save({
        user_id: user.id,
        name,
        type: projectType,
        data: { ...data, totalCost },
        date: new Date().toISOString(),
      });

      // Step 3: Refresh local profile to update the UI counters (credits, usage counts)
      await refreshProfile();

      // Step 4: Clear the temporary auto-saved draft
      try {
        const key = `hde_draft_${user.id}_${projectType}`;
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key);
        }
      } catch (err) {
        console.warn("Failed to clear draft after save:", err);
      }
      
      showToast("Project saved successfully!", "success");
    } catch (error: any) {
      console.error("Save error:", error);
      showToast(error.message || "Failed to save project.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // --- 2. ORIGINAL IMAGE-BASED PDF (Fallback) ---
  const downloadPDF = async (elementRef: React.RefObject<HTMLElement>, fileName: string) => {
    if (!elementRef.current) return;
    setIsDownloading(true);
    showToast("Generating PDF...", "info");
    
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      const canvas = await html2canvas(elementRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${fileName}.pdf`);
      showToast("PDF downloaded successfully!", "success");
    } catch (error) {
      console.error("PDF Error", error);
      showToast("Failed to generate PDF.", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  // --- Helper: Convert Number to Words (Region-aware) ---
  const isUSProject = projectType.startsWith('usa-');

  const convertNumberToWords = (amount: number | string): string => {
    let num = 0;
    if (typeof amount === "number") {
      num = Math.round(amount);
    } else {
      const cleanStr = amount.replace(/[^0-9]/g, "");
      num = parseInt(cleanStr, 10) || 0;
    }

    const currencyWord = isUSProject ? "Dollars" : "Rupees";
    if (num === 0) return `${currencyWord} Zero Only`;

    const a = [
      "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
      "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
    ];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    function numToWordsIndian(n: number): string {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
      if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + numToWordsIndian(n % 100) : "");
      // Indian system: Thousands, Lakhs, Crores
      if (n < 100000) {
        return numToWordsIndian(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + numToWordsIndian(n % 1000) : "");
      }
      if (n < 10000000) {
        return numToWordsIndian(Math.floor(n / 100000)) + " Lakh" + (n % 100000 !== 0 ? " " + numToWordsIndian(n % 100000) : "");
      }
      return numToWordsIndian(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 !== 0 ? " " + numToWordsIndian(n % 10000000) : "");
    }

    function numToWordsUS(n: number): string {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
      if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + numToWordsUS(n % 100) : "");
      // US system: Thousands, Millions, Billions
      if (n < 1000000) {
        return numToWordsUS(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + numToWordsUS(n % 1000) : "");
      }
      if (n < 1000000000) {
        return numToWordsUS(Math.floor(n / 1000000)) + " Million" + (n % 1000000 !== 0 ? " " + numToWordsUS(n % 1000000) : "");
      }
      return numToWordsUS(Math.floor(n / 1000000000)) + " Billion" + (n % 1000000000 !== 0 ? " " + numToWordsUS(n % 1000000000) : "");
    }

    const words = isUSProject ? numToWordsUS(num) : numToWordsIndian(num);
    return `${currencyWord} ${words} Only`;
  };

  // --- 3. NEW UNIVERSAL SPREADSHEET-STYLE PDF ---
  const downloadSpreadsheetPDF = async (
    projectName: string, 
    headers: string[], 
    rows: (string | number)[][], 
    footerLabel?: string, 
    footerValue?: string | number,
    projectSpecs: string[] = []
  ) => {
    setIsDownloading(true);
    showToast("Generating PDF...", "info");
    try {
      const jsPDF = (await import("jspdf")).default;
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // --- Watermark ---
      doc.setTextColor(245, 245, 245);
      doc.setFontSize(60);
      doc.setFont("helvetica", "bold");
      // Rotate text for diagonal watermark
      doc.text("HOME DESIGN ENGLISH", pageWidth / 2, pageHeight / 2, { angle: 45, align: "center" });
      
      // --- Header Brand ---
      doc.setDrawColor(217, 164, 67); // Gold accent
      doc.setLineWidth(2);
      doc.line(14, 15, pageWidth - 14, 15);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(30, 30, 30);
      doc.text("HDE", 14, 25);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text("Home Design English", 26, 25);
      
      doc.setFontSize(9);
      doc.text("www.homedesignenglish.com", 14, 30);
      doc.text("Email: hdeadmin@gmail.com", 14, 35);
      
      const categoryLabel = `ESTIMATE REPORT`;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(217, 164, 67);
      doc.text(categoryLabel, pageWidth - 14 - doc.getTextWidth(categoryLabel), 25);
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(projectType.toUpperCase(), pageWidth - 14 - doc.getTextWidth(projectType.toUpperCase()), 30);

      // --- Estimate Title ---
      const titleText = projectName
        .replace(/-/g, " ")
        .replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
      doc.setFontSize(16);
      doc.setTextColor(30, 30, 30);
      doc.setFont("helvetica", "bold");
      doc.text(titleText, 14, 48);

      // --- Metadata Block ---
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      doc.text(`Date: ${new Date().toLocaleDateString(isUSProject ? "en-US" : "en-IN")}`, 14, 54);
      
      let specY = 59;
      if (projectSpecs.length > 0) {
        projectSpecs.forEach(spec => {
          doc.text(spec, 14, specY);
          specY += 5;
        });
      }

      // Horizontal Divider
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.5);
      doc.line(14, specY + 2, pageWidth - 14, specY + 2);

      let footData = undefined;
      if (footerLabel && footerValue !== undefined) {
        const footRow = Array(headers.length).fill("");
        footRow[headers.length - 2] = footerLabel;
        footRow[headers.length - 1] = footerValue.toString();
        footData = [footRow];
      }

      autoTable(doc, {
        startY: specY + 8,
        head: [headers],
        body: rows,
        theme: "striped", 
        styles: {
          font: "helvetica",
          fontSize: 9,
          cellPadding: 5,
          textColor: [40, 40, 40], 
        },
        headStyles: {
          fillColor: [30, 30, 30], 
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        columnStyles: {
          [headers.length - 1]: { halign: "right", fontStyle: "bold" }
        },
        foot: footData,
        footStyles: {
          fillColor: [245, 245, 245],
          textColor: [30, 30, 30],
          fontStyle: "bold",
        },
        // Add Page Numbers in Footer
        didDrawPage: function (data) {
          doc.setFontSize(8);
          doc.setFont("helvetica", "italic");
          doc.setTextColor(150, 150, 150);
          doc.text("Thank you for using Home Design English. This estimate is for reference based on local market factors.", 14, pageHeight - 10);
          
          const pageStr = "Page " + doc.getNumberOfPages();
          doc.text(pageStr, pageWidth - 14 - doc.getTextWidth(pageStr), pageHeight - 10);
        }
      });

      // Amount in Words (Highlighted Box)
      const finalY = (doc as any).lastAutoTable.finalY || specY + 8;
      if (footerValue && finalY + 25 < pageHeight) {
        doc.setDrawColor(217, 164, 67);
        doc.setFillColor(255, 253, 245);
        doc.roundedRect(14, finalY + 8, pageWidth - 28, 18, 2, 2, "FD");

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 30, 30);
        const words = convertNumberToWords(footerValue);
        doc.text(`Total Amount in Words:`, 18, finalY + 14);
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        doc.text(words, 18, finalY + 21);
      }

      doc.save(`${projectName.replace(/\s+/g, "-")}.pdf`);
      showToast("PDF downloaded successfully!", "success");

    } catch (error) {
      console.error("PDF Error", error);
      showToast("Failed to generate PDF.", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  const autosaveDraft = async (data: any) => {
    if (!user || typeof window === 'undefined') return;
    try {
      const key = `hde_draft_${user.id}_${projectType}`;
      window.localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.warn("Autosave draft failed:", err);
    }
  };

  const getAutosaveDraft = async () => {
    if (!user || typeof window === 'undefined') return null;
    try {
      const key = `hde_draft_${user.id}_${projectType}`;
      const saved = window.localStorage.getItem(key);
      return saved ? JSON.parse(saved) : null;
    } catch (err) {
      console.warn("Retrieve draft failed:", err);
      return null;
    }
  };

  const deleteAutosaveDraft = async () => {
    if (!user || typeof window === 'undefined') return;
    try {
      const key = `hde_draft_${user.id}_${projectType}`;
      window.localStorage.removeItem(key);
    } catch (err) {
      console.warn("Delete draft failed:", err);
    }
  };

  return { 
    saveProject, 
    downloadPDF, 
    downloadSpreadsheetPDF, 
    isSaving, 
    isDownloading,
    autosaveDraft,
    getAutosaveDraft,
    deleteAutosaveDraft
  };
};