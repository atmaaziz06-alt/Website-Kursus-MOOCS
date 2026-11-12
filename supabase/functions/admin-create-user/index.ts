import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const jsonResponse = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return jsonResponse(405, { error: 'Method not allowed' });

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse(500, { error: 'Server configuration is incomplete' });
  }

  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return jsonResponse(401, { error: 'Authentication required' });
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: authData, error: authError } = await userClient.auth.getUser();
  if (authError || !authData.user) return jsonResponse(401, { error: 'Invalid session' });

  const { data: profile, error: profileError } = await userClient
    .from('profiles')
    .select('role, is_active')
    .eq('id', authData.user.id)
    .maybeSingle();
  if (profileError) return jsonResponse(500, { error: 'Unable to verify administrator access' });
  if (profile?.role !== 'admin' || !profile.is_active) {
    return jsonResponse(403, { error: 'Administrator access required' });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return jsonResponse(400, { error: 'Request body must be valid JSON' });
  }
  if (typeof input !== 'object' || input === null) {
    return jsonResponse(400, { error: 'Invalid request body' });
  }

  const body = input as Record<string, unknown>;
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || fullName.length < 1 || password.length < 8) {
    return jsonResponse(400, { error: 'Email, nama, atau kata sandi tidak valid' });
  }

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (createError) return jsonResponse(400, { error: createError.message });

  const { error: roleError } = await adminClient
    .from('profiles')
    .update({ role: 'instructor', instructor_requested: false })
    .eq('id', created.user.id);
  if (roleError) {
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(created.user.id);
    if (deleteError) {
      return jsonResponse(500, { error: 'Instructor setup failed and account cleanup also failed' });
    }
    return jsonResponse(500, { error: 'Unable to finish instructor account setup' });
  }

  return jsonResponse(201, {
    id: created.user.id,
    email: created.user.email,
    fullName,
    role: 'instructor',
  });
});
