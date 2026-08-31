-- Gallery Hamiduzzaman — fix: nobody could ever become an admin
--
-- Run after 20260831000000_artwork_category.sql. Safe to re-run.
--
-- THE BUG
--
-- Signing in at /admin/login failed with "Database error saving new user", and
-- adding an existing account to the allowlist failed with "that account has a
-- password" for an account that had never had one.
--
-- Both came from one assumption in 20260818000000_init_schema.sql: that GoTrue
-- leaves `auth.users.encrypted_password` empty for a passwordless (one-time
-- code) account, so `coalesce(encrypted_password, '') <> ''` reads as "this
-- account has a password". It does not. GoTrue writes something there for
-- passwordless accounts too — verified by creating an account with no password
-- and watching that exact test come back true — so both guards below fired on
-- every admin, and the door was shut on everyone.
--
-- The original migration hedged about precisely this: "if this check is ever
-- wrong about how GoTrue stores an empty password it can only affect admin
-- sign-up ... and it fails closed rather than open". It was wrong, and it did
-- fail closed.
--
-- THE FIX
--
-- The inference is removed rather than corrected. Correcting it would mean
-- guessing what GoTrue writes instead, which is the same mistake again: an
-- internal column of someone else's schema, undocumented, free to change on
-- their next release, and load-bearing for whether the gallery can log in.
--
-- What that check was defending against is already covered elsewhere. It
-- existed so that someone who guessed an allowlisted address could not register
-- it with a password of their own and inherit the admin role. But signup
-- requires email confirmation, so such an account can never be signed in to
-- without the mailbox — and the mailbox is what receives the admin code
-- anyway. On top of that, /admin only ever accepts a session created by a
-- verified one-time code, and re-reads the role from `profiles` on every
-- request. An unusable account holding an unusable role row is not an entry.

-- Admin accounts and passwords ----------------------------------------------
-- Kept as a trigger, narrowed to the one case that can be judged reliably: a
-- password being set or changed on an account that is ALREADY an admin. There
-- OLD exists, so it is a comparison rather than a guess, and it stops an
-- established admin account from quietly gaining a second way in.
create or replace function public.guard_admin_password_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Nothing to compare against on INSERT, and nothing that needs comparing:
  -- see the note above on why sign-up is not the hole it looks like.
  if tg_op <> 'UPDATE' then
    return new;
  end if;

  -- Untouched password, or not an admin address: not our business.
  if new.encrypted_password is not distinct from old.encrypted_password then
    return new;
  end if;

  if public.is_admin_email(new.email) then
    raise exception
      'Admin accounts sign in with a one-time code, not a password (%)', new.email
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;


-- Keep profiles.role in step with the allowlist ------------------------------
-- Same as before minus the password refusal, which is what made adding an
-- allowlist row fail for accounts that had never had a password.
create or replace function public.sync_admin_allowlist()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('app.role_sync', 'on', true);  -- transaction-local

  if tg_op in ('INSERT', 'UPDATE') then
    update public.profiles p
       set role = 'admin'
      from auth.users u
     where u.id = p.id
       and lower(u.email) = new.email
       and p.role <> 'admin';
  end if;

  if tg_op in ('UPDATE', 'DELETE') then
    update public.profiles p
       set role = 'customer'
      from auth.users u
     where u.id = p.id
       and lower(u.email) = old.email
       and not public.is_admin_email(u.email);
  end if;

  perform set_config('app.role_sync', 'off', true);
  return null;
end;
$$;


-- Backfill -------------------------------------------------------------------
-- Anyone allowlisted who already has an account is sitting on a 'customer'
-- profile, because every attempt to promote them raised. Promote them now, so
-- nobody has to delete an account and start again.
do $$
begin
  perform set_config('app.role_sync', 'on', true);

  update public.profiles p
     set role = 'admin'
    from auth.users u
   where u.id = p.id
     and public.is_admin_email(u.email)
     and p.role <> 'admin';

  perform set_config('app.role_sync', 'off', true);
end;
$$;


-- Diagnosis ------------------------------------------------------------------
-- None of the above was visible from the application: the only symptom was a
-- generic 500 out of GoTrue. This reports the real state of every allowlisted
-- address, so the next problem here is one query away rather than a guess.
--
-- `password_hash_prefix` is the first four characters only — enough to identify
-- the format ('$2a$' and friends are bcrypt), never enough to attack. It is the
-- fact this whole migration turned on, and it should not take an experiment to
-- find it out again.
create or replace function public.admin_account_status()
returns table (
  email                text,
  has_account          boolean,
  role                 text,
  email_confirmed      boolean,
  password_hash_prefix text,
  last_sign_in         timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select a.email,
         u.id is not null,
         p.role,
         u.email_confirmed_at is not null,
         left(coalesce(u.encrypted_password, ''), 4),
         u.last_sign_in_at
    from public.admin_allowlist a
    left join auth.users u on lower(u.email) = a.email
    left join public.profiles p on p.id = u.id
   order by a.email;
$$;

revoke execute on function public.admin_account_status() from public, anon, authenticated;
grant execute on function public.admin_account_status() to service_role;
