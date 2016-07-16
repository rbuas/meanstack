var webdriver = require('selenium-webdriver');
var chrome = require('selenium-webdriver/chrome');
var By = webdriver.By;
var until = webdriver.until;

var driverFirefox = new webdriver.Builder()
    .forBrowser('firefox')
    .build();

driverFirefox.get('http://www.google.com/ncr');
driverFirefox.findElement(By.name('q')).sendKeys('webdriver');
driverFirefox.findElement(By.name('btnG')).click();
driverFirefox.wait(until.titleIs('webdriver - Google Search'), 1000);
driverFirefox.quit();



// var driverChormeAndroide = new webdriver.Builder()
//     .forBrowser('chrome')
//     .setChromeOptions(new chrome.Options().androidChrome())
//     .build();

// driverChormeAndroide.get('http://www.google.com/ncr');
// driverChormeAndroide.findElement(By.name('q')).sendKeys('webdriver');
// driverChormeAndroide.findElement(By.name('btnG')).click();
// driverChormeAndroide.wait(until.titleIs('webdriver - Google Search'), 1000);
// driverChormeAndroide.quit();



// var driverChormeNexus5 = new webdriver.Builder()
//     .forBrowser('chrome')
//     .setChromeOptions(new chrome.Options()
//         .setMobileEmulation({deviceName: 'Google Nexus 5'}))
//     .build();

// driverChormeNexus5.get('http://www.google.com/ncr');
// driverChormeNexus5.findElement(By.name('q')).sendKeys('webdriver');
// driverChormeNexus5.findElement(By.name('btnG')).click();
// driverChormeNexus5.wait(until.titleIs('webdriver - Google Search'), 1000);
// driverChormeNexus5.quit();