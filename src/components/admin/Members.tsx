// FILE: src/components/admin/Members.tsx
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users } from 'lucide-react';

export default function Members({ supabase }: { supabase: ReturnType<typeof createClient> }) {
  const [query, setQuery] = useState('');
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [disp, setDisp] = useState('');
  const [name, setName] = useState('');
  const [active, setActive] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const q = query.trim();
    let req = supabase.from('accounts').select('id, display_id, name, is_active').order('display_id');
    if (q) req = req.ilike('display_id', `%${q}%`);
    const { data, error } = await req.limit(50);
    setLoading(false);
    if (error) return;
    setList(data || []);
  };
  useEffect(()=>{ load(); }, []);

  const upsert = async () => {
    setBusy(true); setMsg(null); setErr(null);
    const did = disp.trim();
    if (!did) { setErr('Kürzel (display_id) ist erforderlich.'); setBusy(false); return; }
    const { error } = await supabase.from('accounts').upsert({ display_id: did, name: name || did, is_active: active }, { onConflict: 'display_id' });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setMsg('Gespeichert.'); setDisp(''); setName(''); setActive(true);
    load();
  };
  const toggleActive = async (id: string, cur: boolean) => {
    await supabase.from('accounts').update({ is_active: !cur }).eq('id', id);
    load();
  };

  return (
    <Card className="rounded-3xl shadow-sm border border-slate-200 bg-white/90 backdrop-blur">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-700"><Users /> <h2 className="font-semibold">Mitglieder verwalten</h2></div>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Input placeholder="Kürzel (display_id)" value={disp} onChange={e=>setDisp(e.target.value)} />
            <Input placeholder="Name (optional)" value={name} onChange={e=>setName(e.target.value)} />
            <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={active} onChange={e=>setActive(e.target.checked)} /> aktiv</label>
            <Button onClick={upsert} disabled={busy}>{busy ? 'Speichern…' : 'Mitglied speichern'}</Button>
            {msg && <div className="text-green-700 text-sm">{msg}</div>}
            {err && <div className="text-red-700 text-sm">{err}</div>}
          </div>
          <div>
            <div className="flex gap-2 mb-2">
              <Input placeholder="Suche Kürzel…" value={query} onChange={e=>setQuery(e.target.value)} />
              <Button variant="outline" onClick={load}>Suchen</Button>
            </div>
            <div className="max-h-80 overflow-auto border rounded-xl">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 sticky top-0">
                  <tr><th className="text-left p-2">Kürzel</th><th className="text-left p-2">Name</th><th className="p-2">Aktiv</th><th className="p-2"></th></tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td className="p-2" colSpan={4}>Lade…</td></tr>
                  ) : list.map(row => (
                    <tr key={row.id} className="border-t">
                      <td className="p-2 font-mono">{row.display_id}</td>
                      <td className="p-2">{row.name}</td>
                      <td className="p-2 text-center">{row.is_active ? '✓' : '–'}</td>
                      <td className="p-2 text-right"><Button variant="outline" onClick={()=>toggleActive(row.id, row.is_active)}>{row.is_active ? 'Deaktivieren' : 'Aktivieren'}</Button></td>
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