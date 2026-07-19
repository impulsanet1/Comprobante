/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect, useMemo } from "react";
import { X, Printer, Download, CheckCircle2, ShieldCheck, PhoneCall, Edit3, Save, Trash2, ShieldAlert } from "lucide-react";
import { Receipt, ReceiptItem } from "../types";
import { motion, AnimatePresence } from "motion/react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useApp } from "../context/AppContext";

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
  const { updateReceipt } = useApp();
  const receiptRef = useRef<HTMLDivElement>(null);
  
  // Format utility
  const formatCOP = (val: number) => "$" + Math.round(val).toLocaleString("es-CO");

  // State for Editing Mode
  const [isEditing, setIsEditing] = useState(false);
  const [editedClientName, setEditedClientName] = useState(receipt.clientName);
  const [editedClientPhone, setEditedClientPhone] = useState(receipt.clientPhone);
  const [editedWarranty, setEditedWarranty] = useState(receipt.warranty);
  const [editedThankYouMessage, setEditedThankYouMessage] = useState(receipt.thankYouMessage || "");
  const [editedServices, setEditedServices] = useState<ReceiptItem[]>(receipt.services || []);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state with prop changes
  useEffect(() => {
    setEditedClientName(receipt.clientName);
    setEditedClientPhone(receipt.clientPhone);
    setEditedWarranty(receipt.warranty);
    setEditedThankYouMessage(receipt.thankYouMessage || "¡Gracias por confiar en ImpulsaNet para potenciar sus redes!");
    setEditedServices(receipt.services || []);
    setIsEditing(false);
    setError(null);
  }, [receipt]);

  // Recalculate totals in real time while editing
  const totals = useMemo(() => {
    const items = isEditing ? editedServices : receipt.services || [];
    const subtotal = items.reduce((acc, item) => acc + (item.suggestedPrice || 0), 0);
    const totalCharged = items.reduce((acc, item) => acc + (Number(item.chargedPrice) || 0), 0);
    const totalProviderCost = items.reduce((acc, item) => acc + (item.providerCostAtPurchase || 0), 0);
    const totalProfit = totalCharged - totalProviderCost;
    return { subtotal, totalCharged, totalProviderCost, totalProfit };
  }, [isEditing, editedServices, receipt.services]);

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

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    setIsDownloading(true);

    try {
      const element = receiptRef.current;
      
      // Use scale: 1.5 to be extremely crisp but much lighter on memory
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 720, // predictable layout width
      });

      const imgData = canvas.toDataURL("image/png");
      
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
      console.error("Error generating PDF with html2canvas:", error);
      alert("No se pudo generar automáticamente el archivo PDF. Se abrirá el asistente de impresión para Guardar como PDF.");
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveChanges = async () => {
    if (!editedClientName.trim()) {
      setError("El nombre del cliente no puede estar vacío.");
      return;
    }
    if (!editedClientPhone.trim()) {
      setError("El teléfono del cliente no puede estar vacío.");
      return;
    }
    if (editedServices.length === 0) {
      setError("El comprobante debe contener al menos un servicio.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const updatedData: Partial<Receipt> = {
        clientName: editedClientName.trim(),
        clientPhone: editedClientPhone.trim(),
        warranty: editedWarranty.trim(),
        thankYouMessage: editedThankYouMessage.trim(),
        services: editedServices,
        subtotal: totals.subtotal,
        totalCharged: totals.totalCharged,
        totalProviderCost: totals.totalProviderCost,
        totalProfit: totals.totalProfit,
      };

      await updateReceipt(receipt.id, updatedData);
      setIsEditing(false);
    } catch (err: any) {
      console.error("Error saving receipt:", err);
      setError(err.message || "No se pudieron guardar los cambios en Firebase.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div 
        id="receipt-modal-overlay" 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto cursor-pointer"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-2xl w-full overflow-hidden flex flex-col my-8 cursor-default"
        >
          {/* Header Controls (No Print) */}
          <div className="no-print bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isEditing ? "bg-amber-500 animate-pulse" : "bg-emerald-500 animate-pulse"}`}></span>
              <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase">
                {isEditing ? "Editando Comprobante" : "Comprobante de Pago"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    id="btn-save-edited-receipt"
                    type="button"
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 transition px-3.5 py-1.5 rounded-lg shadow-2xs cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {isSaving ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    id="btn-cancel-edited-receipt"
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedClientName(receipt.clientName);
                      setEditedClientPhone(receipt.clientPhone);
                      setEditedWarranty(receipt.warranty);
                      setEditedThankYouMessage(receipt.thankYouMessage || "");
                      setEditedServices(receipt.services || []);
                      setError(null);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition px-3 py-1.5 rounded-lg shadow-2xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button
                    id="btn-download-receipt-pdf"
                    type="button"
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="flex items-center gap-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 transition px-3.5 py-1.5 rounded-lg shadow-2xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {isDownloading ? "Descargando..." : "Descargar PDF"}
                  </button>
                  <button
                    id="btn-print-receipt"
                    type="button"
                    onClick={handlePrint}
                    className="flex items-center gap-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition px-3 py-1.5 rounded-lg shadow-2xs cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Imprimir / PDF
                  </button>
                  <button
                    id="btn-edit-receipt-toggle"
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 transition px-3 py-1.5 rounded-lg shadow-2xs cursor-pointer border border-indigo-100"
                    title="Editar datos del comprobante"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Editar
                  </button>
                  <button
                    id="btn-close-receipt"
                    type="button"
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 transition rounded-lg cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Receipt Content Area */}
          <div className="p-8 md:p-12 overflow-y-auto flex-1 bg-white" ref={receiptRef}>
            <div className="print-container max-w-xl mx-auto space-y-8">
              
              {/* Error Alert if any */}
              {error && (
                <div className="no-print bg-red-50 border border-red-100 p-3 rounded-xl flex items-start gap-2.5 text-xs text-red-600">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

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

              {/* Client Info (Conditional View/Edit) */}
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-indigo-50/30 p-4 rounded-xl border border-indigo-100">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Nombre del Cliente</label>
                    <input
                      type="text"
                      value={editedClientName}
                      onChange={(e) => setEditedClientName(e.target.value)}
                      className="mt-1 block w-full px-3.5 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition font-medium text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Teléfono / WhatsApp</label>
                    <input
                      type="text"
                      value={editedClientPhone}
                      onChange={(e) => setEditedClientPhone(e.target.value)}
                      className="mt-1 block w-full px-3.5 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition font-mono text-gray-800"
                    />
                  </div>
                </div>
              ) : (
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
              )}

              {/* Services Table */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">
                  Servicios Adquiridos
                </div>
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-2xs bg-white">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/75 border-b border-gray-100">
                        <th className="py-3 px-4 text-xs font-semibold text-gray-600">Servicio</th>
                        <th className="py-3 px-4 text-xs font-semibold text-gray-600 text-center">Cantidad</th>
                        <th className="py-3 px-4 text-xs font-semibold text-gray-600 text-right">Precio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {isEditing ? (
                        editedServices.map((item, index) => (
                          <tr key={item.id || index} className="hover:bg-gray-50/30 transition">
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-gray-900 text-xs">
                                {item.socialNetworkName} - {item.serviceName}
                              </div>
                              <div className="mt-2.5">
                                <label className="block text-[9px] font-bold text-gray-400 uppercase">ID de Pedido</label>
                                <input
                                  type="text"
                                  value={item.orderId}
                                  onChange={(e) => {
                                    const updatedVal = e.target.value;
                                    setEditedServices((prev) =>
                                      prev.map((it, idx) => (idx === index ? { ...it, orderId: updatedVal } : it))
                                    );
                                  }}
                                  className="mt-1 block w-full max-w-xs px-2.5 py-1 border border-gray-200 rounded-md text-xs font-mono bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                                />
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => {
                                  const updatedVal = parseInt(e.target.value) || 0;
                                  setEditedServices((prev) =>
                                    prev.map((it, idx) => (idx === index ? { ...it, quantity: updatedVal } : it))
                                  );
                                }}
                                className="w-20 px-2 py-1 border border-gray-200 rounded-md text-xs font-mono text-center bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                              />
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex flex-col items-end gap-1.5">
                                <div className="relative rounded-md w-24">
                                  <span className="absolute inset-y-0 left-0 pl-1.5 flex items-center text-[10px] text-gray-400 font-mono">$</span>
                                  <input
                                    type="number"
                                    value={item.chargedPrice}
                                    onChange={(e) => {
                                      const updatedVal = parseFloat(e.target.value) || 0;
                                      setEditedServices((prev) =>
                                        prev.map((it, idx) => (idx === index ? { ...it, chargedPrice: updatedVal } : it))
                                      );
                                    }}
                                    className="block w-full pl-4 pr-1.5 py-1 border border-gray-200 rounded-md text-xs font-mono text-right bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditedServices((prev) => prev.filter((_, idx) => idx !== index));
                                  }}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md transition cursor-pointer"
                                  title="Remover servicio"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        (receipt.services || []).map((item, index) => (
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
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Section */}
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <div className="w-full md:w-64 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-mono text-gray-700">{formatCOP(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                    <span>Total Pagado</span>
                    <span className="font-mono text-lg text-emerald-600">
                      {formatCOP(totals.totalCharged)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Terms, Warranty, and Support */}
              <div className="border-t border-gray-100 pt-6 space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2 bg-indigo-50/40 p-3.5 rounded-xl border border-indigo-100/50">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4.5 h-4.5 text-indigo-600" />
                        <label className="text-xs font-bold text-gray-800 uppercase tracking-wider">Garantía del Servicio</label>
                      </div>
                      <input
                        type="text"
                        value={editedWarranty}
                        onChange={(e) => setEditedWarranty(e.target.value)}
                        placeholder="Ej. 30 días"
                        className="mt-1 block w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition text-gray-800"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Mensaje de Agradecimiento</label>
                      <textarea
                        value={editedThankYouMessage}
                        onChange={(e) => setEditedThankYouMessage(e.target.value)}
                        rows={2}
                        className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition text-gray-800 resize-none"
                      />
                    </div>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </div>

              {/* Thank You Footer (Conditional View) */}
              {!isEditing && (
                <div className="text-center pt-2">
                  <p className="text-xs font-medium text-gray-600 italic">
                    {receipt.thankYouMessage || "¡Gracias por su preferencia!"}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">Este es un comprobante privado para uso administrativo.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
