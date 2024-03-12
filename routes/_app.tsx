import { AppProps } from "$fresh/server.ts";
import Footer from "islands/footer.jsx";
import { bodyStyle } from "utils/styles.js";


export default function App({ Component }: AppProps) {
    return (

    <html class="dark h-full" lang="es-419">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Smiles Search</title>
        <link rel="stylesheet" href="/styles.css"/>
      </head>
      <body className={bodyStyle}>
        <Component />
        <Footer />
      </body>
    </html>
  );
}
