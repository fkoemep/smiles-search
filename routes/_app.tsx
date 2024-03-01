import { AppProps } from "$fresh/server.ts";
import Footer from "islands/footer.jsx";
import { bodyStyle } from "utils/styles.js";

const isDenoDeploy = Deno.env.get("DENO_DEPLOYMENT_ID") !== undefined;

export default function App({ Component }: AppProps) {
    return (

    <html class="dark h-full" lang="es-419">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Smiles Search</title>
        {/* posthog */}
        {isDenoDeploy
          ? (
            <script
              dangerouslySetInnerHTML={{
                __html:
                  `!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    posthog.init('phc_RBB3bPLpJcDSIHYpo1JI4m8hmy1zXIVLvZLc0O3ZVpN',{api_host:'https://app.posthog.com'})`,
              }}
            />
          )
          : null}
      </head>
      {/*<body class="bg-gray-200 h-full flex flex-col"*/}
      <body class={bodyStyle}>
        <Component />
        <Footer />
      </body>
    </html>
  );
}
