import './PhotoReminderEmbeddedPage.css';

/**
 * The photo album is kept as the original Next.js application under
 * /photo-reminder. The Vite shell exposes it here through the dev proxy so
 * NextAuth, its API routes and _next assets all remain owned by Next.
 */
export default function PhotoReminderEmbeddedPage() {
  return (
    <main className="photo-reminder-frame">
      <iframe
        title="Álbum de fotos do casamento"
        src="/photo-reminder-runtime"
        className="photo-reminder-frame__content"
      />
    </main>
  );
}
