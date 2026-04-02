import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          border: '2.5px solid #0d0d0d',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
        }}
      >
        {/* Red top half */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 14,
            background: '#E8002D',
            display: 'flex',
          }}
        />
        {/* White bottom half */}
        <div
          style={{
            position: 'absolute',
            top: 18,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#f0f0f0',
            display: 'flex',
          }}
        />
        {/* Black center band */}
        <div
          style={{
            position: 'absolute',
            top: 13,
            left: 0,
            right: 0,
            height: 5,
            background: '#0d0d0d',
            display: 'flex',
          }}
        />
        {/* Center button */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            width: 11,
            height: 11,
            borderRadius: 6,
            background: '#ffffff',
            border: '2.5px solid #0d0d0d',
            display: 'flex',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
