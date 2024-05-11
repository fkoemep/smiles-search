import { AppProps } from "$fresh/server.ts";
import Footer from "islands/footer.jsx";

export default function App({ Component }: AppProps) {
    return (

    <html lang="es-419" style='min-width:100%; min-height:100%;'>
    <head>
        <meta charSet="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"/>
        <title>Smiles Search</title>
        <link rel="stylesheet" href="/styles.css"/>

        {(
                <script
                    dangerouslySetInnerHTML={{
                    __html:
                    `
                    if(localStorage.theme === undefined){
                        localStorage.theme = 'dark';
                        document.documentElement.className = localStorage.theme;
                    }
                    else if (localStorage.theme === 'system') {                   
                        window.matchMedia('(prefers-color-scheme: dark)').matches ? (document.documentElement.className = 'dark') : (document.documentElement.className = 'light');  
                    }
                    else{
                        document.documentElement.className = localStorage.theme;
                    }              
                    `,
                }}
                />
        )}
    </head>
    <body className="bg-gray-100 dark:bg-[#202124] dark:text-gray-100">
    <Component/>
    </body>
    </html>
    );
}
