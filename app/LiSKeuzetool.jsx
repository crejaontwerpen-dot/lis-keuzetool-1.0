"use client";

import React, { useEffect, useMemo, useState } from "react";

const TRACKS = {
  A: {
    label: "NPI Engineer",
    filterSlug: "npi-engineer",
  },
  B: {
    label: "Product Engineer",
    filterSlug: "product-engineer",
  },
  C: {
    label: "CNC Operator",
    filterSlug: "cnc-operator",
  },
  D: {
    label: "Assembly Technician",
    filterSlug: "assembly-technician",
  },
  E: {
    label: "Certified Quality Engineer",
    filterSlug: "quality-engineer",
  },
};

// Keys voor localStorage
const STORAGE_KEY = "lis-keuzetool-state-v1";
const HISTORY_KEY = "lis-keuzetool-history-v1";

// Helper: maakt van labels nette URL-slugs
function slugifyModuleLabel(label) {
  return (label || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const ALL_MODULES = [
  {
    key: "designForMfg",
    label: "Design for Manufacturing",
    tracks: ["A"],
    desc: "Leer ontwerpen die productieproblemen voorkomen: maakbaarheid begint bij Design for Manufacturability.",
  },
  {
    key: "ip",
    label: "Intellectueel eigendom",
    tracks: ["A", "B"],
    desc: "Bescherm jouw ideeën: leer hoe intellectueel eigendom werkt en wat het voor technici betekent.",
  },
  {
    key: "scale",
    label: "Ontwerp voor schaalbaarheid",
    tracks: ["A", "B"],
    desc: "Leer hoe je processen veilig en efficiënt opschaalt: van risicoanalyse tot audit en readiness assessment.",
  },
  {
    key: "teamwork",
    label: "Effectief samenwerken in technische projecten",
    tracks: ["A", "B", "C", "D", "E"],
    desc: "Breng techniek en communicatie samen: leer hoe je een nieuw product succesvol introduceert met stakeholderanalyse en Scrum.",
  },
  {
    key: "costControl",
    label: "Kostenbeheersing in productie",
    tracks: ["A"],
    desc: "Ontdek hoe je echte productkosten berekent en optimaliseert met COGA en TCO.",
  },
  {
    key: "validation",
    label: "Procesvalidatie en kwaliteitsverbetering",
    tracks: ["A", "B", "C", "E"],
    desc: "Beheers proceszekerheid: van validatie tot FMEA en SPC voor betrouwbare productie.",
  },
  {
    key: "deadlines",
    label: "Werken met strakke deadlines",
    tracks: ["A", "D"],
    desc: "Word wendbaar en efficiënt: combineer Agile, Lean en risicobeheersing voor succesvolle projecten.",
  },
  {
    key: "feedback",
    label: "Feedbackgedreven ontwikkeling",
    tracks: ["A", "B", "C", "D"],
    desc: "Versnel innovatie: leer rapid prototyping met 3D-printing, simulaties en slimme teststrategieën.",
  },
  {
    key: "cmm",
    label: "CMM meten en controleren",
    tracks: ["C", "D", "E"],
    desc: "Meet en verbeter met precisie: leer werken met CMM voor betrouwbare kwaliteitscontrole.",
  },
  {
    key: "cncAuto",
    label: "CNC automation",
    tracks: ["C"],
    desc: "Automatiseer CNC-productie: leer robotbelading en nulpuntspansystemen voor maximale efficiëntie.",
  },
  {
    key: "ncProg",
    label: "NC programmeren",
    tracks: ["C"],
    desc: "Programmeer, stel in en controleer: leer CNC-techniek van tekening tot foutloze productie.",
  },
  {
    key: "materials",
    label: "Technische materiaalkeuze",
    tracks: ["B", "E"],
    desc: "Kies het juiste materiaal en ontwerp slimme oplossingen: van eigenschappen tot circulair gebruik.",
  },
  {
    key: "iso",
    label: "ISO9000 en CE",
    tracks: ["A", "B", "E"],
    desc: "Beheers kwaliteit en veiligheid: leer ISO 9001 en CE-markering toepassen in de praktijk.",
  },

  // Assembly Technician
  {
    key: "cleanWorking",
    label: "Schoon werken",
    tracks: ["D"],
    desc: "Werk schoon en zorgvuldig: leer verontreiniging voorkomen en kwaliteit tijdens het productieproces waarborgen.",
  },
  {
    key: "assemblySkills",
    label: "Assembly-vaardigheden",
    tracks: ["D"],
    desc: "Bouw nauwkeurig en efficiënt: ontwikkel praktische vaardigheden voor het assembleren en controleren van technische producten.",
  },
  {
    key: "cleanroom",
    label: "Werken in cleanroom",
    tracks: ["D"],
    desc: "Werk gecontroleerd en zorgvuldig: leer de procedures en werkwijzen voor veilig en schoon werken in een cleanroomomgeving.",
  },

  // Certified Quality Engineer
  {
    key: "measurementTools",
    label: "Meetmiddelen",
    tracks: ["E"],
    desc: "Meet met vertrouwen: leer de juiste meetmiddelen kiezen, gebruiken en resultaten correct beoordelen.",
  },
  {
    key: "technicalDrawingGDT",
    label: "Technisch tekeninglezen en GD&T",
    tracks: ["E"],
    desc: "Lees technische tekeningen als een professional: leer maatvoering, toleranties en GD&T correct interpreteren en toepassen.",
  },
];

// Speciale LiS-pagina voor de keuzetool
const LIS_BASE =
  "https://www.lis.nl/lis-voor-werkenden-maatwerkprogramma-s-hightechsector/programma-aanbod/";

const LIS_PERSONAL_BASE = LIS_BASE + "persoonlijk-advies-def/";

function makeLisFilterUrl(interests, noModules) {
  const picked = Array.isArray(interests) ? interests : [];

  // Beroepsprofielen gebruiken expliciete LiS-filter-slugs
  const programmeSlugs = picked
    .map((code) => TRACKS[code])
    .filter(Boolean)
    .map((track) => track.filterSlug);

  // De officiële modulenamen leveren de juiste LiS-slugs op
  const moduleSlugs = (noModules || []).map((module) =>
    slugifyModuleLabel(
      typeof module === "string" ? module : module.label
    )
  );

  if (programmeSlugs.length === 0 && moduleSlugs.length === 0) {
    return LIS_BASE;
  }

  const parts = [];

  if (programmeSlugs.length) {
    parts.push("programma-s:" + programmeSlugs.join(","));
  }

  if (moduleSlugs.length) {
    parts.push("losse-modules:" + moduleSlugs.join(","));
  }

  return `${LIS_PERSONAL_BASE}?filter=${parts.join(";")}`;
}

function formatBulleted(labels) {
  return labels.filter(Boolean).join("\n  - ");
}

function decodeAdviceFromUrl(str) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(str))));
  } catch {
    return null;
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default function LiSKeuzetool() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [background, setBackground] = useState("");
  const [role, setRole] = useState("");
  const [interests, setInterests] = useState([]);
  const [competences, setCompetences] = useState({});
  const [wantsContact, setWantsContact] = useState(null);
  const [phone, setPhone] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [adviceHistory, setAdviceHistory] = useState([]);
  const [isComposing, setIsComposing] = useState(false);
  const [dots, setDots] = useState(0);

  const today = useMemo(() => {
    const d = new Date();

    return d.toLocaleDateString("nl-NL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (raw) {
        const saved = JSON.parse(raw);

        if (saved.name) setName(saved.name);
        if (saved.email) setEmail(saved.email);
        if (saved.background) setBackground(saved.background);
        if (saved.role) setRole(saved.role);

        if (Array.isArray(saved.interests)) {
          setInterests(saved.interests);
        }
      }

      const hist = localStorage.getItem(HISTORY_KEY);

      if (hist) {
        setAdviceHistory(JSON.parse(hist));
      }
    } catch {}

    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("advice");

    if (encoded) {
      const data = decodeAdviceFromUrl(encoded);

      if (data) {
        setName(data.name || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setBackground(data.background || "");
        setRole(data.role || "");

        if (Array.isArray(data.interests)) {
          setInterests(data.interests);
        }

        if (Array.isArray(data.modules)) {
          const map = {};

          data.modules.forEach((module) => {
            if (module && module.key) {
              map[module.key] = module.answer;
            }
          });

          setCompetences(map);
        }

        setWantsContact(
          typeof data.wantsContact === "boolean"
            ? data.wantsContact
            : null
        );

        setStep(4);
      }
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          name,
          email,
          background,
          role,
          interests,
        })
      );
    } catch {}
  }, [name, email, background, role, interests]);

  useEffect(() => {
    if (!isComposing) return;

    const id = setInterval(() => {
      setDots((d) => (d + 1) % 4);
    }, 500);

    return () => clearInterval(id);
  }, [isComposing]);

  const composingText = useMemo(() => {
    if (!isComposing) return "";

    const count = dots === 0 ? 1 : dots;
    const base = "Even geduld, je advies wordt samengesteld";

    return base + ".".repeat(count);
  }, [isComposing, dots]);

  const filteredModules = useMemo(() => {
    const picked = Array.isArray(interests) ? interests : [];

    if (picked.length === 0) {
      return [];
    }

    return ALL_MODULES.filter(
      (module) =>
        Array.isArray(module.tracks) &&
        module.tracks.some((track) => picked.includes(track))
    );
  }, [interests]);

  const handledModulesYes = useMemo(
    () =>
      filteredModules.filter(
        (module) => competences[module.key] === true
      ),
    [filteredModules, competences]
  );

  const handledModulesNo = useMemo(
    () =>
      filteredModules.filter(
        (module) => competences[module.key] === false
      ),
    [filteredModules, competences]
  );

  const canGoStep1 = useMemo(
    () => name.trim() && /.+@.+\..+/.test(email),
    [name, email]
  );

  const canGoStep2 = useMemo(
    () => filteredModules.length > 0,
    [filteredModules]
  );

  const canShowAdvice = useMemo(() => {
    if (wantsContact === false) {
      return true;
    }

    if (wantsContact === true) {
      return phone.trim().length > 0;
    }

    return false;
  }, [wantsContact, phone]);

  function toggleInterest(code) {
    setInterests((prev) => {
      const list = Array.isArray(prev) ? prev : [];

      if (list.includes(code)) {
        return list.filter((item) => item !== code);
      }

      if (list.length >= 2) {
        return list;
      }

      return [...list, code];
    });
  }

  function setCompetenceFor(moduleKey, value) {
    setCompetences((prev) => ({
      ...prev,
      [moduleKey]: value,
    }));
  }

  function toStep(number) {
    setStep(number);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const dynamicLisUrl = useMemo(
    () => makeLisFilterUrl(interests, handledModulesNo),
    [interests, handledModulesNo]
  );

  function buildAdviceText() {
    const yes = formatBulleted(
      handledModulesYes.map((module) => module.label)
    );

    const no = formatBulleted(
      handledModulesNo.map((module) => module.label)
    );

    return `Persoonlijk Advies

1. Persoonlijke gegevens
• Naam: ${name}
• E-mail: ${email}
${
  wantsContact === true && phone.trim()
    ? `• Telefoonnummer: ${phone.trim()}\n`
    : ""
}• Datum advies: ${today}
${
  background.trim()
    ? `• Achtergrond: ${background.trim()}\n`
    : ""
}• Wat is je huidige functie: ${role}

2. Overzicht carrière kansen
• Ik beheers:
  - ${yes || "(geen ingevulde JA-antwoorden)"}
• Ik wil leren:
  - ${no || "(geen ingevulde NEE-antwoorden)"}

3. Persoonlijk contact
• Persoonlijk contact gewenst: ${
      wantsContact === true ? "Ja, graag" : "Nee, niet nodig"
    }

4. Link
• ${dynamicLisUrl}`;
  }

  function buildAdviceObject() {
    return {
      name,
      email,
      phone:
        wantsContact === true && phone.trim()
          ? phone.trim()
          : null,
      background: background.trim() || null,
      role,
      interests,

      modules: filteredModules.map((module) => ({
        key: module.key,
        label: module.label,
        answer: competences[module.key],
      })),

      wantsContact,
      adviceDate: today,
      advicePlain: buildAdviceText(),
    };
  }

  function buildAdviceHtml() {
    const clean = escapeHtml;

    const url = makeLisFilterUrl(
      interests,
      handledModulesNo
    );

    const blocks =
      Array.isArray(interests) && interests.length > 0
        ? interests
            .map((code) => {
              const track = TRACKS[code];

              if (!track) return "";

              const yesForTrack = handledModulesYes.filter(
                (module) =>
                  Array.isArray(module.tracks) &&
                  module.tracks.includes(code)
              );

              const noForTrack = handledModulesNo.filter(
                (module) =>
                  Array.isArray(module.tracks) &&
                  module.tracks.includes(code)
              );

              const yesHtml =
                yesForTrack.length > 0
                  ? yesForTrack
                      .map(
                        (module) =>
                          `<li>${clean(module.label)}</li>`
                      )
                      .join("")
                  : '<li style="color:#666">(geen ingevulde JA-antwoorden binnen deze functie)</li>';

              const noHtml =
                noForTrack.length > 0
                  ? noForTrack
                      .map(
                        (module) =>
                          `<li>${clean(module.label)}</li>`
                      )
                      .join("")
                  : '<li style="color:#666">(geen ingevulde NEE-antwoorden binnen deze functie)</li>';

              return `
        <div style="margin-top:16px; padding:12px; border:1px solid #e5e7eb; border-radius:12px; background:#ffffff;">
          <p style="margin:0 0 4px 0; font-size:13px; color:#4b5563;">
            Binnen de functie:
          </p>

          <p style="margin:0 0 8px 0; font-weight:600; color:#111827;">
            ${clean(track.label)}
          </p>

          <div style="display:flex; gap:24px; flex-wrap:wrap;">
            <div style="min-width:180px;">
              <p style="margin:0 0 4px 0; font-weight:500;">
                Ik beheers
              </p>

              <ul style="margin:0 0 8px 20px; padding:0;">
                ${yesHtml}
              </ul>
            </div>

            <div style="min-width:180px;">
              <p style="margin:0 0 4px 0; font-weight:500;">
                Ik wil leren
              </p>

              <ul style="margin:0 0 8px 20px; padding:0;">
                ${noHtml}
              </ul>
            </div>
          </div>
        </div>`;
            })
            .join("")
        : '<p style="margin:4px 0; color:#666;">Er zijn geen functies geselecteerd in stap 1.</p>';

    const phoneHtml =
      wantsContact === true && phone.trim()
        ? `
        <p style="margin:4px 0;">
          Telefoonnummer:
          <strong>${clean(phone.trim())}</strong>
        </p>`
        : "";

    return `
      <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color:#111;">

        <h2 style="margin:0 0 12px 0; font-size:20px;">
          Persoonlijk Advies
        </h2>

        <h3 style="margin:16px 0 8px 0; font-size:16px;">
          1. Persoonlijke gegevens
        </h3>

        <p style="margin:4px 0;">
          Naam:
          <strong>${clean(name)}</strong>
        </p>

        <p style="margin:4px 0;">
          E-mail:
          <strong>${clean(email)}</strong>
        </p>

        ${phoneHtml}

        <p style="margin:4px 0;">
          Datum advies:
          <strong>${clean(today)}</strong>
        </p>

        ${
          background.trim()
            ? `<p style="margin:4px 0;">
                Achtergrond: ${clean(background)}
              </p>`
            : ""
        }

        <p style="margin:4px 0;">
          Wat is je huidige functie:
          <strong>${clean(role)}</strong>
        </p>

        <h3 style="margin:16px 0 8px 0; font-size:16px;">
          2. Overzicht carrière kansen
        </h3>

        ${blocks}

        <p style="margin:16px 0;">
          Bekijk mijn advies online:
          <a
            href="${url}"
            target="_blank"
            rel="noreferrer"
          >
            Bekijk mijn advies online
          </a>
        </p>

        <hr style="margin:24px 0; border:none; border-top:1px solid #eee;"/>

        <p style="margin:0 0 4px 0; font-weight:600;">
          Leidse instrumentmakers School
        </p>

        <p style="margin:0;">
          Einsteinweg 61<br/>
          2333 CC Leiden<br/>
          Nederland
        </p>

        <p style="margin:8px 0 0 0;">
          071-5681168<br/>
          info@lis.nl<br/>
          <a
            href="https://www.lis.nl"
            target="_blank"
            rel="noreferrer"
          >
            www.lis.nl
          </a>
        </p>

      </div>`;
  }

  function buildAdviceHtmlForRob() {
    const html = buildAdviceHtml();

    const contact =
      wantsContact === true
        ? "Ja, graag"
        : wantsContact === false
        ? "Nee, niet nodig"
        : "Onbekend";

    const contactHtml = `
      <div style="margin-top:20px; padding:12px; border:1px solid #e5e7eb; border-radius:12px;">
        <p style="margin:0; font-size:14px;">
          Persoonlijk contact gewenst:
          <strong>${contact}</strong>
        </p>
        ${
          wantsContact === true && phone.trim()
            ? `<p style="margin:6px 0 0 0; font-size:14px;">
                Telefoonnummer:
                <strong>${escapeHtml(phone.trim())}</strong>
              </p>`
            : ""
        }
      </div>
    `;

    return html.replace(
      /<\/div>\s*$/,
      `${contactHtml}</div>`
    );
  }

  async function sendToRob() {
    setIsComposing(true);
    setStatusMsg("");

    const adviceObj = buildAdviceObject();

    try {
      const res = await fetch("/api/send-lis-advice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...adviceObj,
          adviceHtml: buildAdviceHtmlForRob(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatusMsg(
          `Verzenden mislukt: ${
            data?.error || res.statusText
          } (${data?.code || res.status})`
        );

        return true;
      }

      setStatusMsg("Uw advies is opgeslagen");

      return true;
    } catch (e) {
      setStatusMsg(
        `Verzenden mislukt (network): ${e.message}`
      );

      return true;
    } finally {
      setIsComposing(false);
      setDots(0);
    }
  }

  async function emailVisitor() {
    const adviceObj = buildAdviceObject();
    const html = buildAdviceHtml();

    setStatusMsg("Advies mailen naar bezoeker…");

    try {
      const res = await fetch(
        "/api/send-lis-advice-user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: email,
            subject: `Uw persoonlijk LiS-advies – ${
              adviceObj.name || "Bezoeker"
            }`,
            html,
            text: adviceObj.advicePlain,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatusMsg(
          `Mailen naar bezoeker mislukt: ${
            data?.error || res.statusText
          }`
        );

        return;
      }

      setStatusMsg(
        "Advies gemaild naar jouw e-mailadres."
      );
    } catch (e) {
      setStatusMsg(
        `Mailen naar bezoeker mislukt (network): ${e.message}`
      );
    }
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#3489c2" }}
    >
      <header className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-3xl font-bold text-black">
          Keuzetool LiS voor Werkenden
        </h1>

        <p className="mt-2 text-white">
          Beantwoord enkele vragen en ontvang een persoonlijk
          advies met modules van de Leidse instrumentmakers
          School.
        </p>

        <div className="mt-4 h-2 bg-white/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{
              width: `${(step / 4) * 100}%`,
            }}
          />
        </div>

        {!!statusMsg && (
          <p
            className="text-sm mt-2 text-white"
            role="status"
          >
            {statusMsg}
          </p>
        )}

        {isComposing && (
          <p className="text-sm mt-1 text-white">
            {composingText}
          </p>
        )}
      </header>

      <main className="mx-auto max-w-4xl bg-white rounded-2xl shadow-lg p-8">

        {/* STAP 1 */}

        {step === 1 && (
          <section>
            <h2 className="text-xl font-semibold text-black mb-2">
              1. Persoonlijke gegevens
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-black">
                  Naam{" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Voornaam Achternaam"
                  className="mt-1 border rounded-lg p-2"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-black">
                  Email{" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="naam@voorbeeld.nl"
                  className="mt-1 border rounded-lg p-2"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-black">
                  Datum advies
                </label>

                <input
                  type="text"
                  value={today}
                  readOnly
                  className="mt-1 border rounded-lg p-2 bg-gray-50"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-black">
                  Wat is je huidige functie?
                </label>

                <input
                  type="text"
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value)
                  }
                  placeholder="Bijv. Productie-operator"
                  className="mt-1 border rounded-lg p-2"
                />
              </div>

              <div className="md:col-span-2 flex flex-col">
                <label className="text-sm font-medium text-black">
                  Achtergrond
                  <span className="text-gray-500 font-normal">
                    {" "}
                    (optioneel, max. 250 woorden)
                  </span>
                </label>

                <textarea
                  value={background}
                  onChange={(e) =>
                    setBackground(e.target.value)
                  }
                  placeholder="Vertel iets over je achtergrond, sector/branche, ervaring, etc."
                  className="mt-1 border rounded-lg p-2 min-h-[120px]"
                  maxLength={2000}
                />
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-medium text-black mb-2">
                Geïnteresseerd in (kies maximaal 2):
              </p>

              <div className="flex flex-wrap gap-2">
                {Object.entries(TRACKS).map(
                  ([code, { label }]) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() =>
                        toggleInterest(code)
                      }
                      className={`px-3 py-2 rounded-2xl border text-sm transition-colors duration-300 ${
                        Array.isArray(interests) &&
                        interests.includes(code)
                          ? "bg-[#3489c2] text-white border-[#3489c2] hover:bg-black"
                          : "bg-white border-gray-300 hover:bg-black hover:text-white"
                      }`}
                      disabled={
                        !Array.isArray(interests)
                          ? false
                          : !interests.includes(code) &&
                            interests.length >= 2
                      }
                    >
                      {label}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <button
                className={`px-5 py-2 rounded-xl text-white shadow transition-colors duration-300 ${
                  canGoStep1
                    ? "bg-[#3489c2] hover:bg-black"
                    : "bg-[#3489c2]/50 cursor-not-allowed"
                }`}
                disabled={!canGoStep1}
                onClick={() => toStep(2)}
              >
                Start keuzetool
              </button>
            </div>
          </section>
        )}

        {/* STAP 2 */}

        {step === 2 && (
          <section>
            <h2 className="text-xl font-semibold text-black mb-2">
              2. Startpunt keuzetool
            </h2>

            <p className="text-gray-600 mb-4">
              Geef per onderwerp aan of je er ervaring mee
              hebt.
            </p>

            {filteredModules.length === 0 && (
              <p className="text-gray-600">
                Geen modules om te tonen. Ga terug en kies
                één of twee interesses.
              </p>
            )}

            <ul className="space-y-3">
              {filteredModules.map((module) => (
                <li
                  key={module.key}
                  className="flex items-center justify-between gap-4 border rounded-xl p-3"
                >
                  <div>
                    <p className="font-medium text-black">
                      {module.label}
                    </p>

                    <p className="text-xs text-gray-500">
                      {module.desc}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setCompetenceFor(
                          module.key,
                          true
                        )
                      }
                      className={`px-3 py-2 rounded-lg border transition-colors duration-300 ${
                        competences[module.key] === true
                          ? "bg-[#3489c2] border-[#3489c2] text-white hover:bg-black"
                          : "bg-white border-gray-300 hover:bg-black hover:text-white"
                      }`}
                      aria-pressed={
                        competences[module.key] === true
                      }
                    >
                      Ja
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setCompetenceFor(
                          module.key,
                          false
                        )
                      }
                      className={`px-3 py-2 rounded-lg border transition-colors duration-300 ${
                        competences[module.key] === false
                          ? "bg-[#3489c2] border-[#3489c2] text-white hover:bg-black"
                          : "bg-white border-gray-300 hover:bg-black hover:text-white"
                      }`}
                      aria-pressed={
                        competences[module.key] === false
                      }
                    >
                      Nee
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex items-center gap-3">
              <button
                className="px-4 py-2 rounded-xl border transition-colors duration-300 hover:bg-black hover:text-white"
                onClick={() => toStep(1)}
              >
                Terug
              </button>

              <button
                className={`px-5 py-2 rounded-xl text-white shadow transition-colors duration-300 ${
                  canGoStep2
                    ? "bg-[#3489c2] hover:bg-black"
                    : "bg-[#3489c2]/50 cursor-not-allowed"
                }`}
                disabled={!canGoStep2}
                onClick={() => toStep(3)}
              >
                Verder
              </button>
            </div>
          </section>
        )}

        {/* STAP 3 */}

        {step === 3 && (
          <section>
            <h2 className="text-xl font-semibold text-black mb-2">
              3. Aanvullende vragen
            </h2>

            <p className="mb-4 text-black">
              Bedankt voor het invullen! Wil je persoonlijk
              en vrijblijvend contact/advies van de LiS?
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                className={`px-3 py-2 rounded-xl border transition-colors duration-300 ${
                  wantsContact === true
                    ? "bg-[#3489c2] border-[#3489c2] text-white hover:bg-black"
                    : "bg-white border-gray-300 hover:bg-black hover:text-white"
                }`}
                onClick={() =>
                  setWantsContact(true)
                }
              >
                Ja, graag
              </button>

              <button
                type="button"
                className={`px-3 py-2 rounded-xl border transition-colors duration-300 ${
                  wantsContact === false
                    ? "bg-[#3489c2] border-[#3489c2] text-white hover:bg-black"
                    : "bg-white border-gray-300 hover:bg-black hover:text-white"
                }`}
                onClick={() => {
                  setWantsContact(false);
                  setPhone("");
                }}
              >
                Nee, niet nodig
              </button>
            </div>

            {wantsContact === true && (
              <div className="mt-5 max-w-md">
                <label className="text-sm font-medium text-black">
                  Telefoonnummer{" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  placeholder="Bijv. 06 12345678"
                  className="mt-1 w-full border rounded-lg p-2"
                  required
                />

                <p className="mt-1 text-xs text-gray-500">
                  Vul je telefoonnummer in zodat de LiS
                  contact met je kan opnemen.
                </p>
              </div>
            )}

            <div className="mt-8 flex items-center gap-3">
              <button
                className="px-4 py-2 rounded-xl border transition-colors duration-300 hover:bg-black hover:text-white"
                onClick={() => toStep(2)}
              >
                Terug
              </button>

              <button
                className={`px-5 py-2 rounded-xl text-white shadow transition-colors duration-300 ${
                  canShowAdvice
                    ? "bg-[#3489c2] hover:bg-black"
                    : "bg-[#3489c2]/50 cursor-not-allowed"
                }`}
                disabled={!canShowAdvice}
                onClick={async () => {
                  const ok = await sendToRob();

                  if (ok) {
                    toStep(4);
                  }
                }}
              >
                Toon mij advies
              </button>
            </div>
          </section>
        )}

        {/* STAP 4 */}

        {step === 4 && (
          <section>
            <h2 className="text-xl font-semibold text-black mb-2">
              4. Persoonlijk Advies
            </h2>

            <div className="border rounded-2xl p-5 bg-gray-50">
              <h3 className="text-lg font-semibold text-black mb-3">
                1. Persoonlijke gegevens
              </h3>

              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-600">
                    Naam
                  </dt>

                  <dd className="font-medium text-black">
                    {name}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-gray-600">
                    Datum advies
                  </dt>

                  <dd className="font-medium text-black">
                    {today}
                  </dd>
                </div>

                {wantsContact === true && phone.trim() && (
                  <div>
                    <dt className="text-sm text-gray-600">
                      Telefoonnummer
                    </dt>

                    <dd className="font-medium text-black">
                      {phone}
                    </dd>
                  </div>
                )}

                {background.trim() && (
                  <div className="md:col-span-2">
                    <dt className="text-sm text-gray-600">
                      Achtergrond
                    </dt>

                    <dd className="font-medium whitespace-pre-wrap text-black">
                      {background}
                    </dd>
                  </div>
                )}

                <div className="md:col-span-2">
                  <dt className="text-sm text-gray-600">
                    Wat is je huidige functie
                  </dt>

                  <dd className="font-medium text-black">
                    {role}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="border rounded-2xl p-5 bg-gray-50 mt-6">
              <h3 className="text-lg font-semibold text-black mb-3">
                2. Overzicht carrière kansen
              </h3>

              {Array.isArray(interests) &&
              interests.length > 0 ? (
                interests.map((code) => {
                  const track = TRACKS[code];

                  if (!track) return null;

                  const yesForTrack =
                    handledModulesYes.filter(
                      (module) =>
                        Array.isArray(module.tracks) &&
                        module.tracks.includes(code)
                    );

                  const noForTrack =
                    handledModulesNo.filter(
                      (module) =>
                        Array.isArray(module.tracks) &&
                        module.tracks.includes(code)
                    );

                  return (
                    <div
                      key={code}
                      className="mt-4 border rounded-xl bg-white p-4 last:mb-0"
                    >
                      <p className="text-sm text-gray-600">
                        Binnen de functie:
                      </p>

                      <p className="font-semibold text-black mb-3">
                        {track.label}
                      </p>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <p className="font-medium text-black mb-2">
                            Ik beheers
                          </p>

                          <ul className="list-disc pl-5 space-y-1">
                            {yesForTrack.length > 0 ? (
                              yesForTrack.map(
                                (module) => (
                                  <li
                                    key={module.key}
                                    className="text-black"
                                  >
                                    {module.label}
                                  </li>
                                )
                              )
                            ) : (
                              <li className="text-gray-500">
                                (geen ingevulde JA-antwoorden
                                binnen deze functie)
                              </li>
                            )}
                          </ul>
                        </div>

                        <div>
                          <p className="font-medium text-black mb-2">
                            Ik wil leren
                          </p>

                          <ul className="list-disc pl-5 space-y-1">
                            {noForTrack.length > 0 ? (
                              noForTrack.map(
                                (module) => (
                                  <li
                                    key={module.key}
                                    className="text-black"
                                  >
                                    {module.label}
                                  </li>
                                )
                              )
                            ) : (
                              <li className="text-gray-500">
                                (geen ingevulde NEE-antwoorden
                                binnen deze functie)
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-600">
                  Er zijn geen functies geselecteerd in
                  stap 1.
                </p>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={dynamicLisUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 rounded-xl border bg-[#3489c2] text-white transition-colors duration-300 hover:bg-black hover:text-white"
              >
                Bezoek de website en bekijk het voor u
                geselecteerd aanbod
              </a>

              <button
                className="px-5 py-2 rounded-xl border transition-colors duration-300 hover:bg-black hover:text-white"
                onClick={() => {
                  try {
                    const next = [
                      ...adviceHistory,
                      buildAdviceObject(),
                    ];

                    setAdviceHistory(next);

                    localStorage.setItem(
                      HISTORY_KEY,
                      JSON.stringify(next)
                    );
                  } catch {}

                  toStep(1);
                }}
              >
                Nieuw advies starten
              </button>

              <button
                className="px-5 py-2 rounded-xl border transition-colors duration-300 hover:bg-black hover:text-white"
                onClick={emailVisitor}
              >
                Mail mijn persoonlijk advies
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}