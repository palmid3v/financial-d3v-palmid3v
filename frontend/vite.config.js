import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins:[
    react(),
    tailwindcss(),
    VitePWA({
      registerType:"autoUpdate",
      manifest:{
        name:"Financial-D3v",
        short_name:"Financial-D3v",
        description:"Private personal finance and financial learning workspace",
        theme_color:"#09090b",
        background_color:"#09090b",
        display:"standalone",
        start_url:"/",
        icons:[]
      }
    })
  ]
});
