import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ArtworksProvider } from "./hooks/ArtworksContext";
import { Layout } from "./components/Layout";

function App() {
  return (
    <ArtworksProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />} />
          <Route path="/privacy" element={<Layout />} />
        </Routes>
      </Router>
    </ArtworksProvider>
  );
}

export default App;
