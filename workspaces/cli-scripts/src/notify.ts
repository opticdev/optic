import notifier from 'node-notifier';

function run(url: string, icon: string) {
  notifier.notify({
    title: 'Observed Unexpected API Behavior',
    message: 'Click here to review the diff in Optic',
    icon,
    timeout: 7,
    open: url,
    wait: true,
  });
}

const [, , url, icon] = process.argv;
run(url, icon);
