# Better Smiles Search

An improved version of mciparelli's Smiles searcher.


This version includes the following improvements:
- Ability to hide Gol flights on international routes departing from/arriving to Brazil
- Adaptive dark mode
- Roundtrip and flexible date flights search
- Dynamic and dependant filters: cabin, airlines, and layover airports
- Ability to decide whether to fetch accurate taxes or not (if not, the search will be faster)
- Optimized performance 
- Updated libraries
- General UI improvements and bug fixes

Please keep in mind that due to recent changes in Smiles API, the search may take longer than usual. This is not a bug, but a consequence of the new API.

Coming soon: retries for failed requests that respect bottleneck's rate limits instead of bypassing them.

https://better-smiles-search.deno.dev