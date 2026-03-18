import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  try {
    const { blood_group, city, request_id, requester_name, hospital_name, donor_name, target_user_id } = await request.json();

    // If targeting a specific user (donor accepted), notify just that user
    if (target_user_id && donor_name) {
      const { data: tokens } = await supabase
        .from('push_tokens')
        .select('token')
        .eq('user_id', target_user_id);

      if (!tokens?.length) {
        return NextResponse.json({ success: true, sent: 0 });
      }

      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      if (!serviceAccountKey) {
        return NextResponse.json({ success: true, sent: 0, note: 'No FCM key configured' });
      }

      const serviceAccount = JSON.parse(serviceAccountKey);
      const sent = await sendFCMNotifications(
        tokens.map((t) => t.token),
        `${donor_name} Accepted Your Request`,
        `They will donate ${blood_group} blood at ${hospital_name}`,
        serviceAccount
      );

      return NextResponse.json({ success: true, sent });
    }

    // Broadcast to matching donors
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('blood_group', blood_group);

    if (!profiles?.length) {
      return NextResponse.json({ success: true, sent: 0 });
    }

    const userIds = profiles.map((p) => p.id);
    const { data: tokens } = await supabase
      .from('push_tokens')
      .select('token')
      .in('user_id', userIds);

    if (!tokens?.length) {
      return NextResponse.json({ success: true, sent: 0 });
    }

    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      return NextResponse.json({ success: true, sent: 0, note: 'No FCM key configured' });
    }

    const serviceAccount = JSON.parse(serviceAccountKey);
    const sent = await sendFCMNotifications(
      tokens.map((t) => t.token),
      'Blood needed urgently!',
      `${blood_group} blood needed at ${hospital_name}`,
      serviceAccount
    );

    return NextResponse.json({ success: true, sent });
  } catch (err) {
    console.error('send-notification error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

async function sendFCMNotifications(tokens, title, body, serviceAccount) {
  try {
    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    const { getMessaging } = await import('firebase-admin/messaging');

    const appName = 'admin-app';
    const existingApp = getApps().find((a) => a.name === appName);
    const adminApp = existingApp || initializeApp({ credential: cert(serviceAccount) }, appName);
    const messaging = getMessaging(adminApp);

    let sent = 0;
    for (const token of tokens) {
      try {
        await messaging.send({
          token,
          notification: { title, body },
          android: { notification: { icon: 'icon-192x192', color: '#E8334A' } },
          webpush: {
            notification: { icon: '/icon-192x192.png', badge: '/icon-192x192.png' },
          },
        });
        sent++;
      } catch {}
    }
    return sent;
  } catch (err) {
    console.error('FCM admin error:', err);
    return 0;
  }
}
