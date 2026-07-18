/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from "react";
import { X, Printer, Download, CheckCircle2, ShieldCheck, PhoneCall } from "lucide-react";
import { Receipt } from "../types";
import { motion, AnimatePresence } from "motion/react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface ReceiptModalProps {
  receipt: Receipt;
  onClose: () => void;
  businessName: string;
  whatsapp: string;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  receipt,
  onClose,
  businessName,
  whatsapp,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const formatCOP = (val: number) => "$" + Math.round(val).toLocaleString("es-CO");

  // Format date to local string
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    setIsDownloading(true);

    try {
      const element = receiptRef.current;
      
      // Use scale: 2 for high-resolution graphics and clear text
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 720, // set a predictable window width for optimal layout capture
      });

      const imgData = canvas.toDataURL("image/png");
      
      // Standard A4 sizes in mm
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const margin = 10;
      const contentWidth = pdfWidth - (margin * 2);
      const imgHeight = (canvas.height * contentWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, "PNG", margin, position, contentWidth, imgHeight);
      heightLeft -= (pdfHeight - (margin * 2));

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", margin, position, contentWidth, imgHeight);
        heightLeft -= (pdfHeight - (margin * 2));
      }

      pdf.save(`comprobante_${receipt.consecutive}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    // Create print styles dynamically or just run print
    const printContent = receiptRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;

    if (printContent) {
      // Create a temporary print frame or styling
      const style = document.createElement("style");
      style.innerHTML = `
        @media print {
          body {
            background: white !important;
            color: black !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            padding: 20px !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            border: none !important;
            box-shadow: none !important;
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `;
      document.head.appendChild(style);
      window.print();
      document.head.removeChild(style);
    }
  };

  return (
    <AnimatePresence>
      <div id="receipt-modal-overlay" className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-2xl w-full overflow-hidden flex flex-col my-8"
        >
          {/* Header Controls (No Print) */}
          <div className="no-print bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase">
                Comprobante de Pago
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="btn-download-receipt-pdf"
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="flex items-center gap-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 transition px-3.5 py-1.5 rounded-lg shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                {isDownloading ? "Descargando..." : "Descargar PDF"}
              </button>
              <button
                id="btn-print-receipt"
                onClick={handlePrint}
                className="flex items-center gap-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition px-3 py-1.5 rounded-lg shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimir / PDF
              </button>
              <button
                id="btn-close-receipt"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 transition rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Receipt Content Area */}
          <div className="p-8 md:p-12 overflow-y-auto flex-1 bg-white" ref={receiptRef}>
            <div className="print-container max-w-xl mx-auto space-y-8">
              {/* Receipt Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-8">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                    {businessName}
                  </h1>
                  <p className="text-xs text-gray-500 mt-1">Comprobante de Compra Electrónico</p>
                </div>
                <div className="text-left md:text-right">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Nº Comprobante
                  </div>
                  <div className="text-xl font-mono font-bold text-gray-900">
                    #{receipt.consecutive}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDate(receipt.date)}
                  </div>
                </div>
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Cliente
                  </div>
                  <div className="text-sm font-semibold text-gray-900 mt-0.5">
                    {receipt.clientName}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Contacto
                  </div>
                  <div className="text-sm font-mono text-gray-700 mt-0.5">
                    {receipt.clientPhone || "No especificado"}
                  </div>
                </div>
              </div>

              {/* Services Table */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">
                  Servicios Adquiridos
                </div>
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/75 border-b border-gray-100">
                        <th className="py-3 px-4 text-xs font-semibold text-gray-600">Servicio</th>
                        <th className="py-3 px-4 text-xs font-semibold text-gray-600 text-center">Cantidad</th>
                        <th className="py-3 px-4 text-xs font-semibold text-gray-600 text-right">Precio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {receipt.services.map((item, index) => (
                        <tr key={item.id || index} className="hover:bg-gray-50/30 transition">
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-gray-900">
                              {item.socialNetworkName} - {item.serviceName}
                            </div>
                            {item.orderId && (
                              <div className="text-[10px] font-mono text-gray-400 mt-0.5">
                                ID Pedido: {item.orderId}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-gray-600">
                            {item.quantity.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-medium text-gray-900">
                            {formatCOP(item.chargedPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Section */}
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <div className="w-full md:w-64 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-mono text-gray-700">{formatCOP(receipt.subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                    <span>Total Pagado</span>
                    <span className="font-mono text-lg text-emerald-600">
                      {formatCOP(receipt.totalCharged)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Terms & Warranty */}
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <div className="flex items-start gap-3 bg-indigo-50/40 p-3.5 rounded-xl border border-indigo-100/50">
                  <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Garantía del Servicio</h4>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                      Este comprobante incluye una garantía automática de <strong>{receipt.warranty}</strong>. 
                      Válida a partir de la fecha de generación para cualquier eventualidad o reposición de servicio.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-1">
                    <PhoneCall className="w-3 h-3 text-indigo-500" />
                    <span>WhatsApp Soporte: {whatsapp}</span>
                  </div>
                  <span>ImpulsaNet S.A.</span>
                </div>
              </div>

              {/* Thank You Footer */}
              <div className="text-center pt-2">
                <p className="text-xs font-medium text-gray-600 italic">
                  {receipt.thankYouMessage || "¡Gracias por su preferencia!"}
                </p>
                <p className="text-[10px] text-gray-400 mt-1">Este es un comprobante privado para uso administrativo.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
