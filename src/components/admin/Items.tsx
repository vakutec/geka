// FILE: src/components/admin/Items.tsx
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ListOrdered } from 'lucide-react';
import { euToCents } from '@/lib/euToCents';

// --- Tabellentypen (lokal) ---
type ItemRow = {
  id: string;
  name: string;
  price_cents: number;
  is_active: boolean;
};
type ItemInsert = Omit<ItemRow, 'id'>;

export default function Items({ supabase }: { supabase: ReturnType<typeof createClient> }) {
  const [list, setList] = useState<ItemRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [active, setActive] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from<ItemRow>('items')
      .select('id, name, price_cents, is_active')
      .order('name');
    setLoading(false);
    if (error) return;
    setList(data || []);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    setMsg(null); setErr(null);
    const cents = euToCents(String(price));
    if (!name.trim() || cents == null) { setErr('Name/Preis prüfen.'); return; }

    // insert erwartet ein Array → [{ ... }]
    const { error } = await supabase
      .from<ItemInsert>('items')
      .insert([{ name: name.trim(), price_cents: cents, is_active: active }]);

    if (error) { setErr(error.message); return; }
    setMsg('Artikel angelegt.');
    setName(''); setPrice(''); setActive(true);
    load();
  };

  const toggleActive = async (id: string, cur: boolean) => {
    await supabase
      .from<ItemRow>('items')
      .update({ is_active: !cur }) // Partial<ItemRow> passt
      .eq('id', id);
    load();
  };

  return (
    <Card className="rounded-3xl shadow-sm border border-slate-200 bg-white/90 backdrop-blur">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-700">
          <ListOrdered /> <h2 className="font-semibold">Preisliste verwalten</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Input placeholder="Artikelname" value={name} onChange={e=>setName(e.target.value)} />
            <Input placeholder="Preis in €" inputMode="decimal" value={price} onChange={e=>setPrice(e.target.value)} />
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={active} onChange={e=>setActive(e.target.checked)} /> aktiv
            </label>
            <Button onClick={add}>Artikel speichern</Button>
            {msg && <div className="text-green-700 text-sm">{msg}</div>}
            {err && <div className="text-red-700 text-sm">{err}</div>}
          </div>
          <div>
            <div className="max-h-80 overflow-auto border rounded-xl">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 sticky top-0">
                  <tr><th className="text-left p-2">Artikel</th><th className="p-2 text-right">Preis</th><th className="p-2">Aktiv</th><th className="p-2"></th></tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td className="p-2" colSpan={4}>Lade…</td></tr>
                  ) : list.map(row => (
                    <tr key={row.id} className="border-t">
                      <td className="p-2">{row.name}</td>
                      <td className="p-2 text-right">{(row.price_cents/100).toFixed(2)} €</td>
                      <td className="p-2 text-center">{row.is_active ? '✓' : '–'}</td>
                      <td className="p-2 text-right">
                        <Button variant="outline" onClick={()=>toggleActive(row.id, row.is_active)}>
                          {row.is_active ? 'Deaktivieren' : 'Aktivieren'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
