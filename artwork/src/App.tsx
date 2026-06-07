import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ArtworksProvider } from "./hooks/ArtworksContext";
import { AppView } from "./views/AppView/AppView";

function App() {
  return (
    <ArtworksProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AppView />} />
          <Route path="/privacy" element={<AppView />} />
        </Routes>
      </Router>
    </ArtworksProvider>
  );
}

export default App;
