"use client";
// src/components/ui/WhatsAppShareButton.tsx
import React from "react";

interface DetailItem {
  label: string;
  value: string;
}

interface WhatsAppShareButtonProps {
  title: string;
  total?: string;
  details?: DetailItem[];
  url?: string;
  variant?: "primary" | "outline" | "compact";
  className?: string;
  buttonText?: string;
}

export const WhatsAppShareButton: React.FC<WhatsAppShareButtonProps> = ({
  title,
  total,
  details = [],
  url,
  variant = "primary",
  className = "",
  buttonText = "Share via WhatsApp"
}) => {
  const handleShare = () => {
    const targetUrl = url || (typeof window !== "undefined" ? window.location.href : "https://www.homedesignenglish.com");
    
    // Construct clean WhatsApp formatted message
    let message = `🏗️ *${title}*\n`;
    if (total) {
      message += `💰 *Estimated Total:* ${total}\n`;
    }
    
    if (details.length > 0) {
      message += `\n📋 *Key Specifications:*\n`;
      details.forEach((item) => {
        message += `• ${item.label}: ${item.value}\n`;
      });
    }

    message += `\n📊 *Calculate your exact project on Home Design English:*\n${targetUrl}`;

    const encoded = encodeURIComponent(message);
    const waUrl = `https://api.whatsapp.com/send?text=${encoded}`;

    if (typeof window !== "undefined") {
      window.open(waUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handleShare}
        title="Share estimate on WhatsApp"
        className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-[#25D366] hover:bg-[#20bd5a] shadow-sm hover:shadow transition-all cursor-pointer ${className}`}
      >
        <i className="fab fa-whatsapp text-sm"></i>
        <span>WhatsApp</span>
      </button>
    );
  }

  if (variant === "outline") {
    return (
      <button
        type="button"
        onClick={handleShare}
        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#128C7E] dark:text-[#25D366] border border-[#25D366]/40 hover:bg-[#25D366]/10 transition-all cursor-pointer ${className}`}
      >
        <i className="fab fa-whatsapp text-sm text-[#25D366]"></i>
        <span>{buttonText}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs md:text-sm font-bold text-white bg-[#25D366] hover:bg-[#20bd5a] shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 ${className}`}
    >
      <i className="fab fa-whatsapp text-base"></i>
      <span>{buttonText}</span>
    </button>
  );
};

export default WhatsAppShareButton;
