import type { AnchorHTMLAttributes, ReactNode } from "react";

type NextLinkMockProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

export default function Link({ children, href, ...props }: NextLinkMockProps) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
