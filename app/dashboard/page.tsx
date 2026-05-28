import Link from "next/link";
export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row items-center justify-center gap-6 p-4">

      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Register New Store</h2>
        <Link href="register-store">
        <button
          type="button"
          className="w-full bg-green-600 text-white p-3 rounded hover:bg-blue-700"
        >
          Create Store
        </button></Link>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Store Page</h2>
        <Link href="store-page">
        <button
          type="button"
          className="w-full bg-green-600 text-white p-3 rounded hover:bg-blue-700"
        >
          Store page
        </button>
        </Link>
      </div>

    </div>
  );
}
