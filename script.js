const cases = {
  headache: {
    number: "01",
    label: "Headache",
    medicine: "AEVY’s headache remedy",
    description:
      "For the patient who gets a headache from overthinking and missing you a little too much.",
    default:
      "One little call, one “stop overthinking,” and a reminder that AEVY is right here. Repeat as needed. ",
    note: "Possible side effects: smiling at your phone and missing your pharmacist even more.",
    ideas: [
      "One video call with AEVY",
      "Kisses, redeem in person",
      "Drink water and stop overthinking",
    ],
  },
  behavior: {
    number: "02",
    label: "Behavior",
    medicine: "Behaviour change",
    description:
      "For bothering you and promising to improve my habits.",
    default:
      "take one deep breath, listen to AEVY, and change one habit instead of making another promise. Repeat daily.",
    note: "Possible side effects: more patience, fewer arguments, and one much happier girlfriend.",
    ideas: [
      "Listen first, defend myself later",
      "One habit changed at a time",
      "No making you carry my expectations",
    ],
  },
  weight: {
    number: "03",
    label: "Weight gain",
    medicine: "More-to-Hug Plan",
    description:
      "For the patient who lost weight and whose favorite pharmacist wants him healthy, fed, and a little more huggable.",
    default:
      "Eat proper meals, don’t skip food when busy, and send AEVY proof that I’m taking care of myself.",
    note: "Possible side effects: fuller cheeks, better hugs, and AEVY’s approval.",
    ideas: [
      "Three real meals, no skipping",
      "A snack when I forget to eat",
      "Sleep properly and send a meal photo",
    ],
  },
};
const $ = (id) => document.getElementById(id);
let current = "headache";
const drafts = {};
function escapeText(value) {
  return value.trim();
}
function updatePreview() {
  const c = cases[current];
  $("previewPatient").textContent =
    escapeText($("patient").value) || "My favorite patient";
  $("previewCase").textContent = c.number + " / " + c.label;
  $("previewMedicine").textContent = c.medicine;
  $("previewOrders").textContent = escapeText($("orders").value) || c.default;
  $("previewNote").textContent = c.note;
  $("previewDoctor").textContent = escapeText($("doctor").value) || "AEVY";
}
function selectCase(key) {
  drafts[current] = $("orders").value;
  current = key;
  const c = cases[key];
  document
    .querySelectorAll(".condition")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.case === key)),
    );
  $("caseNumber").textContent = c.number;
  $("medicine").textContent = c.medicine;
  $("description").textContent = c.description;
  $("orders").value = drafts[key] || "";
  $("suggestions").replaceChildren();
  c.ideas.forEach((idea) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "suggestion";
    b.textContent = "+ " + idea;
    b.addEventListener("click", () => {
      $("orders").value =
        ($("orders").value.trim() ? $("orders").value.trim() + "\n" : "") +
        "• " +
        idea;
      updatePreview();
      $("orders").focus();
    });
    $("suggestions").append(b);
  });
  $("status").textContent = "";
  updatePreview();
}
document
  .querySelectorAll(".condition")
  .forEach((b) =>
    b.addEventListener("click", () => selectCase(b.dataset.case)),
  );
["patient", "orders", "doctor"].forEach((id) =>
  $(id).addEventListener("input", updatePreview),
);
$("issue").addEventListener("click", () => {
  updatePreview();
  $("status").textContent = "Signed with love. Your prescription is ready ♡";
  $("prescription").scrollIntoView({ behavior: "smooth", block: "center" });
});
$("copy").addEventListener("click", async () => {
  updatePreview();
  const c = cases[current],
    message = `AEVY’S LOVE PHARMACY ♡\nPatient: ${$("previewPatient").textContent}\nCase: ${c.label}\nTreatment: ${c.medicine}\nDoctor’s orders: ${$("previewOrders").textContent}\n${c.note}\nSigned with love, ${$("previewDoctor").textContent}`;
  try {
    await navigator.clipboard.writeText(message);
    $("status").textContent = "Prescription copied ♡";
  } catch {
    $("status").textContent =
      "Copy is unavailable here. You can print or save the prescription instead.";
  }
});
$("print").addEventListener("click", () => {
  updatePreview();
  window.print();
});
selectCase(current);
if (document.modelContext?.registerTool) {
  try {
    Promise.resolve(
      document.modelContext.registerTool({
        name: "configure_love_prescription",
        title: "Write AEVY’s prescription",
        description:
          "Choose one of the three playful cases and update the visible prescription with patient, doctor, and orders.",
        inputSchema: {
          type: "object",
          properties: {
            condition: {
              type: "string",
              enum: ["headache", "behavior", "weight"],
            },
            patient: { type: "string", maxLength: 50 },
            doctor: { type: "string", maxLength: 50 },
            orders: { type: "string", maxLength: 500 },
          },
          required: ["condition", "orders"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input) {
          if (
            !input ||
            typeof input !== "object" ||
            !Object.hasOwn(cases, input.condition) ||
            typeof input.orders !== "string" ||
            input.orders.length > 500 ||
            ("patient" in input &&
              (typeof input.patient !== "string" ||
                input.patient.length > 50)) ||
            ("doctor" in input &&
              (typeof input.doctor !== "string" || input.doctor.length > 50))
          )
            throw new Error("Invalid prescription input");
          selectCase(input.condition);
          $("orders").value = input.orders;
          if (input.patient !== undefined) $("patient").value = input.patient;
          if (input.doctor !== undefined) $("doctor").value = input.doctor;
          updatePreview();
          $("status").textContent = "Prescription updated ♡";
          return {
            condition: input.condition,
            patient: $("previewPatient").textContent,
            orders: $("previewOrders").textContent,
            doctor: $("previewDoctor").textContent,
          };
        },
      }),
    ).catch(() => {});
  } catch {}
}
