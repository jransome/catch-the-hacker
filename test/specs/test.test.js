const { multiremote } = require('webdriverio');

describe('waffles', () => {
  it('blah', async () => {
    const browser = await multiremote({
      player1: { capabilities: { browserName: 'chrome' } },
      player2: { capabilities: { browserName: 'chrome' } },
      player3: { capabilities: { browserName: 'chrome' } },
    });

    await browser.url('http://localhost:3000');
    const { player1, player2, player3 } = browser;
    // const players = [player1, player2, player3];

    const nameInput1 = await player1.$('#nameInput');
    const nameInput2 = await player2.$('#nameInput');
    const nameInput3 = await player3.$('#nameInput');

    const player1Name = 'bacon';
    const player2Name = 'facon';
    const player3Name = 'dacon';
    await nameInput1.setValue(player1Name);
    await nameInput2.setValue(player2Name);
    await nameInput3.setValue(player3Name);

    (await player1.$('#nameSubmitBtn')).click();
    (await player2.$('#nameSubmitBtn')).click();
    (await player3.$('#nameSubmitBtn')).click();
    await browser.pause(5000);

    (await player1.$('#everybodysInBtn')).click();

    await expect(player1.$('#playerNameInfo')).toBeExisting();
    await expect(player1.$('#playerNameInfo')).toHaveTextContaining(player1Name);
    await expect(player2.$('#playerNameInfo')).toBeExisting();
    await expect(player2.$('#playerNameInfo')).toHaveTextContaining(player2Name);
    await expect(player3.$('#playerNameInfo')).toBeExisting();
    await expect(player3.$('#playerNameInfo')).toHaveTextContaining(player3Name);

    // wait for the night to end
    await browser.pause(15000);
    browser.closeWindow();
  });
});
