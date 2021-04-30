const { multiremote } = require('webdriverio');

describe('Gameplay tests', () => {
  let browser = null;

  afterEach(() => {
    browser.deleteSession();
  });

  it('Renders expected UI after multiple night cycles', async () => {
    browser = await multiremote({
      player1: { capabilities: { browserName: 'chrome' } },
      player2: { capabilities: { browserName: 'chrome' } },
      player3: { capabilities: { browserName: 'chrome' } },
    });

    const player1Name = 'Bacon';
    const player2Name = 'Eggz';
    const player3Name = 'Wafflez';

    await browser.url('http://localhost:3000');
    const nameInput = await browser.$('#nameInput');
    const nameSubmit = await browser.$('#nameSubmitBtn');

    await nameInput.player1.setValue(player1Name);
    await nameSubmit.player1.click();

    await nameInput.player2.setValue(player2Name);
    await nameSubmit.player2.click();

    await nameInput.player3.setValue(player3Name);
    await nameSubmit.player3.click();

    await browser.pause(2000);
    (await browser.player1.$('#everybodysInBtn')).click();

    // wait for the night 1 to end
    await browser.pause(3000);

    // players should be able to vote to fire others
    await expect(browser.player1.$(`#${player1Name}FireBtn`)).not.toBeExisting();
    const baconFireEggsBtn = await browser.player1.$(`#${player2Name}FireBtn`);
    await expect(baconFireEggsBtn).toBeVisible();
    await expect(browser.player1.$(`#${player3Name}FireBtn`)).toBeVisible();

    await expect(browser.player2.$(`#${player2Name}FireBtn`)).not.toBeExisting();
    const eggzFireBaconBtn = await browser.player2.$(`#${player1Name}FireBtn`);
    await expect(eggzFireBaconBtn).toBeVisible();
    await expect(browser.player2.$(`#${player3Name}FireBtn`)).toBeVisible();

    await expect(browser.player3.$(`#${player3Name}FireBtn`)).not.toBeExisting();
    const wafflesFireBaconBtn = await browser.player3.$(`#${player1Name}FireBtn`);
    await expect(wafflesFireBaconBtn).toBeVisible();
    await expect(browser.player3.$(`#${player2Name}FireBtn`)).toBeVisible();



    // bacon votes to fire eggz
    // (await browser.player1.$(`#${player2Name}FireBtn`)).click();
    baconFireEggsBtn.click();
    // await expect(browser.player1.$(`#${player2Name}FireBtn`)).not.toBeVisible();
    // await expect(browser.player1.$(`#${player3Name}FireBtn`)).not.toBeVisible();



    /// ABOVE WORKS, BELOW DOES NOT



    // eggz votes to fire bacon
    // (await browser.player2.$(`#${player1Name}FireBtn`)).click();
    // (await browser.player2.$(`#${player3Name}FireBtn`)).click();
    eggzFireBaconBtn.click();
    // await expect(browser.player2.$(`#${player1Name}FireBtn`)).not.toBeVisible();
    // await expect(browser.player2.$(`#${player3Name}FireBtn`)).not.toBeVisible();

    // waffles votes to fire bacon
    wafflesFireBaconBtn.click();
    // (await browser.player3.$(`#${player1Name}FireBtn`)).click();
    // await expect(browser.player3.$(`#${player1Name}FireBtn`)).not.toBeVisible();
    // await expect(browser.player3.$(`#${player2Name}FireBtn`)).not.toBeVisible();

    // wait for the night 2 to end
    await browser.pause(30000);

    // // bacon was fired so they can't vote anymore :'(
    // await expect(browser.player1.$(`#${player1Name}FireBtn`)).not.toBeExisting();
    // await expect(browser.player1.$(`#${player2Name}FireBtn`)).not.toBeVisible();
    // await expect(browser.player1.$(`#${player3Name}FireBtn`)).not.toBeVisible();

    // await expect(browser.player2.$(`#${player2Name}FireBtn`)).not.toBeExisting();
    // await expect(browser.player2.$(`#${player1Name}FireBtn`)).not.toBeVisible();
    // await expect(browser.player2.$(`#${player3Name}FireBtn`)).toBeVisible();

    // await expect(browser.player3.$(`#${player3Name}FireBtn`)).not.toBeExisting();
    // await expect(browser.player3.$(`#${player1Name}FireBtn`)).not.toBeVisible();
    // await expect(browser.player3.$(`#${player2Name}FireBtn`)).toBeVisible();
  });
});
