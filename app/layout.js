import './globals.css';

export const metadata = {
  title: 'Knowledge Management',
  description: 'Quản lý kiến thức & ghi chú',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
