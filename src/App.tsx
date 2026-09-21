import './App.css'
import {ParkingMapPage} from "@/pages/parking-map";
import {useSocialLoginCallback} from "@/entities/user/model/useSocialLoginCallback.ts";
import {useSessionBootstrap} from "@/entities/user/model/useSessionBootstrap.ts";

function App() {
  useSocialLoginCallback()
  useSessionBootstrap()

  return (
    <main className="app-shell">
      <ParkingMapPage/>
    </main>
  )
}

export default App
