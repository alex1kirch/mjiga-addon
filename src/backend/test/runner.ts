import * as jest from 'jest';

async function runJest() {
  let success = false;
  try {
    //@ts-ignore
    const jestResult = await jest.runCLI({ runInBand: true, verbose: true }, [
      `${__dirname}/jest-integration.json`,
    ]);

    success = jestResult.results.success;
  } catch (e) {
    console.log(e);
    success = false;
  }
  return success;
}

(async () => {
  try {
    console.log('Run jest backend integration tests');
    const allTestsPassed = await runJest();
    allTestsPassed ? process.exit(0) : process.exit(1);
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
})();
