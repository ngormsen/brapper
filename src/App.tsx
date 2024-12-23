import { BrowserRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import MainPage from "./pages/MainPage";

// Custom hook to determine if header should be shown
const useShowHeader = () => {
  const location = useLocation();
  // Add routes where header should be hidden
  const routesWithoutHeader = ['/login', '/signup', '/'];
  return !routesWithoutHeader.includes(location.pathname);
};

// Separate Navigation component since we need to use the hook
const Navigation = () => {
  const showHeader = useShowHeader();

  if (!showHeader) return null;

  return (
    <nav className="p-4 bg-gray-100">
      <Link to="/" className="mr-4 hover:underline">Main Page</Link>
    </nav>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<MainPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;