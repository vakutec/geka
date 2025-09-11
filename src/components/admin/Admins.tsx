// FILE: src/components/admin/Admins.tsx
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings } from 'lucide-react';

export default function Admins({ supabase }: { supabase: ReturnType<typeof createClient> }) {
  const [mail, setMail] = useState('');
  const [roleMsg, setRoleMsg] = useState<string | null>(null);
  const [roleErr, setRoleErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const setRole = async (role: 'admin' | 'user') => {
    setBusy(true); setRoleErr(null); setRoleMsg(null);
    const { error } = await supabase.rpc('admin_set_role', { _email: mail.trim(), _role: role });
    setBusy(false);
    if (error) { setRoleErr(error.message); return; }
    setRoleMsg(`Rolle gesetzt: ${role}`);
  };

  return (
    <Card className="rounded-3xl shadow-sm border border-slate-200 bg-white/90 backdrop-blur">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-700"><Settings /> <h2 className="font-semibold">Admins verwalten</h2></div>
        <p className="text-sm text-slate-600">Neue Admins registrieren sich zuerst selbst (E-Mail + Passwort). Danach hier die Rolle auf <b>admin</b> setzen.</p>
        <div className="flex items-center gap-2">
          <Input placeholder="E-Mail des Nutzers" type="email" value={mail} onChange={e=>setMail(e.target.value)} className="flex-1" />
          <Button onClick={()=>setRole('admin')} disabled={busy || !mail.trim()}>Zu Admin machen</Button>
          <Button variant="outline" onClick={()=>setRole('user')} disabled={busy || !mail.trim()}>Zu User zurücksetzen</Button>
        </div>
        {roleMsg && <div className="text-green-700 text-sm">{roleMsg}</div>}
        {roleErr && <div className="text-red-700 text-sm">{roleErr}</div>}
      </CardContent>
    </Card>
  );
}