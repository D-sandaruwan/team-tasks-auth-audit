import "./globals.css";
import Nav from "@/components/Nav";

export const metadata = { title: "Team Tasks" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <Nav />
        <main className="mx-auto max-w-3xl p-6">{children}</main>
      </body>
    </html>
  );
}
