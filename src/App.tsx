import './App.css'
import {ParkingMapPage} from "@/pages/parking-map";
import {useSocialLoginCallback} from "@/entities/user/model/useSocialLoginCallback.ts";
import {useSessionBootstrap} from "@/entities/user/model/useSessionBootstrap.ts";
import {SocialLoginRetryBanner} from "@/widgets/social-login-retry-banner";

function App() {
  useSocialLoginCallback()
  useSessionBootstrap()

  return (
    <main className="app-shell">
      <SocialLoginRetryBanner/>
      <ParkingMapPage/>
    </main>
  )
}

export default App
