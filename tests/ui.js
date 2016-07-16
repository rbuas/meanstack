var webdriver = require('selenium-webdriver');
var chrome = require('selenium-webdriver/chrome');
var By = webdriver.By;
var until = webdriver.until;

describe("ui", function() {
    this.timeout(20 * 1000);
    it("ui google base", function(done) {
        var driver = new webdriver.Builder()
                    .forBrowser('chrome')
                    //.setChromeOptions(new chrome.Options().androidChrome())
                    //.setMobileEmulation({deviceName: 'Google Nexus 5'}))
                    .build();

        driver.get('http://www.google.com/ncr');
        driver.findElement(By.name('q')).sendKeys('webdriver');
        driver.findElement(By.name('btnG')).click();
        driver.wait(until.titleIs('webdriver - Google Search'), 1000);
        driver.quit();
        done();
    });
});