// Guestbook services. Both keys are designed to be public (safe to commit):
// - WEB3FORMS_ACCESS_KEY emails each note to you  → get one free at https://web3forms.com
// - SUPABASE_URL + SUPABASE_ANON_KEY store notes and show them on the wall
//   → https://supabase.com, then run docs/guestbook.sql in its SQL editor.
// Until all three are filled in, `npm run dev` keeps notes in your browser only, and
// a production build shows "opens soon" instead of posting.
export const WEB3FORMS_ACCESS_KEY = "9513b546-5208-4b01-8035-17fa1dc5ce01";
export const SUPABASE_URL = "https://cazujaihqvinprfledrg.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhenVqYWlocXZpbnByZmxlZHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NjYxOTcsImV4cCI6MjEwNzA0MjE5N30.nIKSpDmHtY7F2Xg-lg8USR5nG6GZd0eJPkUK-kbuKeg";

export const GUESTBOOK_TABLE = "guestbook_notes";
