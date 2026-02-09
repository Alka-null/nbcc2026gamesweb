import RequireAdmin from "../auth/require-admin";

export default function DashboardPage() {
  return (
    <RequireAdmin>
      <div>
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <p>Welcome to the NBCC Strategy Games admin portal. Use the navigation above to manage users, games, and jigsaw puzzles.</p>
      </div>
    </RequireAdmin>
  );
}
