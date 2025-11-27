"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/app/_components/Header/Header";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { useAuth } from "@/app/_context/AuthContext";
import {
    getSalesReportApi,
    type SalesReportResponse,
    type RegionBucket,
    type MonthBucket,
} from "@/app/_api/reports";

type PeriodFilter = "last-7" | "last-30" | "year-to-date";
type GroupBy = "region" | "month";

const CURRENCY = "USD";

function formatCurrency(amount: number | undefined | null) {
    const safe = typeof amount === "number" ? amount : 0;
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: CURRENCY,
        maximumFractionDigits: 2,
    }).format(safe);
}

function formatLocalDate(dateStr?: string | null) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB");
}

function computeDateRange(period: PeriodFilter): { fromDate: string; toDate: string } {
    const now = new Date();
    const to = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let from: Date;

    if (period === "last-7") {
        from = new Date(to);
        from.setDate(to.getDate() - 7);
    } else if (period === "last-30") {
        from = new Date(to);
        from.setDate(to.getDate() - 30);
    } else {
        from = new Date(to.getFullYear(), 0, 1);
    }

    const toStr = to.toISOString().slice(0, 10);
    const fromStr = from.toISOString().slice(0, 10);

    return { fromDate: fromStr, toDate: toStr };
}

function formatYearMonthLabel(monthKey: string) {
    // monthKey: "YYYY-MM"
    const [yearStr, monthStr] = monthKey.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr); // 1-based
    if (!year || !month) return monthKey;
    const d = new Date(year, month - 1, 1);
    return d.toLocaleString("en-US", { month: "short", year: "numeric" });
}

export default function ReportsPage() {
    const { user, isAuthenticated, isLoading } = useAuth();

    const [period, setPeriod] = useState<PeriodFilter>("year-to-date");
    const [groupBy, setGroupBy] = useState<GroupBy>("region");

    const [report, setReport] = useState<SalesReportResponse | null>(null);
    const [isLoadingReport, setIsLoadingReport] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const isAdminOrManager =
        user?.role === "ADMIN" || user?.role === "MANAGER";

    const isForbidden =
        !isLoading && (!isAuthenticated || !isAdminOrManager);

    // Load report when period changes and user is allowed
    useEffect(() => {
        if (!isAuthenticated || !isAdminOrManager) return;

        const { fromDate, toDate } = computeDateRange(period);

        let mounted = true;

        async function load() {
            setIsLoadingReport(true);
            setErrorMessage(null);
            try {
                const data = await getSalesReportApi({ fromDate, toDate });
                if (!mounted) return;
                setReport(data);
            } catch (err) {
                if (!mounted) return;
                const msg =
                    err instanceof Error && err.message
                        ? err.message
                        : "Failed to load sales report.";
                setErrorMessage(msg);
                setReport(null);
            } finally {
                if (mounted) setIsLoadingReport(false);
            }
        }

        load();

        return () => {
            mounted = false;
        };
    }, [period, isAuthenticated, isAdminOrManager]);

    const kpis = useMemo(() => {
        if (!report) {
            return {
                subtotal: 0,
                vat: 0,
                discount: 0,
                deliveryFee: 0,
                total: 0,
                averageCheck: 0,
                ordersCount: 0,
            };
        }
        return {
            subtotal: Number(report.totalSubtotal ?? 0),
            vat: Number(report.totalVat ?? 0),
            discount: Number(report.totalDiscount ?? 0),
            deliveryFee: Number(report.totalDeliveryFee ?? 0),
            total: Number(report.totalAmount ?? 0),
            averageCheck: Number(report.averageCheck ?? 0),
            ordersCount: Number(report.ordersCount ?? 0),
        };
    }, [report]);

    const dateLabel = useMemo(() => {
        if (!report) {
            const { fromDate, toDate } = computeDateRange(period);
            return `${fromDate} → ${toDate}`;
        }
        return `${report.fromDate} → ${report.toDate}`;
    }, [report, period]);

    const regionBuckets: { region: string; total: number }[] = useMemo(() => {
        const src: RegionBucket[] = report?.regionBuckets ?? [];
        return src.map((b) => ({
            region: b.region,
            total: Number(b.totalAmount ?? 0),
        }));
    }, [report]);

    const monthBuckets: { monthKey: string; label: string; total: number }[] =
        useMemo(() => {
            const src: MonthBucket[] = report?.monthBuckets ?? [];
            return src
                .map((b) => ({
                    monthKey: b.monthKey,
                    label: formatYearMonthLabel(b.monthKey),
                    total: Number(b.totalAmount ?? 0),
                }))
                .sort((a, b) => (a.monthKey > b.monthKey ? 1 : -1));
        }, [report]);

    const handleExportCSV = () => {
        const header = [
            "FromDate",
            "ToDate",
            "OrdersCount",
            "Subtotal",
            "VAT",
            "Discount",
            "DeliveryFee",
            "Total",
            "AverageCheck",
        ];

        const row = [
            report?.fromDate ?? "",
            report?.toDate ?? "",
            kpis.ordersCount.toString(),
            kpis.subtotal.toFixed(2),
            kpis.vat.toFixed(2),
            kpis.discount.toFixed(2),
            kpis.deliveryFee.toFixed(2),
            kpis.total.toFixed(2),
            kpis.averageCheck.toFixed(2),
        ];

        const csv = [header, row]
            .map((r) => r.map((cell) => `"${cell}"`).join(","))
            .join("\n");

        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "sales-report-summary.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExportPDF = () => {
        if (typeof window !== "undefined") {
            window.print();
        }
    };

    // ------------- RENDER -----------------

    if (isForbidden) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-white">
                    <div className="mx-auto max-w-6xl px-4 py-10 lg:px-0">
                        <h1 className="text-xl font-semibold text-gray-900 md:text-2xl">
                            Sales Reports
                        </h1>
                        <h4 className="mt-4 text-base font-semibold text-gray-900">
                            You do not have access to view reports.
                        </h4>
                        <p className="mt-1 text-sm text-gray-500">
                            Only administrator or manager accounts can view this page.
                        </p>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <Header />

            <main className="min-h-screen bg-white">
                <div className="mx-auto max-w-6xl px-4 py-10 lg:px-0">
                    {/* Page header & filters */}
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900 md:text-2xl">
                                Sales Reports
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Review performance based on real orders data from the backend.
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                                Period: {dateLabel}
                            </p>
                        </div>

                        <div
                            className="flex flex-wrap gap-3"
                            aria-label="Report filters"
                            role="group"
                        >
                            {/* Period filter */}
                            <select
                                aria-label="Select reporting period"
                                value={period}
                                onChange={(e) =>
                                    setPeriod(e.target.value as PeriodFilter)
                                }
                                className="rounded-full border border-gray-200 px-3 py-2 text-xs text-gray-700 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 md:text-sm"
                            >
                                <option value="last-7">Last 7 days</option>
                                <option value="last-30">Last 30 days</option>
                                <option value="year-to-date">Year to date</option>
                            </select>

                            {/* Grouping filter (UX only) */}
                            <select
                                aria-label="Group results by"
                                value={groupBy}
                                onChange={(e) => setGroupBy(e.target.value as GroupBy)}
                                className="rounded-full border border-gray-200 px-3 py-2 text-xs text-gray-700 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 md:text-sm"
                            >
                                <option value="region">Group by region</option>
                                <option value="month">Group by month</option>
                            </select>
                        </div>
                    </div>

                    {/* Loading / error */}
                    {isLoadingReport && (
                        <div className="mb-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-700">
                            Loading sales report...
                        </div>
                    )}

                    {errorMessage && (
                        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-700">
                            {errorMessage}
                        </div>
                    )}

                    {/* KPIs + Export */}
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
                        {/* KPIs */}
                        <section
                            aria-label="Key performance indicators"
                            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100"
                        >
                            <h2 className="text-sm font-semibold text-gray-800">
                                Key Performance Indicators
                            </h2>
                            <div
                                role="table"
                                aria-label="Sales key performance indicators"
                                className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                            >
                                <div role="row" className="space-y-1">
                                    <p className="text-xs text-gray-500">Orders count</p>
                                    <p
                                        role="cell"
                                        className="text-base font-semibold text-gray-900"
                                    >
                                        {kpis.ordersCount}
                                    </p>
                                </div>
                                <div role="row" className="space-y-1">
                                    <p className="text-xs text-gray-500">Subtotal</p>
                                    <p
                                        role="cell"
                                        className="text-base font-semibold text-gray-900"
                                    >
                                        {formatCurrency(kpis.subtotal)}
                                    </p>
                                </div>
                                <div role="row" className="space-y-1">
                                    <p className="text-xs text-gray-500">VAT</p>
                                    <p
                                        role="cell"
                                        className="text-base font-semibold text-gray-900"
                                    >
                                        {formatCurrency(kpis.vat)}
                                    </p>
                                </div>
                                <div role="row" className="space-y-1">
                                    <p className="text-xs text-gray-500">Discount</p>
                                    <p
                                        role="cell"
                                        className="text-base font-semibold text-gray-900"
                                    >
                                        {formatCurrency(kpis.discount)}
                                    </p>
                                </div>
                                <div role="row" className="space-y-1">
                                    <p className="text-xs text-gray-500">Delivery fee</p>
                                    <p
                                        role="cell"
                                        className="text-base font-semibold text-gray-900"
                                    >
                                        {formatCurrency(kpis.deliveryFee)}
                                    </p>
                                </div>
                                <div role="row" className="space-y-1">
                                    <p className="text-xs text-gray-500">Total amount</p>
                                    <p
                                        role="cell"
                                        className="text-base font-semibold text-gray-900"
                                    >
                                        {formatCurrency(kpis.total)}
                                    </p>
                                </div>
                                <div role="row" className="space-y-1">
                                    <p className="text-xs text-gray-500">Average check</p>
                                    <p
                                        role="cell"
                                        className="text-base font-semibold text-gray-900"
                                    >
                                        {formatCurrency(kpis.averageCheck)}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Export panel */}
                        <aside
                            aria-label="Report export options"
                            className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100"
                        >
                            <h2 className="text-sm font-semibold text-gray-800">
                                Export report
                            </h2>
                            <p className="text-xs text-gray-500">
                                Export the current aggregated report (
                                {formatLocalDate(report?.fromDate)} –{" "}
                                {formatLocalDate(report?.toDate)}).
                            </p>

                            <div className="mt-2 flex flex-wrap gap-3">
                                <Button
                                    type="button"
                                    onClick={handleExportPDF}
                                    className="flex items-center gap-2 rounded-full bg-pink-500 px-4 py-2 text-xs font-medium text-white hover:bg-pink-600 md:text-sm"
                                    aria-label="Export report as PDF"
                                >
                                    <Download className="h-4 w-4" />
                                    PDF
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleExportCSV}
                                    className="flex items-center gap-2 rounded-full border-gray-200 px-4 py-2 text-xs font-medium text-gray-800 hover:border-pink-500 hover:text-pink-500 md:text-sm"
                                    aria-label="Export report as CSV"
                                >
                                    <Download className="h-4 w-4" />
                                    CSV
                                </Button>
                            </div>

                            <p className="mt-2 text-[11px] text-gray-400">
                                Tip: when exporting PDF, use your browser&apos;s{" "}
                                <span className="font-medium">Save as PDF</span> option in the
                                print dialog.
                            </p>
                        </aside>
                    </div>

                    {/* Charts / histograms */}
                    <div className="mt-8 grid gap-6 lg:grid-cols-2">
                        {/* Region histogram (Bar chart) */}
                        <section
                            aria-label="Sales by region"
                            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100"
                        >
                            <h2 className="text-sm font-semibold text-gray-800">
                                Sales by region (Bar)
                            </h2>
                            <p className="mb-4 mt-1 text-xs text-gray-500">
                                Bar chart showing total sales per region.
                            </p>

                            {!report || regionBuckets.length === 0 ? (
                                <p className="text-xs text-gray-500">
                                    No data available for the selected period.
                                </p>
                            ) : (
                                <div
                                    role="img"
                                    aria-label="Total sales by region as bar chart"
                                    className="mt-2"
                                >
                                    <BarChart
                                        height={260}
                                        dataset={regionBuckets}
                                        xAxis={[
                                            {
                                                dataKey: "region",
                                                scaleType: "band",
                                            },
                                        ]}
                                        series={[
                                            {
                                                dataKey: "total",
                                                label: "Total sales",
                                                color: "#ec4899",
                                            },
                                        ]}
                                        margin={{ left: 40, right: 10, top: 20, bottom: 30 }}
                                    />
                                </div>
                            )}
                        </section>

                        {/* Region share (Donut chart) */}
                        <section
                            aria-label="Region share of total sales"
                            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100"
                        >
                            <h2 className="text-sm font-semibold text-gray-800">
                                Region share (Donut)
                            </h2>
                            <p className="mb-4 mt-1 text-xs text-gray-500">
                                Donut chart showing each region&apos;s share of total sales.
                            </p>

                            {!report || regionBuckets.length === 0 ? (
                                <p className="text-xs text-gray-500">
                                    No data available for the selected period.
                                </p>
                            ) : (
                                <div
                                    role="img"
                                    aria-label="Region share of total sales as donut chart"
                                    className="mt-2 flex items-center justify-center"
                                >
                                    <PieChart
                                        height={260}
                                        series={[
                                            {
                                                innerRadius: 60,
                                                outerRadius: 100,
                                                paddingAngle: 2,
                                                cornerRadius: 4,
                                                data: regionBuckets.map(({ region, total }) => ({
                                                    id: region,
                                                    value: total,
                                                    label: region,
                                                })),
                                            },
                                        ]}
                                    />
                                </div>
                            )}
                        </section>

                        {/* Month line chart */}
                        <section
                            aria-label="Sales trend by month"
                            className="lg:col-span-2 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100"
                        >
                            <h2 className="text-sm font-semibold text-gray-800">
                                Sales by month (Line)
                            </h2>
                            <p className="mb-4 mt-1 text-xs text-gray-500">
                                Line chart of total sales per month for the selected period.
                            </p>

                            {!report || monthBuckets.length === 0 ? (
                                <p className="text-xs text-gray-500">
                                    No data available for the selected period.
                                </p>
                            ) : (
                                <div
                                    role="img"
                                    aria-label="Total sales by month as line chart"
                                    className="mt-2"
                                >
                                    <LineChart
                                        height={260}
                                        dataset={monthBuckets}
                                        xAxis={[
                                            {
                                                dataKey: "label",
                                                scaleType: "point",
                                            },
                                        ]}
                                        series={[
                                            {
                                                dataKey: "total",
                                                label: "Total sales",
                                                color: "#ec4899",
                                            },
                                        ]}
                                        margin={{ left: 40, right: 10, top: 20, bottom: 40 }}
                                    />
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </main>
        </>
    );
}
