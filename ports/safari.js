const toggle = document.querySelector('#blocking');
const status = document.querySelector('#status');
const rules = browser.declarativeNetRequest;
async function refresh() {
  try {
    toggle.checked = (await rules.getEnabledRulesets()).includes('starter');
    status.textContent = toggle.checked ? 'Blocking enabled.' : 'Blocking paused.';
    toggle.disabled = false;
  } catch (error) {
    status.textContent = error.message;
  }
}
toggle.onchange = async () => {
  toggle.disabled = true;
  try {
    await rules.updateEnabledRulesets(toggle.checked ?
      {enableRulesetIds:['starter']} : {disableRulesetIds:['starter']});
    await refresh();
  } catch (error) {
    await refresh();
    status.textContent = error.message;
  }
};
refresh();
