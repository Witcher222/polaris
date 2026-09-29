import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

// Mock data based on historical trends for Antarctic Sea Ice Extent (in million sq km)
const data = [
  { year: '1980', extent: 18.9, avg: 18.5 },
  { year: '1985', extent: 18.7, avg: 18.5 },
  { year: '1990', extent: 18.4, avg: 18.5 },
  { year: '1995', extent: 18.6, avg: 18.5 },
  { year: '2000', extent: 18.8, avg: 18.5 },
  { year: '2005', extent: 19.1, avg: 18.5 },
  { year: '2010', extent: 19.3, avg: 18.5 },
  { year: '2015', extent: 19.6, avg: 18.5 },
  { year: '2020', extent: 18.2, avg: 18.5 },
  { year: '2022', extent: 17.5, avg: 18.5 },
  { year: '2023', extent: 16.9, avg: 18.5 },
  { year: '2024', extent: 17.1, avg: 18.5 },
  { year: '2025', extent: 16.8, avg: 18.5 },
];

export default function IceExtentChart() {
  return (
    <div className="w-full h-80 bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="font-display text-xl text-polar">Antarctic Winter Sea Ice Extent</h3>
        <p className="text-sm text-muted-foreground">Historical trend (million square kilometers)</p>
      </div>
      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorExtent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
            <YAxis domain={['dataMin - 1', 'dataMax + 1']} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              itemStyle={{ color: '#0d9488', fontWeight: 'bold' }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            <Area type="monotone" name="Measured Extent" dataKey="extent" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorExtent)" />
            <Line type="monotone" name="Historical Average" dataKey="avg" stroke="#94a3b8" strokeWidth={2} dot={false} strokeDasharray="5 5" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
