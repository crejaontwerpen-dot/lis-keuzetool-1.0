export const metadata = {
  title: "LiS Keuzetool voor Werkenden",
  description:
    "Keuzetool van de Leidse instrumentmakers School voor werkenden.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
