import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" />
      <path d="M12 15a7 7 0 0 0-7 7" />
      <path d="M12 8a3 3 0 0 0-3 3" />
    </svg>
  );
}

export function ChefHat(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M12 3c1.93 0 3.5 1.57 3.5 3.5S13.93 10 12 10s-3.5-1.57-3.5-3.5S10.07 3 12 3z"/>
            <path d="M4 10h16v4H4z"/>
            <path d="M4 14h16v2a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-2z"/>
        </svg>
    );
}
