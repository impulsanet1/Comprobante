/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { useApp } from "../context/AppContext";
import {
  TrendingUp,
  DollarSign,
  FileText,
  Users,
  Award,
  Calendar,
  Layers,
  ArrowUpRight,
  Target
} from "lucide-react";
import { motion } from "motion/react";

export const DashboardView: React.FC<{ onViewChange: (view: string) => void }> = ({ onViewChange }) => {
  const { receipts, clients, services } = useApp();
  const formatCOP = (val: number) => "$" + Math.round(val).toLocaleString("es-CO");

  // Helper dates (Relative to the current local time 2026-07-18)
  const stats = useMemo(() => {
    const now = new Date("2026-07-18T13:41:54-07:00");
    const todayStr = "2026-07-18";
    
    let dailySales = 0;
    let weeklySales = 0;
    let monthlySales = 0;
    let dailyProfit = 0;
    let monthlyProfit = 0;

    // Weekly date boundary (7 days ago)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    receipts.forEach((r) => {
      const rDate = new Date(r.date);
      const isToday = r.date.startsWith(todayStr);
      const isThisMonth = rDate.getMonth() === currentMonth && rDate.getFullYear() === currentYear;
      const isWithinWeek = rDate >= sevenDaysAgo;

      if (isToday) {
        dailySales += r.totalCharged;
        dailyProfit += r.totalProfit;
      }
      if (isWithinWeek) {
        weeklySales += r.totalCharged;
      }
      if (isThisMonth) {
        monthlySales += r.totalCharged;
        monthlyProfit += r.totalProfit;
      }
    });

    // Best-selling services & social networks aggregator
    const serviceSales: Record<string, { name: string; quantity: number; total: number }> = {};
    const socialSales: Record<string, { name: string; total: number }> = {};

    receipts.forEach((r) => {
      r.services.forEach((item) => {
        const sKey = `${item.socialNetworkName} - ${item.serviceName}`;
        if (!serviceSales[sKey]) {
          serviceSales[sKey] = { name: sKey, quantity: 0, total: 0 };
        }
        serviceSales[sKey].quantity += item.quantity;
        serviceSales[sKey].total += item.chargedPrice;

        const snName = item.socialNetworkName;
        if (!socialSales[snName]) {
          socialSales[snName] = { name: snName, total: 0 };
        }
        socialSales[snName].total += item.chargedPrice;
      });
    });

    const topServices = Object.values(serviceSales)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const topSocials = Object.values(socialSales)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return {
      dailySales,
      weeklySales,
      monthlySales,
      dailyProfit,
      monthlyProfit,
      receiptsCount: receipts.length,
      clientsCount: clients.length,
      topServices,
      topSocials,
    };
  }, [receipts, clients]);

  // Generate historical data for charts (Last 7 Days)
  const chartData = useMemo(() => {
    const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const now = new Date("2026-07-18T13:41:54-07:00");
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayLabel = days[d.getDay()];
      const dateStr = d.toISOString().split("T")[0];

      let sales = 0;
      let profit = 0;

      receipts.forEach((r) => {
        if (r.date.startsWith(dateStr)) {
          sales += r.totalCharged;
          profit += r.totalProfit;
        }
      });

      result.push({
        label: dayLabel,
        date: dateStr,
        sales,
        profit,
      });
    }

    return result;
  }, [receipts]);

  // Max value in chart for scaling
  const maxChartVal = useMemo(() => {
    const maxVal = Math.max(...chartData.map((d) => d.sales), 100);
    return Math.ceil(maxVal * 1.15); // Add 15% padding
  }, [chartData]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-2">
      {/* Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Panel de Control
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Resumen administrativo de ventas, utilidades e indicadores de ImpulsaNet
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-white border border-gray-100 rounded-lg px-3 py-1.5 shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span>Sábado, 18 de Julio de 2026</span>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Ventas Hoy */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] relative overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Ventas de Hoy</span>
            <div className="p-2 bg-indigo-50 rounded-lg">
              <DollarSign className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{formatCOP(stats.dailySales)}</h3>
            <p className="text-[10px] text-gray-400 mt-1">Sincronizado al instante</p>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-1 bg-indigo-500"></div>
        </motion.div>

        {/* Ganancias Hoy */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] relative overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Ganancia de Hoy</span>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-emerald-700 tracking-tight">{formatCOP(stats.dailyProfit)}</h3>
            <p className="text-[10px] text-gray-400 mt-1">Margen administrativo</p>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-1 bg-emerald-500"></div>
        </motion.div>

        {/* Ventas del Mes */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] relative overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Ventas del Mes</span>
            <div className="p-2 bg-gray-50 rounded-lg">
              <Layers className="w-4 h-4 text-gray-600" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{formatCOP(stats.monthlySales)}</h3>
            <p className="text-[10px] text-gray-400 mt-1">Semanal: {formatCOP(stats.weeklySales)}</p>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-1 bg-gray-400"></div>
        </motion.div>

        {/* Ganancias del Mes */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="bg-white p-5 rounded-xl border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] relative overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Ganancia del Mes</span>
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Target className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-indigo-700 tracking-tight">{formatCOP(stats.monthlyProfit)}</h3>
            <p className="text-[10px] text-gray-400 mt-1">
              {stats.monthlySales > 0 
                ? `Eficiencia: ${((stats.monthlyProfit / stats.monthlySales) * 100).toFixed(0)}%`
                : "Sin ventas este mes"}
            </p>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-1 bg-indigo-600"></div>
        </motion.div>
      </div>

      {/* Main Grid: Chart and Side Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Modern Custom Chart Component */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-gray-950">Desempeño de Ventas</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Historial de ventas y ganancias de los últimos 7 días</p>
            </div>
            <div className="flex gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-gray-700">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                <span>Ventas</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Ganancia</span>
              </div>
            </div>
          </div>

          {/* SVG Custom Render Graph (Linear & Stripe aesthetic) */}
          <div className="relative h-64 w-full">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] font-mono text-gray-400">
              <div className="border-b border-gray-100 pb-1 flex justify-between">
                <span>{formatCOP(maxChartVal)}</span>
                <span></span>
              </div>
              <div className="border-b border-gray-100 pb-1 flex justify-between">
                <span>{formatCOP(maxChartVal / 2)}</span>
                <span></span>
              </div>
              <div className="border-b border-gray-100 pb-1 flex justify-between">
                <span>$0</span>
                <span></span>
              </div>
            </div>

            {/* SVG Visualizer */}
            <div className="absolute inset-0 pt-4 pb-6 px-1 flex items-end justify-between">
              {chartData.map((day, idx) => {
                const salesHeight = `${(day.sales / maxChartVal) * 100}%`;
                const profitHeight = `${(day.profit / maxChartVal) * 100}%`;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full relative group">
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-2 bg-gray-900 text-white rounded-lg p-2.5 shadow-md text-[10px] font-mono pointer-events-none opacity-0 group-hover:opacity-100 transition duration-150 z-20 w-28 text-center -translate-y-1">
                      <div className="font-bold text-gray-300 border-b border-gray-800 pb-1 mb-1">{day.date}</div>
                      <div className="flex justify-between">
                        <span>Venta:</span>
                        <span className="font-semibold text-indigo-300">{formatCOP(day.sales)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Utilidad:</span>
                        <span className="font-semibold text-emerald-300">{formatCOP(day.profit)}</span>
                      </div>
                    </div>

                    {/* Columns containers */}
                    <div className="w-full flex justify-center items-end h-full gap-1.5 px-2">
                      {/* Sales Column */}
                      <div
                        className="w-4 bg-indigo-600 hover:bg-indigo-500 transition rounded-t-sm relative"
                        style={{ height: salesHeight }}
                      ></div>
                      {/* Profit Column */}
                      <div
                        className="w-4 bg-emerald-500 hover:bg-emerald-400 transition rounded-t-sm relative"
                        style={{ height: profitHeight }}
                      ></div>
                    </div>

                    {/* Date label */}
                    <span className="absolute top-full mt-2 text-[10px] font-bold text-gray-400 uppercase">
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Totals & Best Sellers Overview */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-6">
          <div>
            <h3 className="text-sm font-bold text-gray-950">Resumen Operativo</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Indicadores de transacciones y clientes</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-150 text-center">
              <div className="flex justify-center mb-1">
                <FileText className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-xs font-semibold text-gray-500">Comprobantes</div>
              <div className="text-xl font-bold text-gray-900 mt-1">{stats.receiptsCount}</div>
            </div>

            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-150 text-center">
              <div className="flex justify-center mb-1">
                <Users className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xs font-semibold text-gray-500">Clientes Únicos</div>
              <div className="text-xl font-bold text-gray-900 mt-1">{stats.clientsCount}</div>
            </div>
          </div>

          {/* Top Selling Services List */}
          <div className="space-y-3 pt-2">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-yellow-500" />
              Servicios más Vendidos
            </h4>
            
            {stats.topServices.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-4 text-center">Aún no se registran servicios facturados.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {stats.topServices.map((srv, index) => (
                  <div key={index} className="flex justify-between items-center py-2 text-xs">
                    <div className="truncate pr-3">
                      <span className="font-mono font-bold text-indigo-400 mr-2">#{index + 1}</span>
                      <span className="font-medium text-gray-800">{srv.name}</span>
                    </div>
                    <div className="text-right font-mono text-gray-600 font-semibold shrink-0">
                      {formatCOP(srv.total)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Call to Action Grid */}
      <div className="bg-indigo-950 text-white p-6 md:p-8 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_10px_20px_rgba(79,70,229,0.15)]">
        <div className="space-y-1">
          <h3 className="text-lg font-bold tracking-tight">Generador de Comprobantes</h3>
          <p className="text-xs text-indigo-200 leading-relaxed max-w-lg">
            Emita comprobantes de compra profesionales con cálculo automático de costos del proveedor y ganancias, listos para descargar o imprimir al instante.
          </p>
        </div>
        <button
          id="btn-goto-generator"
          onClick={() => onViewChange("generator")}
          className="bg-white text-indigo-950 hover:bg-indigo-50 font-bold text-xs py-2.5 px-5 rounded-lg flex items-center gap-2 transition shadow-sm whitespace-nowrap self-start md:self-center cursor-pointer"
        >
          Nuevo Comprobante
          <ArrowUpRight className="w-3.5 h-3.5 text-indigo-600" />
        </button>
      </div>
    </div>
  );
};
