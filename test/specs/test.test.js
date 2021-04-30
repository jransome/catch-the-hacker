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

    // players should be able to vote to fire others, but not themselves
    // player 1
    const baconSelfFireBtn = await browser.player1.$(`#${player1Name}FireBtn`);
    const baconFireWafflesBtn = await browser.player1.$(`#${player3Name}FireBtn`);
    const baconFireEggsBtn = await browser.player1.$(`#${player2Name}FireBtn`);
    await expect(baconSelfFireBtn).not.toBeExisting();
    await expect(baconFireWafflesBtn).toBeVisible();
    await expect(baconFireEggsBtn).toBeVisible();

    // player 2
    const eggzSelfFireBtn = await browser.player2.$(`#${player2Name}FireBtn`);
    const eggzFireBaconBtn = await browser.player2.$(`#${player1Name}FireBtn`);
    const eggzFireWafflezBtn = await browser.player2.$(`#${player3Name}FireBtn`);
    await expect(eggzSelfFireBtn).not.toBeExisting();
    await expect(eggzFireBaconBtn).toBeVisible();
    await expect(eggzFireWafflezBtn).toBeVisible();

    // player 3
    const wafflesSelfFireBtn = await browser.player3.$(`#${player3Name}FireBtn`);
    const wafflesFireBaconBtn = await browser.player3.$(`#${player1Name}FireBtn`);
    const wafflesFireEggzBtn = await browser.player3.$(`#${player2Name}FireBtn`);
    await expect(wafflesSelfFireBtn).not.toBeExisting();
    await expect(wafflesFireBaconBtn).toBeVisible();
    await expect(wafflesFireEggzBtn).toBeVisible();

    // do voting - eggs gets fired :'(
    baconFireEggsBtn.click();
    await expect(baconFireEggsBtn).not.toBeVisible();
    await expect(baconFireWafflesBtn).not.toBeVisible();

    eggzFireWafflezBtn.click();
    await expect(eggzFireWafflezBtn).not.toBeVisible();
    await expect(eggzFireBaconBtn).not.toBeVisible();

    wafflesFireEggzBtn.click();
    await expect(wafflesFireEggzBtn).not.toBeVisible();
    await expect(wafflesFireBaconBtn).not.toBeVisible();

    // wait for the night 2 to end
    await browser.pause(3000);

    // assert that fired players can't vote, and that can active players can't vote to fire players who have already been fired
    await expect(baconSelfFireBtn).not.toBeExisting();
    await expect(baconFireWafflesBtn).toBeVisible();
    await expect(baconFireEggsBtn).not.toBeVisible();

    await expect(eggzSelfFireBtn).not.toBeExisting();
    await expect(eggzFireBaconBtn).not.toBeVisible();
    await expect(eggzFireWafflezBtn).not.toBeVisible();

    await expect(wafflesSelfFireBtn).not.toBeExisting();
    await expect(wafflesFireBaconBtn).toBeVisible();
    await expect(wafflesFireEggzBtn).not.toBeVisible();
  });
});
