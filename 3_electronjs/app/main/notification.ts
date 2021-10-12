// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Notificati... Remove this comment to see the full error message
const { Notification } = require("electron");

// display files added notification
exports.filesAdded = (size: any) => {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ title: string; body: string; }... Remove this comment to see the full error message
  const notif = new Notification({
    title: "Files added",
    body: `${size} file(s) has been successfully added.`,
  });

  // @ts-expect-error ts-migrate(2339) FIXME: Property 'show' does not exist on type 'Notificati... Remove this comment to see the full error message
  notif.show();
};
