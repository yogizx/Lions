import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyBlogger } from "../../data/blogsData";
import logo from "../../assets/images/logo.png.jpeg";

const SESSION_KEY = "lions_blogger_session";

export function isBloggerLoggedIn() {
  return sessionStorage.getItem(SESSION_KEY) === "true";
}

export function bloggerLogout() {
  sessionStorage.removeItem(SESSION_KEY);
}

function BloggerLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const blogger = await verifyBlogger(username, password);
      
      if (blogger) {
        sessionStorage.setItem(SESSION_KEY, "true");
        sessionStorage.setItem("blogger_name", blogger.username);
        navigate("/lions/bloger/dashboard");
      } else {
        setError("Invalid username or password.");
      }
    } catch (err) {
      console.error(err);
      setError("Error connecting to database. Make sure the bloggers table exists.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Lions Logo" className="h-20 w-auto mb-3 object-contain" />
          <h1 className="text-2xl font-bold text-[#061b3a]">Blogger Portal</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to manage your blogs</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#061b3a] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#061b3a] focus:border-transparent pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff7a00] text-white py-2.5 rounded-lg font-semibold hover:bg-[#e66a00] transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Lionsglobalservices.com | Powered By Cyferplus.com
        </p>
      </div>
    </div>
  );
}

export default BloggerLogin;
