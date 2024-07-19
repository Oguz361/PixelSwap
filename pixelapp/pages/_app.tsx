import type { AppProps } from "next/app"; 
import { ThirdwebProvider } from "@thirdweb-dev/react"; 
import { PolygonAmoyTestnet } from "@thirdweb-dev/chains"; 
import "../styles/globals.css"; 
import Navbar from "../components/Navbar"; 

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider
      clientId={process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID} 
      activeChain={PolygonAmoyTestnet} 
    >
      {Navbar ? <Navbar /> : <div>Navbar failed to load</div>}
      <Component {...pageProps} />
    </ThirdwebProvider>
  );
}

export default MyApp;
