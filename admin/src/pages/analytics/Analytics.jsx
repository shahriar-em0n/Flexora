import { useState } from 'react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, Legend,
} from 'recharts'

const MONTHLY = [
    { month: 'Sep', revenue: 88000, orders: 41 }, { month: 'Oct', revenue: 102000, orders: 55 },
    { month: 'Nov', revenue: 135000, orders: 72 }, { month: 'Dec', revenue: 198000, orders: 110 },
    { month: 'Jan', revenue: 121000, orders: 63 }, { month: 'Feb', revenue: 161000, orders: 100 },
]
const TOP_CATS = [
    { cat: "Women's", revenue: 62000 }, { cat: "Men's", revenue: 48000 },
    { cat: 'Kids', revenue: 31000 }, { cat: 'Sport', revenue: 12000 }, { cat: 'Accessories', rev: 8000 },
]

export default function Analytics() {
    const [period, setPeriod] = useState('6months')

    return (
        <div>
            <div className="page-header">
                <div><h1 className="page-title">Analytics</h1><p className="page-subtitle">Business performance overview</p></div>
                <div style={{ display: 'flex', gap: 6 }}>
                    {['7days', '6months', 'year'].map(p => (
                        <button key={p} className={`btn btn-sm ${period === p ? 'btn-primary' : 'btn-outline'}`} onClick={() => setPeriod(p)}>
                            {p === '7days' ? '7 Days' : p === '6months' ? '6 Months' : 'This Year'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary cards */}
            <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Revenue', value: '৳8,05,000', sub: 'All time' },
                    { label: 'Total Orders', value: '441', sub: 'All time' },
                    { label: 'Avg Order Value', value: '৳1,824', sub: 'Per order' },
                    { label: 'Conversion Rate', value: '3.2%', sub: 'Visitors to buyers' },
                ].map(c => (
                    <div key={c.label} className="stat-card">
                        <span className="stat-card__label">{c.label}</span>
                        <div className="stat-card__value" style={{ fontSize: '1.4rem' }}>{c.value}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--admin-muted)' }}>{c.sub}</span>
                    </div>
                ))}
            </div>

            {/* Revenue chart */}
            <div className="card" style={{ marginBottom: '1rem' }}>
                <div className="card-header"><span className="card-title">Monthly Revenue & Orders</span></div>
                <div className="card-body">
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={MONTHLY} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E8EAED" />
                            <XAxis dataKey="month" fontSize={11} tick={{ fill: '#6B7280' }} />
                            <YAxis yAxisId="left" fontSize={11} tick={{ fill: '#6B7280' }} tickFormatter={v => `৳${(v / 1000).toFixed(0)}k`} />
                            <YAxis yAxisId="right" orientation="right" fontSize={11} tick={{ fill: '#6B7280' }} />
                            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#C9A96E" strokeWidth={2.5} name="Revenue (৳)" dot={false} />
                            <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={2} name="Orders" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Category revenue */}
            <div className="card">
                <div className="card-header"><span className="card-title">Revenue by Category (This Month)</span></div>
                <div className="card-body">
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={TOP_CATS} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E8EAED" />
                            <XAxis dataKey="cat" fontSize={11} tick={{ fill: '#6B7280' }} />
                            <YAxis fontSize={11} tick={{ fill: '#6B7280' }} tickFormatter={v => `৳${(v / 1000).toFixed(0)}k`} />
                            <Tooltip formatter={v => [`৳${v?.toLocaleString()}`, 'Revenue']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                            <Bar dataKey="revenue" fill="#C9A96E" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
