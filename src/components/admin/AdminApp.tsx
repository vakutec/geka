// FILE: src/components/admin/AdminApp.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Lock, LogOut, Loader2 } from 'lucide-react';

import Payments from '@/components/admin/Payments';
// (Optional vorbereitet)
import Members from '@/components/admin/Members';
import Admins from '@/components/admin/Admins';
import Items from '@/components/admin/Items';

export default function AdminApp() {
  const supabase = useMemo(
    () => createClient(import.meta.env.VITE_SUPABASE_URL!, import.meta.env.VITE_SUPABASE_ANON_KEY!),
    []
  );

  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [authErr, setAuthErr] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signing, setSigning] = useState(false);

  const [roleLoading, setRoleLoading] = useState(true);
  const [roleError, setRoleError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => listener?.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    (async () => {
      setRoleLoading(true); setRoleError(null);
      if (!session) { setIsAdmin(null); setRoleLoading(false); return; }
      const { data, error } = await supabase.from('profiles').select('role').eq('user_id', session.user.id).maybeSingle();
      if (error) { setRoleError(error.message); setIsAdmin(null); setRoleLoading(false); return; }
      setIsAdmin(data?.role === 'admin'); setRoleLoading(false);
    })();
  }, [session, supabase]);

  const signIn = async () => {
    setSigning(true); setAuthErr(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setSigning(false); if (error) setAuthErr(error.message);
  };
  const signOut = async () => { await supabase.auth.signOut(); };

  if (!session) {
    return (
      <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-sm">
          <Card className="rounded-3xl shadow-sm border border-slate-200 bg-white/90 backdrop-blur">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2"><Lock /> <h1 className="text-xl font-semibold">Admin Login</h1></div>
              <Input placeholder="E-Mail" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
              <Input placeholder="Passwort" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
              <Button onClick={signIn} disabled={signing} className="w-full h-11 text-base">
                {signing ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin"/> Anmelden…</>) : 'Anmelden'}
              </Button>
              {authErr && <div className="text-sm text-red-600">{authErr}</div>}
              <p className="text-xs text-slate-500">Nach dem Login starten wir im Bereich <b>Zahlungen</b>. Weitere Bereiche können wir danach zuschalten.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (roleLoading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center bg-slate-50 text-slate-600">
        <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/> prüfe Berechtigungen…</span>
      </div>
    );
  }

  if (roleError) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="text-2xl">⚠️</div>
          <div className="font-semibold">Fehler beim Berechtigungscheck</div>
          <div className="text-sm text-slate-600 max-w-md break-all">{roleError}</div>
          <Button onClick={()=>location.reload()} className="mt-2">Nochmal versuchen</Button>
        </div>
      </div>
    );
  }

  if (isAdmin !== true) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="text-2xl">🚫</div>
          <div className="font-semibold">Kein Zugriff</div>
          <div className="text-sm text-slate-600">Dieser Account hat keine Admin-Rechte.</div>
          <Button onClick={signOut} className="mt-2"><LogOut className="mr-2 h-4 w-4"/> Abmelden</Button>
        </div>
      </div>
    );
  }

  // View: Nur Zahlungen aktiv
  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge>Admin</Badge>
            <span className="text-sm text-slate-500">angemeldet</span>
          </div>
          <Button variant="outline" onClick={signOut}><LogOut className="h-4 w-4 mr-2"/> Logout</Button>
        </header>

        <Payments supabase={supabase} />
        {/* Später: <Members supabase={supabase} /> <Admins .../> <Items .../> */}
      </div>
    </div>
  );
}