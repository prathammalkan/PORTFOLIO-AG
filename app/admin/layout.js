export default function AdminLayout({ children }) {
  return (
    <div className="admin-page" style={{ minHeight: '100vh' }}>
      {children}
    </div>
  );
}
