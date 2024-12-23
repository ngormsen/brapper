import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import ConEvPage from "./pages/ConEvPage";

const App = () => {
  return (
    <BrowserRouter>
      <nav className="p-4 bg-gray-100">
        <Link to="/" className="mr-4 hover:underline">Main Page</Link>
        <Link to="/conev" className="hover:underline">ConEv Page</Link>
      </nav>
      <Routes>
        <Route path="/" element={<ConEvPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;