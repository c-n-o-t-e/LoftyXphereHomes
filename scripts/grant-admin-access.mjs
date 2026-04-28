import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';
import pg from 'pg';

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (!a) continue;
    if (a === '--help' || a === '-h') args.help = true;
    else if (a.startsWith('--email=')) args.email = a.slice('--email='.length);
    else if (a === '--email') args.email = argv[++i];
    else if (a.startsWith('--role=')) args.role = a.slice('--role='.length);
    else if (a === '--role') args.role = argv[++i];
    else if (a === '--no-invite') args.noInvite = true;
  }
  return args;
}

function usage() {
  return `
Usage:
  npm run grant-admin -- --email 1milehood@gmail.com --role receptionist
  npm run grant-admin -- --email nwagbogwuchukwudi@gmail.com --role admin

Options:
  --no-invite   If the user doesn't exist in Supabase Auth, fail instead of inviting.
`;
}

function requireEnv(name) {
  const v = process.env[name];
  if (!v || !String(v).trim()) throw new Error(`Missing env var: ${name}`);
  return String(v).trim();
}

async function getOrInviteSupabaseUserByEmail(supabase, email, { noInvite }) {
  // Supabase JS doesn't provide a direct "get user by email" call; listUsers is fine for small userbases.
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) throw new Error(`Supabase listUsers failed: ${error.message}`);
  const existing = data.users.find((u) => (u.email || '').toLowerCase() === email.toLowerCase());
  if (existing) return existing;

  if (noInvite) {
    throw new Error(
      `No Supabase user found for ${email}. Create the user (or remove --no-invite) and retry.`
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
    email,
    { redirectTo: `${baseUrl}/admin` }
  );
  if (inviteError) {
    // If user already exists, fall back to listing again.
    const message = inviteError.message || '';
    if (message.toLowerCase().includes('already')) {
      return getOrInviteSupabaseUserByEmail(supabase, email, { noInvite: true });
    }
    throw new Error(`Supabase inviteUserByEmail failed: ${inviteError.message}`);
  }
  if (!inviteData?.user?.id) {
    throw new Error('Supabase invite succeeded but no user id returned.');
  }
  return inviteData.user;
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(usage());
    process.exit(0);
  }

  const email = String(args.email || '').trim().toLowerCase();
  const role = String(args.role || '').trim();
  if (!email || !email.includes('@')) throw new Error('Provide --email someone@example.com');
  if (role !== 'admin' && role !== 'receptionist') {
    throw new Error('Provide --role admin|receptionist');
  }

  const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
  const serviceRole = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  const supabase = createClient(supabaseUrl, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const user = await getOrInviteSupabaseUserByEmail(supabase, email, { noInvite: Boolean(args.noInvite) });

  const directUrl = requireEnv('DIRECT_URL');
  const { Client } = pg;
  const client = new Client({ connectionString: directUrl });
  await client.connect();
  try {
    const id = `adm_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const res = await client.query(
      `
      INSERT INTO "AdminUser" ("id","supabaseUserId","email","role","createdAt")
      VALUES ($1,$2,$3,$4,now())
      ON CONFLICT ("email")
      DO UPDATE SET "supabaseUserId" = EXCLUDED."supabaseUserId", "role" = EXCLUDED."role"
      RETURNING "email","supabaseUserId","role","createdAt";
      `,
      [id, user.id, email, role]
    );
    const record = res.rows?.[0] ?? null;

    console.log(
      JSON.stringify(
        {
          ok: true,
          adminUser: record,
          note:
            role === 'admin'
              ? 'Admin access granted. Log in via /login and open /admin.'
              : 'Receptionist access granted. Log in via /login and open /admin.',
        },
        null,
        2
      )
    );
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(String(err?.message || err));
  process.exit(1);
});

