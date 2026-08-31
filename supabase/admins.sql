-- Gallery Hamiduzzaman — who is allowed into /admin
--
-- This is the whole access-control list. Add an address to the array, run the
-- script in the Supabase SQL editor, and that person can sign in at /admin/login
-- with a code emailed to them. Safe to run as often as you like.
--
-- Nothing else grants admin. Signing up on the public site never does, and
-- neither does knowing the URL — an address that is not in this table gets the
-- same "if that address is registered, a code is on its way" reply as a typo.

insert into public.admin_allowlist (email)
select lower(btrim(e))
from unnest(array[
  'rhythm4538@gmail.com'
  -- , 'someone.else@example.com'
]) as e
on conflict (email) do nothing;


-- To take someone's access away, delete their row. The sync trigger drops that
-- account back to an ordinary customer immediately — they do not have to be
-- signed out for it to take effect, because every admin screen re-checks the
-- role on the next request.
--
--   delete from public.admin_allowlist where email = 'someone.else@example.com';


-- Who currently has access, and whether they have ever signed in:
--
--   select a.email,
--          p.role,
--          u.last_sign_in_at
--     from public.admin_allowlist a
--     left join auth.users u on lower(u.email) = a.email
--     left join public.profiles p on p.id = u.id
--    order by a.email;
