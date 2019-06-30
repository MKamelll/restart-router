// dependencies
const { Bar, Presets } = require('cli-progress');
const puppeteer = require('puppeteer');
const redl = require('readline-sync');
const fs = require('fs');

// vars
const credsFileName = './creds.json';
const selectorForUserName = '#txt_Username';
const selectorForPassword = '#txt_Password';
const selectorForSignInButton = '#btnLogin';
const selectorForFirstButton = '#link_Admin_3';
const selectorForSecondButton = '#link_Admin_3_1';
const selectorForLastButton =
  'body > div:nth-child(1) > table > tbody > tr:nth-child(2) > td:nth-child(2) > button';

// init
async function restartRouter() {
  // Checks if the user is trying to reset
  if (isResetInfo()) {
    resetInfo();
  }

  // prompt for info
  const { ipRouter, userName, password } = getInfo();

  // create a browser instance
  const browser = await puppeteer.launch();
  // a tab
  const page = await browser.newPage();

  try {
    // A progress bar
    const pbar = new Bar({}, Presets.legacy);
    const steps = 13;
    let progress = 0;

    // Start bar
    pbar.start(steps, 0);

    // Update bar with the new progress
    const updateBar = value => {
      progress += value;
      pbar.update(progress);
    };

    // Go to address
    await page.goto(ipRouter);
    updateBar(1);

    // Event listener for the confirmation dialog
    page.on('dialog', async dialog => {
      await dialog.accept(); // wait to accept
      await page.waitFor(3000); // wait for the browser to load

      updateBar(steps - progress); // Last update
      pbar.stop(); // Stops the bar

      console.log('\nMain Router Restarted!');
      await browser.close(); // close browser
    });

    // Avoid going too fast
    await page.waitFor(3000);
    updateBar(2);

    // Set the values of each field
    await page.type(selectorForUserName, userName, { delay: 100 });
    await page.type(selectorForPassword, password, { delay: 100 });
    updateBar(2);

    // sign in button click
    await page.click(selectorForSignInButton);
    updateBar(1);

    // wait again
    await page.waitFor(3000);

    // get the frame that has the first button
    let frames = await page.frames()[4];

    // click the first button
    await frames.click(selectorForFirstButton);

    // click the second button
    await frames.click(selectorForSecondButton);
    updateBar(2);

    // ....
    await page.waitFor(3000);

    // get the frame that has the last button
    let framesBu = await page.frames()[6];
    updateBar(2);

    // wait for the button to be available
    let reboot = await framesBu.waitForSelector(selectorForLastButton);

    // click last button
    await reboot.click();
  } catch (e) {
    // error handler
    console.log('our error ', e);
    browser.close();
  }
}

// Get Router info
function getInfo() {
  // Checks if user already
  if (fs.existsSync(credsFileName)) {
    const { ipRouter, userName, password } = require(credsFileName);
    return {
      ipRouter,
      userName,
      password
    };
  }

  // Get creds
  let ipRouter = redl.question('Enter Your Router IpAddress: ');
  // In case the ip is entered from ipconfig '192.xxx.x.x'
  if (!ipRouter.includes('http')) {
    ipRouter = `http://${ipRouter}`;
  }

  const userName = redl.question('Enter Your User Name: ');
  const password = redl.question('Enter Your Password: ', {
    hideEchoBack: true // Stars for password
  });

  // Return if complete creds
  if (ipRouter && userName && password) {
    const creds = {
      ipRouter,
      userName,
      password
    };

    // Write the creds to a file
    saveCreds(creds);

    // Return
    return creds;
  } else {
    // Exit
    console.log('Incomplete credentials!');
    process.exit();
  }
}

// Create a creds file
function saveCreds(creds) {
  fs.writeFileSync(credsFileName, JSON.stringify(creds));
}

// Check if the script ran with --reset flag
function isResetInfo() {
  // Parse args for the flag
  const flag = 2 in process.argv ? process.argv[2] : false;
  if (flag && flag === '--reset') {
    return true;
  }
  return false;
}

// Reset user info
function resetInfo() {
  // In case of running with --reset flag without
  // an actual file
  if (!fs.existsSync(credsFileName)) {
    console.log('You have not added any creds yet!');
  } else {
    fs.unlinkSync(credsFileName);
    console.log('Old creds are gone!');
  }
  getInfo();
}

// Exports
module.exports = {
  restartRouter
};
