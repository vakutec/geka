import React, { useEffect, useMemo, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { euToCents } from '@/lib/euToCents';

type Item = { id: string; name: string; price_cents: number };

function useQueryParam(name: string) {
  return new URLSearchParams(window.location.search).get(name);
}

export default function BookingApp() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [displayId, setDisplayId] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [qty, setQty] = useState<number>(1);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBal, setLoadingBal] = useState(false);

  useEffect(() => {
    // Vorbelegung der ID aus QR: ?display_id=TEAM1
    const q = useQueryParam('display_id');
    if (q) setDisplayId(q);
  }, []);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('items').select('id, name, price_cents').eq('is_active', true).order('name');
      if (!error && data) setItems(data as Item[]);
    })();
  }, [supabase]);

  useEffect(() => {
    const id = displayId.trim();
    if (!id) { setBalance(null); return; }
    setLoadingBal(true);
    const t = setTimeout(async () => {
      const { data, error } = await supabase.rpc('get_balance_by_display_id', { _display_id: id });
      setLoadingBal(false);
      if (error || !data || !data[0]) { setBalance(null); return; }
      setBalance(Number(data[0].balance_cents));
    }, 300);
    return () => clearTimeout(t);
  }, [displayId, supabase]);

  const currentItem = items.find(i => i.id === selected) || null;
  const totalCents = currentItem ? currentItem.price_cents * qty : 0;

  const book = async () => {
    setErr(null); setMsg(null);
    const id = displayId.trim();
    if (!id) { setErr('Bitte ID eingeben.'); return; }
    if (!currentItem) { setErr('Bitte Produkt wählen.'); return; }
    if (qty <= 0) { setErr('Menge prüfen.'); return; }

    setBusy(true);
    const rpcName = (window as any).BOOK_RPC || 'book_transaction'; // <-- passe hier deinen RPC-Namen an
    const { data, error } = await supabase.rpc(rpcName, { _display_id: id, _item_id: currentItem.id, _qty: qty });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setMsg('Buchung gespeichert.');

    // Saldo neu laden
    const { data: balData } = await supabase.rpc('get_balance_by_display_id', { _display_id: id });
    if (balData && balData[0]) setBalance(Number(balData[0].balance_cents));

    // Formular zurücksetzen (ID bleibt)
    setSelected('');
    setQty(1);
  };

  return (
    <div className="wrap">
      <div className="card col">
        <div className="row" style={{justifyContent:'space-between'}}>
          <div><span className="badge">Kiosk</span></div>
          <div className="muted">Gesamt: <b className="price">{(totalCents/100).toFixed(2)} €</b></div>
        </div>

        <div className="col">
          <label className="muted">Dein Kürzel / ID</label>
          <input placeholder="z. B. TEAM1" value={displayId} onChange={e=>setDisplayId(e.target.value)} />
          {displayId.trim() && (
            <div className="muted">
              {loadingBal ? 'Lade Kontostand…' : balance !== null ? <>Kontostand: <b className="price">{(balance/100).toFixed(2)} €</b></> : 'ID nicht gefunden'}
            </div>
          )}
        </div>

        <div className="col">
          <label className="muted">Produkt</label>
          <select value={selected} onChange={e=>setSelected(e.target.value)}>
            <option value="">– bitte wählen –</option>
            {items.map(it => (
              <option key={it.id} value={it.id}>{it.name} — {(it.price_cents/100).toFixed(2)} €</option>
            ))}
          </select>
        </div>

        {currentItem && (
          <div className="row" style={{justifyContent:'space-between'}}>
            <div className="row">
              <button onClick={()=>setQty(q=>Math.max(1, q-1))}>−</button>
              <input value={qty} onChange={e=>setQty(Math.max(1, Number(e.target.value)||1))} style={{width:64, textAlign:'center'}}/>
              <button onClick={()=>setQty(q=>q+1)}>+</button>
            </div>
            <div className="muted">Einzelpreis: <b className="price">{(currentItem.price_cents/100).toFixed(2)} €</b></div>
          </div>
        )}

        <div className="row" style={{justifyContent:'flex-end'}}>
          <button onClick={book} disabled={busy || !displayId.trim() || !currentItem}>
            {busy ? 'Speichere…' : 'Buchen'}
          </button>
        </div>

        {msg && <div className="ok">{msg}</div>}
        {err && <div className="error">{err}</div>}

        <div className="muted">Hinweis: Nach der Buchung wird die Produktauswahl gelöscht, die ID bleibt erhalten.</div>
      </div>
    </div>
  );
}