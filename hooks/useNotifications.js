'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getFCMToken, onForegroundMessage } from '@/lib/firebase';

export function useNotifications(userId) {
  const [foregroundMessage, setForegroundMessage] = useState(null);

  useEffect(() => {
    if (!userId) return;
    requestAndSaveToken(userId);

    let unsubscribe;
    onForegroundMessage((payload) => {
      setForegroundMessage(payload);
    }).then((fn) => { unsubscribe = fn; });

    return () => { if (unsubscribe) unsubscribe(); };
  }, [userId]);

  async function requestAndSaveToken(uid) {
    try {
      if (!('Notification' in window)) return;
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      const token = await getFCMToken();
      if (!token) return;

      await supabase.from('push_tokens').upsert(
        { user_id: uid, token },
        { onConflict: 'token' }
      );
    } catch (err) {
      console.error('Notification setup error:', err);
    }
  }

  return { foregroundMessage };
}
