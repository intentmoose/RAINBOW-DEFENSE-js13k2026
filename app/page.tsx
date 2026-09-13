export default function Home() {
  return (
    <main className="shell">
      <header className="topbar">
        <div className="identity">
          <span className="mark" aria-hidden="true">∞</span>
          <div>
            <strong>RAINBOW HERD</strong>
            <small>JS13K 2026 · WEBXR</small>
          </div>
        </div>
        <div className="actions">
          <a className="textLink" href="/play/rainbow-herd.zip" download>13K BUILD</a>
          <a className="launch" href="/play/index.html" target="_blank" rel="noreferrer">OPEN GAME ↗</a>
        </div>
      </header>
      <section className="stage" aria-label="Rainbow Herd playable game">
        <iframe
          title="Rainbow Herd game"
          src="/play/index.html"
          allow="xr-spatial-tracking; fullscreen; autoplay; gamepad"
        />
      </section>
      <footer>
        <p><b>CLEANSE → EARN POINTS → BUILD → UPGRADE → ENDLESS HORDE</b></p>
        <p>Defend the crystal. Unlock the shotgun at wave 3 and sniper at wave 5.</p>
      </footer>
    </main>
  );
}
