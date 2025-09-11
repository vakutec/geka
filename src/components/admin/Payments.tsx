// FILE: src/components/admin/Payments.tsx
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Euro, Loader2, Check } from 'lucide-react';
import { euToCents } from '@/lib/euToCents';

export default function Payments({ supabase }: { supabase: ReturnType<typeof createClient> }) {
  const [displayId, setDisplayId] = useState('');
  const [liveBalance, setLiveBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [method, setMethod] = useState('Bar');
  const [amountEu, setAmountEu] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = displayId.trim();
    if (!id) { setLiveBalance(null); return; }
    setLoadingBalance(true);
    const t = setTimeout(async () => {
      const { data, error } = await supabase.rpc('get_balance_by_display_id', { _display_id: id });
      setLoadingBalance(false);
      if (error || !data || !data[0]) { setLiveBalance(null); return; }
      setLiveBalance(Number(data[0].balance_cents));
    }, 300);
    return () => clearTimeout(t);
  }, [displayId, supabase]);

  const quick = (eu: number) => setAmountEu(String(eu));
  const book = async () => {
    setError(null); setMessage(null);
    const id = displayId.trim();
    const cents = euToCents(String(amountEu));
    if (!id) { setError('Bitte eine ID eingeben.'); return; }
    if (cents == null) { setError('Betrag prüfen.'); return; }
    setBusy(true);
    const { data, error } = await supabase.rpc('admin_add_payment_by_display_id', {
      _display_id: id,
      _amount_cents: cents,
      _method: method,
    });
    setBusy(false);
    if (error) { setError(error.message); return; }
    const bal = data && data[0] ? Number(data[0].new_balance_cents) : null;
    setLiveBalance(bal);
    setMessage('Zahlung erfasst.');
    setAmountEu('');
  };

  return (
    <Card className="rounded-3xl shadow-sm border border-slate-200 bg-white/90 backdrop-blur">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-700">
          <Euro /> <h2 className="font-semibold">Zahlungen entgegennehmen</h2>
        </div>
        <div className="flex gap-2">
          <Input placeholder="display_id (z. B. MAX23)" value={displayId} onChange={(e) => setDisplayId(e.target.value)} className="flex-1" />
          <Button variant="secondary" onClick={() => setDisplayId('')}>Clear</Button>
        </div>
        {displayId.trim() && (
          <div className="text-sm">
            {loadingBalance ? (
              <span className="inline-flex items-center gap-2 text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Lade Saldo…
              </span>
            ) : liveBalance !== null ? (
              <>Aktueller Stand: <span className="font-semibold">{(liveBalance / 100).toFixed(2)} €</span></>
            ) : (
              <span className="text-slate-500">ID nicht gefunden</span>
            )}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => quick(20)}>+20 €</Button>
          <Button variant="outline" onClick={() => quick(50)}>+50 €</Button>
          <Button variant="outline" onClick={() => quick(100)}>+100 €</Button>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Betrag in €" inputMode="decimal" value={amountEu} onChange={(e) => setAmountEu(e.target.value)} />
          <select value={method} onChange={(e) => setMethod(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">
            <option>Bar</option>
            <option>Überweisung</option>
          </select>
          <Button onClick={book} disabled={busy || !displayId.trim()} className="h-11">
            {busy ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin"/> Speichern…</>) : (<><Check className="h-4 w-4 mr-2"/> Gutschreiben</>)}
          </Button>
        </div>
        {message && <div className="p-3 rounded-xl bg-green-50 text-green-800 border border-green-200">{message}</div>}
        {error && <div className="p-3 rounded-xl bg-red-50 text-red-800 border border-red-200">{error}</div>}
      </CardContent>
    </Card>
  );
}