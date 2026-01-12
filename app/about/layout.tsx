import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | LoftyXphereHomes",
  description: "Learn about LoftyXphereHomes - your trusted partner for premium shortlet apartment rentals in Nigeria.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

