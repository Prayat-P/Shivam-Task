const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: false, dumpio: true });
  const page = await browser.newPage();

  await page.goto(
    "https://en.wikipedia.org/wiki/List_of_countries_by_GDP_(nominal)"
  );
  await new Promise((resolve) => setTimeout(resolve, 5000));
  let country =  await page.evaluate(async()=> {
    let c = [];
    let countrylist = document.querySelectorAll(
      "table[class*='wikitable'] > tbody > tr:not(:first-child)  >td:first-child > a"
    );

    for (let i = 0; i < countrylist.length; i++) {
      let url = countrylist[i]
        .getAttribute("href")
        .replace(/(.+)/g, "https://en.wikipedia.org$1");
      c.push(url);
    }
    return c;
    
  });
  

  for (let i = 0; i < country.length; i++) {
    await page.goto(country[i]);
    let co = country[i].replace(/(.+GDP|Economy_of_)(.+)/g,'$2')
    console.log(`The details for ${co}`)
    await new Promise((resolve) => setTimeout(resolve, 5000));

    let ex = await page.evaluate(async() => {
      let exportPart = [];  
      let exportPartners = document.evaluate(
        '//th[@class="infobox-label" and contains(.,"Main export partners")]/following-sibling::td/div/ul/li/a',
        document,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
      );
      for (let i = 0; i < exportPartners.snapshotLength; i++) {
        exportPart.push(exportPartners.snapshotItem(i).textContent);
      }
      return exportPart;

    });

    let im = await page.evaluate(async() => {
        let importPart = [];  
        let importPartners = document.evaluate(
            '//th[@class="infobox-label" and contains(.,"Main import partners")]/following-sibling::td/div/ul/li/a',
            document,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
          );
          for (let j = 0; j < importPartners.snapshotLength; j++) {
            importPart.push(importPartners.snapshotItem(j).textContent);
          }
          return importPart;
  
      });

      console.log(`import partners: ${im.length ? im : "No import partners"}`);
      console.log(`export partners: ${ex.length ? ex : "No export partners"}`);
  }

  await browser.close();
})();
