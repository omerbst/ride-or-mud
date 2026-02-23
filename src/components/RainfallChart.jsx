import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export default function RainfallChart({ hourlyData, totalRain }) {
    if (!hourlyData || hourlyData.length === 0) return null;

    // Format data for recharts
    const chartData = hourlyData.map((d, i) => {
        const date = new Date(d.time);
        const hoursAgo = Math.round((Date.now() - date.getTime()) / (1000 * 60 * 60));
        return {
            name: `${hoursAgo}h ago`,
            rain: d.rain,
            hour: date.getHours(),
            idx: i,
        };
    });

    // Only show every 6th label to avoid crowding
    const tickFormatter = (value, idx) => {
        if (idx % 8 === 0) return value;
        return "";
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div
                    style={{
                        background: "var(--color-bg-secondary)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        fontSize: "0.75rem",
                    }}
                >
                    <p style={{ color: "var(--color-text-secondary)", marginBottom: 2 }}>
                        {payload[0].payload.name}
                    </p>
                    <p style={{ color: "var(--color-accent-blue)", fontWeight: 600 }}>
                        {payload[0].value} mm
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="rainfall-section">
            <div className="rainfall-header">
                <span className="rainfall-title">Past 4-Day Rainfall Trend</span>
                <span className="rainfall-total">{totalRain.toFixed(1)} mm total</span>
            </div>
            <ResponsiveContainer width="100%" height={100}>
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="name"
                        tickFormatter={tickFormatter}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9, fill: "#64748b" }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9, fill: "#64748b" }}
                        width={30}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="rain"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#rainGradient)"
                        dot={false}
                        activeDot={{ r: 3, fill: "#3b82f6" }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
