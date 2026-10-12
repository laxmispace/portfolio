import MusicPlayer from "./components/MusicPlayer";

export default function App() {
  return (
    <div className="size-full flex items-center justify-center">
      <div style={{ width: "390px", height: "480px" }}>
        <MusicPlayer />
      </div>
    </div>
  );
}
