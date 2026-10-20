import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let allUsers: any[] = [];
    let page = 1;
    const perPage = 1000;

    while (true) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage,
      });

      if (error) throw error;
      if (!data || !data.users || data.users.length === 0) break;

      allUsers = allUsers.concat(data.users);
      if (data.users.length < perPage) break;
      page++;
    }

    const exported = allUsers.map((u) => {
      const metadata = u.user_metadata || {};
      return {
        id: u.id,
        email: u.email || '',
        first_name: metadata.first_name || metadata.name?.split(' ')[0] || '',
        last_name: metadata.last_name || metadata.name?.split(' ').slice(1).join(' ') || '',
        full_name: metadata.full_name || metadata.name || '',
        whatsapp: metadata.whatsapp_number || metadata.phone || u.phone || '',
        created_at: u.created_at || '',
        last_sign_in_at: u.last_sign_in_at || '',
      };
    });

    const url = new URL(req.url);
    const format = url.searchParams.get('format') || 'json';

    if (format === 'csv') {
      const headers = ['EMAIL', 'FIRSTNAME', 'LASTNAME', 'SMS', 'CREATED_AT', 'LAST_SIGN_IN_AT'];
      const escapeCsv = (str: string) => {
        if (!str) return '""';
        return `"${String(str).replace(/"/g, '""')}"`;
      };

      const rows = exported.map((u) => [
        escapeCsv(u.email),
        escapeCsv(u.first_name),
        escapeCsv(u.last_name),
        escapeCsv(u.whatsapp),
        escapeCsv(u.created_at),
        escapeCsv(u.last_sign_in_at),
      ].join(','));

      const csvContent = [headers.join(','), ...rows].join('\r\n');

      return new Response(csvContent, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="brevo_contacts_homedesignenglish.csv"',
        },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ total: exported.length, users: exported }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
