globalThis.NOMA_BUILD_READERS('pharma',[
  [
    "A Missing Batch Signature",
    "the packaging production area",
    "complete an electronic batch record before review",
    "one manufacturing step had no recorded electronic signature",
    "check the audit trail and ask the authorised operator to review the step",
    "the missing approval was handled through the approved procedure",
    "data integrity requires traceable actions rather than undocumented shortcuts",
    "The batch had finished physical processing, but electronic review was still in progress."
  ],
  [
    "The Unexpected Equipment Status",
    "the manufacturing control room",
    "start a scheduled batch on a mixing vessel",
    "the MES showed the equipment as unavailable",
    "check the maintenance record and contact the equipment owner",
    "the batch was delayed until the status was correctly assessed",
    "system interlocks must be understood before attempting overrides",
    "The planner expected the vessel to be ready because the previous work order appeared closed."
  ],
  [
    "A Recipe Version Conflict",
    "the process engineering office",
    "approve a new electronic manufacturing recipe",
    "the configured parameter differed from the authorised master record",
    "compare the recipe versions and open a formal change assessment",
    "the team corrected the configuration before releasing the recipe",
    "approved instructions must remain consistent across systems",
    "The discrepancy was discovered during a review, not during routine production."
  ],
  [
    "An Interface Message Goes Missing",
    "the MES integration support room",
    "confirm that material consumption reached the ERP",
    "a network interruption prevented an acknowledgement from arriving",
    "inspect the interface log and reconcile the transaction identifiers",
    "the team confirmed one valid record without creating a duplicate",
    "message retries must preserve traceability and data consistency",
    "The operator had already completed the production step, so repeating it was not a safe solution."
  ],
  [
    "A Deviation During Testing",
    "the validation test laboratory",
    "execute a documented system qualification test",
    "the observed result differed from the protocol acceptance criterion",
    "record the test deviation and investigate the evidence",
    "the team understood the defect and retested after an approved fix",
    "failed tests need transparent documentation rather than silent correction",
    "The tested function controlled an important approval step and required a clear decision."
  ],
  [
    "A Change Control Review",
    "the quality systems meeting room",
    "evaluate a proposed software configuration change",
    "the original proposal did not explain impacts on existing reports",
    "request a risk assessment and identify required regression tests",
    "the change was approved with clear testing conditions",
    "changes need proportionate evidence before implementation",
    "The update looked minor from a technical perspective, but several departments used its data."
  ],
  [
    "An Audit Trail Investigation",
    "the quality assurance review office",
    "explain why a batch parameter changed twice",
    "the recorded values and timestamps looked inconsistent",
    "review user actions and system time settings with authorised staff",
    "the investigation identified a time synchronisation problem",
    "reliable timestamps matter when reconstructing electronic records",
    "The operators had followed the normal workflow, so the investigation focused on evidence rather than assumptions."
  ],
  [
    "A Cleaner Equipment Handover",
    "the production line beside the filling area",
    "release cleaned equipment for its next approved use",
    "the cleaning log lacked one verification step",
    "pause the handover and contact the responsible reviewer",
    "the documentation was completed before the equipment was released",
    "complete records support decisions about equipment readiness",
    "The next team was waiting, but production pressure could not replace the agreed checks."
  ],
  [
    "A Periodic Access Review",
    "the system administration office",
    "review user permissions in a validated application",
    "some accounts still held privileges from an older project",
    "compare current roles with approved job responsibilities",
    "unnecessary permissions were removed through change control",
    "least-privilege access limits avoidable security risks",
    "Several colleagues had moved teams during the year and their access had not been reassessed."
  ],
  [
    "An AI Pilot on the Shop Floor",
    "the digital innovation meeting room",
    "evaluate a model that predicts equipment stoppages",
    "the pilot dataset contained incomplete maintenance labels",
    "identify missing evidence and define human review of predictions",
    "the team postponed wider use until the dataset was improved",
    "model outputs need context and qualified human oversight",
    "The algorithm looked promising during demonstrations, but operators needed reliable explanations for its alerts."
  ]
]);
