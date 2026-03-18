'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, phoneToEmail } from '@/lib/supabase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data);
    setLoading(false);
  }

  const login = useCallback(async (phone, password) => {
    const email = phoneToEmail(phone);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const register = useCallback(async ({ phone, password, email, profileData }) => {
    const authEmail = email || phoneToEmail(phone);
    const { data, error } = await supabase.auth.signUp({ email: authEmail, password });
    if (error) throw error;

    // If no session yet (email confirmation required), sign in to get one
    if (!data.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password,
      });
      if (signInError) throw signInError;
    }

    const userId = data.user.id;
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      ...profileData,
      phone,
    });
    if (profileError) throw profileError;
    return data;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await fetchProfile(user.id);
  }, [user]);

  return { user, profile, loading, login, register, logout, refreshProfile };
}
