/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import {
  Search,
  Filter,
  Calendar,
  FileText,
  Clock,
  User,
  Eye,
  Trash2,
  AlertCircle,
  TrendingUp,
  Inbox
} from "lucide-react";
import { Receipt } from "../types";
import { motion } from "motion/react";

interface HistoryViewProps {
  onSelectReceipt: (receipt: Receipt) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onSelectReceipt }) => {
  const { receipts, deleteReceipt } = useApp();
  const formatCOP = (val: number) => "$" + Math.round(val).toLocaleString("es-CO");

  const [searchText, setSearchText] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(""); // "" means All
  const [selectedYear, setSelectedYear] = useState(""); // "" means All
  const [deletingReceiptId, setDeletingReceiptId] = useState<string | null>(null);

  // Month Names translation helper
  const monthNames = [
    { value: "0", label: "Enero" },
    { value: "1", label: "Febrero" },
    { value: "2", label: "Marzo" },
    { value: "3", label: "Abril" },
    { value: "4", label: "Mayo" },
    { value: "5", label: "Junio" },
    { value: "6", label: "Julio" },
    { value: "7", label: "Agosto" },
    { value: "8", label: "Septiembre" },
    { value: "9", label: "Octubre" },
    { value: "10", label: "Noviembre" },
    { value: "11", label: "Diciembre" }
  ];

  // Dynamically extract all available years in existing receipts for the filter
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    receipts.forEach((r) => {
      try {
        const yr = new Date(r.date).getFullYear().toString();
        years.add(yr);
      } catch {}
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [receipts]);

  // Filter receipts logic
  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      // 1. Search text filter (matches name, phone, or consecutive number)
      const matchesSearch =
        searchText.trim() === "" ||
        r.clientName.toLowerCase().includes(searchText.toLowerCase()) ||
        r.clientPhone.includes(searchText) ||
        r.consecutive.toString().includes(searchText);

      if (!matchesSearch) return false;

      // Parse receipt date safely
      try {
        const rDate = new Date(r.date);
        
        // 2. Month filter
        if (selectedMonth !== "" && rDate.getMonth().toString() !== selectedMonth) {
          return false;
        }

        // 3. Year filter
        if (selectedYear !== "" && rDate.getFullYear().toString() !== selectedYear) {
          return false;
        }
      } catch {
        // If parsing fails and filters are active, skip
        if (selectedMonth !== "" || selectedYear !== "") return false;
      }

      return true;
    });
  }, [receipts, searchText, selectedMonth, selectedYear]);

  // Total charged sum of filtered receipts
  const filteredTotal = useMemo(() => {
    return filteredReceipts.reduce((acc, r) => acc + r.totalCharged, 0);
  }, [filteredReceipts]);

  // Format Date for table
  const formatDateSimple = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-2">
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Historial de Comprobantes</h2>
        <p className="text-xs text-gray-500 mt-1">Busque, filtre y reimprima comprobantes emitidos previamente</p>
      </div>

      {/* Filter and Search Box */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-indigo-500" />
            </div>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Buscar por cliente, teléfono o número..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
            />
          </div>

          {/* Month Selector */}
          <div className="md:col-span-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
            >
              <option value="">Todos los Meses</option>
              {monthNames.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Year Selector */}
          <div className="md:col-span-3">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition"
            >
              <option value="">Todos los Años</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Indicator / Total of search results */}
        <div className="flex flex-wrap justify-between items-center text-xs text-gray-500 border-t border-gray-100 pt-3">
          <div>
            Mostrando <strong className="text-gray-900">{filteredReceipts.length}</strong> de{" "}
            <strong className="text-gray-900">{receipts.length}</strong> comprobantes
          </div>
          {(searchText || selectedMonth || selectedYear) && (
            <div className="flex items-center gap-2">
              <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-sm font-semibold border border-indigo-100">
                Suma Filtrada: {formatCOP(filteredTotal)}
              </span>
              <button
                onClick={() => {
                  setSearchText("");
                  setSelectedMonth("");
                  setSelectedYear("");
                }}
                className="text-gray-400 hover:text-indigo-600 font-semibold transition cursor-pointer"
              >
                Limpiar Filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Receipts Table Area */}
      {filteredReceipts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <Inbox className="w-12 h-12 text-indigo-200 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-gray-700">No se encontraron comprobantes</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto mt-1 leading-relaxed">
            Intente cambiar la consulta de búsqueda o restablecer los selectores de mes/año para ver los comprobantes almacenados.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse animate-fade-in">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-150">
                  <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Comprobante</th>
                  <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Servicios</th>
                  <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Total Cobrado</th>
                  <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 text-sm">
                {filteredReceipts.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/40 transition">
                    {/* Consecutive Number */}
                    <td className="py-4 px-6 font-mono font-bold text-gray-900">
                      #{r.consecutive}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6 text-gray-500 font-mono">
                      {formatDateSimple(r.date)}
                    </td>

                    {/* Client name and phone */}
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900">{r.clientName}</div>
                      <div className="text-[10px] font-mono text-gray-400 mt-0.5">{r.clientPhone}</div>
                    </td>

                    {/* Services sum */}
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center justify-center bg-indigo-50 border border-indigo-100/50 text-indigo-700 font-semibold text-xs px-2.5 py-0.5 rounded-full">
                        {r.services.length} {r.services.length === 1 ? "servicio" : "servicios"}
                      </span>
                    </td>

                    {/* Total paid */}
                    <td className="py-4 px-6 text-right font-mono font-bold text-indigo-600">
                      {formatCOP(r.totalCharged)}
                    </td>

                    {/* Reprint Action Button */}
                    <td className="py-4 px-6 text-center">
                      {deletingReceiptId === r.id ? (
                        <div className="inline-flex items-center gap-1 bg-red-50 p-1 rounded-md border border-red-100 shrink-0 animate-fade-in">
                          <span className="text-[9px] font-bold text-red-600 uppercase mr-1">¿Borrar?</span>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await deleteReceipt(r.id);
                              } catch (err) {
                                console.error(err);
                              } finally {
                                setDeletingReceiptId(null);
                              }
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white text-[9px] px-1.5 py-0.5 rounded font-bold cursor-pointer transition"
                          >
                            Sí
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingReceiptId(null)}
                            className="bg-white border border-gray-200 text-gray-700 text-[9px] px-1.5 py-0.5 rounded font-bold cursor-pointer transition"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            id={`btn-view-receipt-${r.consecutive}`}
                            onClick={() => onSelectReceipt(r)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-50 transition px-2.5 py-1.5 rounded-lg shadow-2xs cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Ver
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingReceiptId(r.id)}
                            className="inline-flex items-center text-red-500 hover:text-red-700 bg-white border border-red-100 hover:bg-red-50 transition p-1.5 rounded-lg shadow-2xs cursor-pointer"
                            title="Eliminar Comprobante"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
