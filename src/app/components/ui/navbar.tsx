import type { ComponentProps } from "react";
import { cn } from "./cn";

// --- Composable parts ---

export function NavbarRoot({
  className,
  children,
  ...props
}: ComponentProps<"nav">) {
  return (
    <nav
      className={cn(
        "flex h-14 w-full items-center border-border-primary border-b bg-bg-page px-6",
        className
      )}
      {...props}
    >
      {children}
    </nav>
  );
}

export function NavbarLogo({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      {children ?? (
        <>
          <span className="font-bold font-primary text-accent-green text-xl">
            {">"}
          </span>
          <span className="font-medium font-primary text-lg text-text-primary">
            devroast
          </span>
        </>
      )}
    </div>
  );
}

export function NavbarSpacer({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex-1", className)} {...props} />;
}

export function NavbarLink({
  className,
  children,
  ...props
}: ComponentProps<"a">) {
  return (
    <a
      className={cn(
        "font-primary text-[13px] text-text-secondary transition-colors hover:text-text-primary",
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
}

// --- Pre-composed convenience ---

interface NavbarProps extends ComponentProps<"nav"> {
  links?: { href: string; label: string }[];
}

export function Navbar({ className, links = [], ...props }: NavbarProps) {
  return (
    <NavbarRoot className={className} {...props}>
      <NavbarLogo />
      <NavbarSpacer />
      {links.map((link) => (
        <NavbarLink href={link.href} key={link.href}>
          {link.label}
        </NavbarLink>
      ))}
    </NavbarRoot>
  );
}
