"""Install the unsigned Firefox build temporarily and exercise dashboard messaging and DNR."""
import json
import sys
import uuid
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait

identifier = 'aegis-shield@georgiarachel07.github.io'
origin = str(uuid.uuid4())
options = webdriver.FirefoxOptions()
options.add_argument('-headless')
options.set_preference('extensions.webextensions.uuids', json.dumps({identifier: origin}))
with webdriver.Firefox(options=options) as driver:
    assert driver.install_addon(sys.argv[1], temporary=True) == identifier
    driver.get('moz-extension://'+origin+'/dashboard.html')
    wait = WebDriverWait(driver, 20)
    wait.until(lambda d: d.find_element(By.ID,'connection').text == 'Monitoring active')
    driver.find_element(By.ID,'toggle-blocking').click()
    wait.until(lambda d: 'paused' in d.find_element(By.ID,'protection-title').text)
    driver.find_element(By.ID,'toggle-blocking').click()
    wait.until(lambda d: 'active' in d.find_element(By.ID,'protection-title').text)
    print('Firefox temporary install, dashboard messaging and native ruleset toggles passed.')
