import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ski Jump Draft",
  description: "Gra polegająca na wybraniu drużyny skoczków narciarskich, którzy będą występowali w konkursie wyłaniającym zwycięzce \"Draftu\". Całość jest poprzedzona sesjami treningowymi, gdzie poszczególni skoczkowie prezentują swoje umiejetności.",
  // icons: {
  //   icon: [
  //     { url: '/favicon.jpg', type: 'image/jpeg' },
  //   ],
  // },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className={`dark`}>
      <body>
        {children}
      </body>
    </html>

  );
}
