globalThis.NOMA_BUILD_READERS('technology',[
  [
    "An Unexpected Deployment Failure",
    "a software team's release room",
    "deploy a tested application update",
    "the deployment failed because an environment variable was missing",
    "review the build logs and compare the production configuration",
    "the team corrected the variable and completed the deployment",
    "configuration checks belong in the release checklist",
    "The update had passed local tests, but the production environment used a different set of settings."
  ],
  [
    "The Slow Dashboard",
    "a product team's shared workspace",
    "improve a dashboard that loaded slowly",
    "a database query became expensive when the dataset grew",
    "inspect the query plan and add an appropriate database index",
    "the dashboard loaded much faster without changing its design",
    "measuring a bottleneck is better than guessing its cause",
    "The designers initially suspected the chart library, although the browser spent most of its time waiting for data."
  ],
  [
    "A Lost Connection",
    "a warehouse network control room",
    "restore access to a local application",
    "one network switch stopped responding after a power interruption",
    "check the network path and replace the faulty connection",
    "the terminals connected again after testing",
    "understanding dependencies helps restore service safely",
    "Several workers could still use their devices offline, but shared records were temporarily unavailable."
  ],
  [
    "The Suspicious Login",
    "the security operations centre",
    "investigate an unusual account sign-in",
    "the access log showed repeated attempts from an unfamiliar location",
    "disable the affected session and verify the user through a trusted channel",
    "the account remained protected while credentials were reset",
    "identity checks matter more than urgent-looking messages",
    "The user received an email that appeared genuine but contained a link to a different domain."
  ],
  [
    "An Offline-First Prototype",
    "a small mobile development office",
    "test a web application without internet",
    "some JavaScript files had not been cached by the service worker",
    "inspect the cache list and add the missing application resources",
    "the installed application opened correctly in airplane mode",
    "offline behaviour must be tested on a real device",
    "The application worked perfectly on a desktop browser, which had hidden the mobile-specific loading problem."
  ],
  [
    "A Broken API Contract",
    "the integration team's testing lab",
    "connect two services through an API",
    "the second service expected a field with a different name",
    "compare the request payload with the documented schema",
    "both services exchanged the expected data after a mapping fix",
    "contract tests detect interface misunderstandings early",
    "Each team had verified its own code separately, but no one had tested the full request."
  ],
  [
    "A Safer Backup Restore",
    "the database administration office",
    "restore a previous data snapshot for a test",
    "the backup file was older than the team expected",
    "verify its timestamp and test the restore in an isolated environment",
    "the team recovered the correct snapshot without affecting production",
    "backup files should be verified before an emergency",
    "The previous restore exercise had succeeded, but the most recent export had not been checked."
  ],
  [
    "The Duplicate Event",
    "the cloud services monitoring room",
    "prevent duplicate messages from creating repeated orders",
    "a retry mechanism delivered the same event more than once",
    "add an idempotency check using a stable event identifier",
    "repeated messages no longer created duplicate records",
    "retries require safeguards against repeated processing",
    "The service was designed to recover from temporary failures, yet the original implementation had overlooked duplicates."
  ],
  [
    "A Careful Feature Release",
    "the product manager's office",
    "launch a new screen to a small group of users",
    "the usability test revealed unexpected navigation problems",
    "disable the feature flag and review the reported steps",
    "the older interface stayed available while the fix was tested",
    "reversible releases reduce risk for existing users",
    "The new screen looked attractive, but the team wanted to protect the everyday workflow."
  ],
  [
    "A Helpful Error Message",
    "the application support desk",
    "make a confusing upload error easier to diagnose",
    "users received only a generic message when a file was too large",
    "add a clear size limit and a specific explanation",
    "users understood how to correct the problem themselves",
    "good error handling is part of the user experience",
    "The support team had answered the same question repeatedly because the original message gave no useful guidance."
  ]
]);
