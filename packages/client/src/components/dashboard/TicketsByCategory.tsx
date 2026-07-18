// Author: Sam Rivera
// Issue: #32 â€” Visualize tickets by category

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface TicketsByCategoryProps {
  data: Array<{ category: string; count: number }>;
}

export function TicketsByCategory({ data }: TicketsByCategoryProps) {
  return (
    <section className="rounded border border-line bg-white p-5">
      <h2 className="font-semibold">Tickets by category</h2>
      <div className="mt-4 h-72">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#1b7f79" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
