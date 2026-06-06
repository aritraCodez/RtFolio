import { ArtworksProvider } from "./hooks/ArtworksContext";
import { Layout } from "./components/Layout";

function App() {
  return (
    <ArtworksProvider>
      <Layout />
    </ArtworksProvider>
  );
}

export default App;
