import FormAndResults from "islands/form-and-results.jsx";

function decodeParams (url) {
    try{
        return atob(url.search.slice(1));
    }
    catch{
        return undefined;
    }
}

export default function Home({url}) {
    return (
          <FormAndResults params={Object.fromEntries(new URLSearchParams(decodeParams(url)))}/>
  );
}
