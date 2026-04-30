import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Pokemon Poker — Pokémon-themed Scrum planning poker';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '70px 80px',
          background:
            'radial-gradient(circle at 18% 22%, rgba(232,0,45,0.32) 0%, transparent 55%),' +
            'radial-gradient(circle at 82% 80%, rgba(68,92,247,0.32) 0%, transparent 55%),' +
            'linear-gradient(135deg, #09090f 0%, #10101e 100%)',
          color: '#eeeeff',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 42,
              border: '5px solid #0d0d0d',
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
            }}
          >
            <div style={{ position: 'absolute', inset: 0, background: '#E8002D', display: 'flex' }} />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '50%',
                background: '#f0f0f0',
                display: 'flex',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '46%',
                left: 0,
                right: 0,
                height: 8,
                background: '#0d0d0d',
                display: 'flex',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 26,
                height: 26,
                marginTop: -13,
                marginLeft: -13,
                borderRadius: 13,
                background: '#fff',
                border: '5px solid #0d0d0d',
                display: 'flex',
              }}
            />
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#FFD700',
              display: 'flex',
            }}
          >
            Pokemon Poker
          </div>
        </div>

        {/* Title block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              fontSize: 124,
              fontWeight: 800,
              lineHeight: 0.95,
              letterSpacing: '-0.04em',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span
              style={{
                background:
                  'linear-gradient(135deg, #FFD700 0%, #ff9800 50%, #E8002D 100%)',
                backgroundClip: 'text',
                color: 'transparent',
                display: 'flex',
              }}
            >
              Plan smarter.
            </span>
            <span style={{ color: '#eeeeff', display: 'flex' }}>Vote with Pokémon.</span>
          </div>
          <div
            style={{
              fontSize: 32,
              color: 'rgba(238,238,255,0.72)',
              maxWidth: 920,
              lineHeight: 1.35,
              display: 'flex',
            }}
          >
            Real-time Scrum planning poker. Create a room, share the code, reveal together — no
            accounts, no setup.
          </div>
        </div>

        {/* Footer row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 24,
            color: 'rgba(238,238,255,0.5)',
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', gap: 18 }}>
            <span style={{ display: 'flex' }}>Fibonacci · 0 · 1 · 2 · 3 · 5 · 8 · 13 · 21 · 34 · ∞</span>
          </div>
          <div style={{ display: 'flex', color: '#FFD700' }}>Free · Open · Real-time</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
