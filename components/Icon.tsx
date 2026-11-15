import type { SVGProps } from 'react';

export type IconName =
  | 'copy'
  | 'check'
  | 'history'
  | 'leave'
  | 'edit'
  | 'crown'
  | 'clock'
  | 'card'
  | 'close'
  | 'menu';

const PATHS: Record<IconName, React.ReactNode> = {
  copy: (
    <>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" />
    </>
  ),
  check: <path d="M4.5 12.5l5 5 10-11" />,
  history: (
    <>
      <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" />
      <path d="M3 4v4.5h4.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  leave: (
    <>
      <path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" />
      <path d="M10 8l-4 4 4 4" />
      <path d="M6 12h9" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3z" />
      <path d="M13.5 8.5l3 3" />
    </>
  ),
  crown: <path d="M4 18h16M5 15l-1-8 4.5 3.5L12 5l3.5 5.5L20 7l-1 8z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l2.5 1.5" />
    </>
  ),
  card: (
    <>
      <rect x="6" y="3.5" width="12" height="17" rx="2" />
      <path d="M9 8l6 8M15 8l-6 8" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6L6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
};

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
  /** Provide a label only when the icon stands alone without visible text. */
  label?: string;
}

export default function Icon({ name, size = 20, label, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="icon"
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      focusable="false"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
