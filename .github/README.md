# urlgen

urlgen is a search utility to help make targetted searches faster. it will take in a search term and can provide encoded deeplinks to run the search within the given platform.

there are a number of _categories_ of which adopted search engines have been paired against such as various network elements, email addresses, various cryptocurrencies and more.

## search engines

the file `urlgen.csv` is where all providers are added/configured. note the searchstring use of `%s` values. a simple example below;

```csv
category,provider,searchstring
ip,shodan.io,https://www.shodan.io/host/%s
domain,virustotal.com,https://www.virustotal.com/gui/domain/%s
string,google.com,https://www.google.com/search?q=%s
```

## contributing

contributions are welcome.

if you want to add a new provider, open an issue or follow the below;

1. fork this repo
2. make your changes in the `urlgen.csv` file
3. submit a pull request

note: avoid making changes to the `docs/urlgen.json` file - it is automatically generated based upon the CSV by a GitHub Actions runner

---
