const PROJECTS = [
  {
    title: 'Potato Daily',
    tagline: 'Random picker for daily standups',
    url: 'https://potato-daily.pretxel.deno.net/',
    variant: 'potato',
  },
  {
    title: 'Retro Ball',
    tagline: 'Honest, ephemeral team retros',
    url: 'https://retro-ball.pretlabs.app/',
    variant: 'retro',
  },
] as const;

function screenshotUrl(url: string) {
  return `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=640&h=400`;
}

export default function OtherProjects() {
  return (
    <section className="refs" aria-labelledby="refs-heading">
      <h2 id="refs-heading" className="refs__heading">More tools for your team</h2>
      <ul className="refs__list">
        {PROJECTS.map((p) => (
          <li key={p.url}>
            <a className="ref-card" href={p.url} target="_blank" rel="noopener noreferrer">
              <div className={`ref-card__thumb ref-card__thumb--${p.variant}`} aria-hidden="true">
                <img src={screenshotUrl(p.url)} alt="" loading="lazy" width={640} height={400} />
              </div>
              <div className="ref-card__meta">
                <span className="ref-card__title">{p.title}</span>
                <span className="ref-card__tagline">{p.tagline}</span>
                <span className="ref-card__host">{new URL(p.url).host}</span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
