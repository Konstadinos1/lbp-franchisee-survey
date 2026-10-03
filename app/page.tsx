"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  STEPS,
  SECTIONS,
  SCALES,
  SCALE_CHIPS,
  YESNO,
  UI,
  NPS_SIDE,
  THANKS_BODY,
  type Lang,
} from "../lib/content";
import {
  computeSectionScores,
  globalScore,
  buildTips,
  npsVerdict,
  type Answers,
  type Tip,
} from "../lib/scoring";

type Phase = "intro" | "quiz" | "done";

const SCORE_META: Record<number, { cls: string; fr: string; en: string }> = {
  0: { cls: "red", fr: "Action requise", en: "Action needed" },
  1: { cls: "amber", fr: "À consolider", en: "Needs work" },
  2: { cls: "", fr: "Solide", en: "Solid" },
  3: { cls: "", fr: "Excellent", en: "Excellent" },
};

export default function Home() {
  const [lang, setLang] = useState<Lang>("fr");
  const [phase, setPhase] = useState<Phase>("intro");
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [err, setErr] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);

  // restore draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem("lbp-survey-draft");
      if (raw) {
        const d = JSON.parse(raw);
        if (d && typeof d === "object") {
          setAnswers(d.answers || {});
          if (typeof d.stepIdx === "number") setStepIdx(d.stepIdx);
          if (d.phase && ["intro", "quiz", "done"].includes(d.phase)) setPhase(d.phase);
          if (d.lang === "fr" || d.lang === "en") setLang(d.lang);
        }
      }
    } catch {}
    // URL params override (deep-linking / sharing a step)
    try {
      const params = new URLSearchParams(window.location.search);
      const lg = params.get("lang");
      if (lg === "en" || lg === "fr") setLang(lg);
      const p = params.get("phase");
      if (p === "quiz" || p === "done") {
        setPhase(p);
        const st = parseInt(params.get("step") || "", 10);
        if (!isNaN(st) && st >= 0 && st < STEPS.length) setStepIdx(st);
      }
      // demo mode: pre-fill a realistic profile and jump to the report
      const demo = params.get("demo");
      if (demo) {
        const profile =
          demo === "2"
            ? { restaurant: "Laval — boul. Curé-Labelle", annees: 3, role: ["quotidien"], employes: 22, ops_equipement: 2, ops_normes: 3, ops_livraison: 2, ops_maindoeuvre: 1, ops_penurie: 3, ops_breakdown: "yes", ops_heures: 70, ops_comment: "Friteuse en panne 2 fois cette année.", prod_qualite: 4, prod_marges: 2, prod_nouveautes: 3, prod_distribution: 2, prod_veg: 2, prod_souhait: "Poutine déjeuner", mkt_fonds: 2, mkt_local: 2, mkt_promos: 3, mkt_numerique: 3, mkt_comite: "yes", mkt_idee: "2 pour 1 poutine le mardi", supp_ecoute: 2, supp_formation: 2, supp_visites: 3, supp_redevances: 2, supp_nps: 5, fin_rentabilite: 2, fin_couts: 2, fin_outils: 3, fin_objectifs: "no", fin_croissance: 3, fin_priorites: ["couts", "maindoeuvre"] }
            : { restaurant: "Rive-Nord — autoroute 15", annees: 12, role: ["hebdo"], employes: 18, ops_equipement: 4, ops_normes: 4, ops_livraison: 3, ops_maindoeuvre: 3, ops_penurie: 3, ops_breakdown: "no", ops_heures: 50, prod_qualite: 4, prod_marges: 3, prod_nouveautes: 4, prod_distribution: 3, prod_veg: 3, prod_souhait: "", mkt_fonds: 3, mkt_local: 4, mkt_promos: 3, mkt_numerique: 4, mkt_comite: "no", mkt_idee: "", supp_ecoute: 4, supp_formation: 3, supp_visites: 4, supp_redevances: 3, supp_nps: 9, fin_rentabilite: 4, fin_couts: 3, fin_outils: 4, fin_objectifs: "yes", fin_croissance: 8, fin_priorites: ["renov", "digital"] };
        setAnswers(profile);
        setPhase("done");
      }
    } catch {}
  }, []);

  // persist draft
  useEffect(() => {
    try {
      localStorage.setItem("lbp-survey-draft", JSON.stringify({ answers, stepIdx, phase, lang }));
    } catch {}
  }, [answers, stepIdx, phase, lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const T = (k: string) => UI[k][lang];
  const step = STEPS[stepIdx];

  const setAns = (id: string, v: unknown) => {
    setAnswers((a) => ({ ...a, [id]: v }));
    setErr(null);
  };

  const requiredUnanswered = (idx: number): string[] => {
    const out: string[] = [];
    STEPS[idx].questions.forEach((q) => {
      if (q.optional) return;
      const v = answers[q.id];
      if (q.kind === "multi") {
        if (!Array.isArray(v) || v.length === 0) out.push(q.label[lang]);
      } else if (v === undefined || v === "" || v === null) {
        out.push(q.label[lang]);
      }
    });
    return out;
  };

  const goNext = () => {
    const missing = requiredUnanswered(stepIdx);
    if (missing.length) {
      setErr(`${T("requiredMsg")} ${T("requiredList")} ${missing.slice(0, 3).join(" · ")}`);
      return;
    }
    setErr(null);
    if (stepIdx < STEPS.length - 1) {
      setStepIdx(stepIdx + 1);
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      setPhase("done");
    }
  };

  const goBack = () => {
    setErr(null);
    if (stepIdx > 0) {
      setStepIdx(stepIdx - 1);
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      setPhase("intro");
    }
  };

  const restart = () => {
    setAnswers({});
    setStepIdx(0);
    setPhase("intro");
    setErr(null);
    try {
      localStorage.removeItem("lbp-survey-draft");
    } catch {}
  };

  const sections = useMemo(() => computeSectionScores(answers), [answers]);
  const overall = useMemo(() => globalScore(sections), [sections]);
  const tips = useMemo(() => buildTips(answers), [answers]);
  const npsVal = typeof answers["supp_nps"] === "number" ? (answers["supp_nps"] as number) : null;

  const downloadJSON = () => {
    const payload = {
      meta: {
        survey: "Bellepro's / Groupe LBP — Sondage franchisés (prototype)",
        date: new Date().toISOString(),
        lang,
      },
      restaurant: answers["restaurant"] ?? null,
      overallScore: overall,
      sections,
      nps: npsVal,
      npsVerdict: npsVerdict(npsVal)?.[lang] ?? null,
      answers,
      actionPlan: tips.map((tp) => ({ priority: tp.prio, title: tp.title[lang], detail: tp.body[lang] })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sondage-bellepros-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copySummary = async () => {
    const lines: string[] = [];
    lines.push(`Sondage franchisé Bellepro's — ${new Date().toLocaleDateString(lang === "fr" ? "fr-CA" : "en-CA")}`);
    if (answers["restaurant"]) lines.push(`Restaurant: ${answers["restaurant"]}`);
    lines.push(`Score global: ${overall}%`);
    lines.push("");
    sections.forEach((sec) => {
      if (sec.pct > 0) lines.push(`- ${sec.title[lang]}: ${sec.pct}%`);
    });
    if (tips.length) {
      lines.push("");
      lines.push("Plan d'action:");
      tips.forEach((tp) => lines.push(`  [P${tp.prio}] ${tp.title[lang]}`));
    }
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      alert(lang === "fr" ? "Résumé copié !" : "Summary copied!");
    } catch {}
  };

  // live meter: sections scored so far
  const answeredSections = sections.filter((x) => x.pct > 0);
  const livePct = answeredSections.length
    ? Math.round(answeredSections.reduce((a, b) => a + b.pct, 0) / answeredSections.length)
    : 0;
  const answeredCount = STEPS.reduce(
    (n, st) => n + st.questions.filter((q) => answers[q.id] !== undefined && answers[q.id] !== "").length,
    0
  );
  const totalCount = STEPS.reduce((n, st) => n + st.questions.length, 0);
  const verdict = SCORE_META[Math.min(3, Math.floor(livePct / 34))];

  return (
    <>
      <header className="topbar">
        <div className="checker"></div>
        <div className="shell topbar-inner">
          <div className="brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/logo-bellepros.png" alt="Bellepro's" />
            <div className="brand-text">
              <div className="kicker">{T("kicker")}</div>
              <div className="name">{lang === "fr" ? "Sondage franchisés" : "Franchisee survey"}</div>
            </div>
          </div>
          <div className="lang" role="group" aria-label="Language">
            <button
              className={lang === "fr" ? "active" : ""}
              onClick={() => setLang("fr")}
              aria-pressed={lang === "fr"}
            >
              FR
            </button>
            <button
              className={lang === "en" ? "active" : ""}
              onClick={() => setLang("en")}
              aria-pressed={lang === "en"}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      <main className="shell" ref={topRef}>
        {phase === "intro" && (
          <section className="hero anim-in">
            <div className="hero-ticket">
              <div className="hero-inner">
                <span className="step-tag" style={{ background: "var(--red)" }}>
                  {lang === "fr" ? "Boucle de rétroaction" : "Feedback loop"}
                </span>
                <h1>
                  {T("titleA")} <span className="accent">{T("titleB")}</span>
                </h1>
                <p className="lead">{T("lead")}</p>
                <p className="sub">{T("sub")}</p>
                <div className="badges">
                  <span className="badge">
                    <span className="dot"></span>
                    {T("badgeTime")}
                  </span>
                  <span className="badge blue">
                    <span className="dot"></span>
                    {T("badgeConf")}
                  </span>
                  <span className="badge red">
                    <span className="dot"></span>
                    {T("badgeLoop")}
                  </span>
                </div>
                <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button className="btn btn-primary" onClick={() => setPhase("quiz")}>
                    {T("start")} →
                  </button>
                  <a className="btn btn-cream" href="https://www.bellepros.com/franchises" target="_blank" rel="noreferrer">
                    {lang === "fr" ? "Franchises Bellepro's" : "Bellepro's franchising"}
                  </a>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/logo-bellepros.png"
                  alt=""
                  aria-hidden="true"
                  className="hero-sticker"
                />
              </div>
            </div>
          </section>
        )}

        {phase === "quiz" && (
          <section className="anim-in" key={step.id}>
            <div className="rail" aria-label="Progress">
              {STEPS.map((st, i) => (
                <span key={st.id} style={{ display: "contents" }}>
                  <span
                    className={
                      "stop" + (i === stepIdx ? " current" : i < stepIdx ? " done" : "")
                    }
                  >
                    <span className="n">{i < stepIdx ? "✓" : i + 1}</span>
                    <span className="stop-label">{st.tag[lang]}</span>
                  </span>
                  {i < STEPS.length - 1 && <span className="dash"></span>}
                </span>
              ))}
            </div>

            <div className="layout-grid">
              <div>
                <div className="panel">
                  <span className="step-tag">{step.tag[lang]}</span>
                  <h2>{step.title[lang]}</h2>
                  <p className="help">{step.help[lang]}</p>

                  {step.questions.map((q) => {
                    const val = answers[q.id];
                    return (
                      <div className="q" key={q.id}>
                        <label className="label">
                          {q.label[lang]}
                          {q.optional && <span className="optional">{lang === "fr" ? "facultatif" : "optional"}</span>}
                        </label>

                        {q.kind === "scale" && (
                          <div className="scale" role="radiogroup" aria-label={q.label[lang]}>
                            {SCALE_CHIPS.map((cid) => (
                              <button
                                key={cid}
                                role="radio"
                                aria-checked={val === SCALES[cid].score}
                                className={"chip" + (val === SCALES[cid].score ? " on" : "")}
                                onClick={() => setAns(q.id, SCALES[cid].score)}
                              >
                                {SCALES[cid].label[lang]}
                              </button>
                            ))}
                          </div>
                        )}

                        {q.kind === "nps" && (
                          <>
                            <div className="nps" role="radiogroup" aria-label={q.label[lang]}>
                              {Array.from({ length: 11 }, (_, i) => i).map((i) => (
                                <button
                                  key={i}
                                  role="radio"
                                  aria-checked={val === i}
                                  className={"chip" + (val === i ? " on" : "")}
                                  onClick={() => setAns(q.id, i)}
                                >
                                  {i}
                                </button>
                              ))}
                            </div>
                            <div className="nps-labels">
                              <span>{NPS_SIDE[lang].low}</span>
                              <span>{NPS_SIDE[lang].high}</span>
                            </div>
                          </>
                        )}

                        {q.kind === "yn" && (
                          <div className="yn" role="radiogroup" aria-label={q.label[lang]}>
                            {YESNO.map((o) => (
                              <button
                                key={o.id}
                                role="radio"
                                aria-checked={val === o.id}
                                className={"chip" + (val === o.id ? " on" : "")}
                                onClick={() => setAns(q.id, o.id)}
                              >
                                {o.label[lang]}
                              </button>
                            ))}
                          </div>
                        )}

                        {q.kind === "slider" && (
                          <div className="slider-row">
                            <input
                              type="range"
                              className="diner"
                              min={q.min}
                              max={q.max}
                              step={q.step}
                              value={typeof val === "number" ? val : q.init}
                              style={{ ["--fill" as string]: `${(((typeof val === "number" ? val : q.init) - q.min) / (q.max - q.min)) * 100}%` }}
                              onChange={(e) => setAns(q.id, Number(e.target.value))}
                            />
                            <span className="slider-val">
                              {typeof val === "number" ? val : q.init} {q.unit[lang]}
                            </span>
                          </div>
                        )}

                        {q.kind === "text" && (
                          q.long ? (
                            <textarea
                              value={typeof val === "string" ? val : ""}
                              placeholder={q.placeholder[lang]}
                              onChange={(e) => setAns(q.id, e.target.value)}
                            />
                          ) : (
                            <input
                              type="text"
                              value={typeof val === "string" ? val : ""}
                              placeholder={q.placeholder[lang]}
                              onChange={(e) => setAns(q.id, e.target.value)}
                            />
                          )
                        )}

                        {q.kind === "multi" && (
                          <div className="scale small" role="group" aria-label={q.label[lang]}>
                            {q.options.map((o) => {
                              const arr = Array.isArray(val) ? (val as string[]) : [];
                              const on = arr.includes(o.id);
                              return (
                                <button
                                  key={o.id}
                                  aria-pressed={on}
                                  className={"chip" + (on ? " on" : "")}
                                  onClick={() =>
                                    setAns(q.id, on ? arr.filter((x) => x !== o.id) : [...arr, o.id])
                                  }
                                >
                                  {o.label[lang]}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {err && (
                    <p style={{ color: "var(--red-dark)", fontWeight: 700, marginTop: 14 }}>{err}</p>
                  )}

                  <div className="navrow">
                    <button className="btn btn-cream btn-small" onClick={goBack}>
                      ← {T("back")}
                    </button>
                    <span className="progress-note">
                      {T("progress")} {stepIdx + 1} {T("of")} {STEPS.length} · {answeredCount}/{totalCount}
                    </span>
                    {stepIdx < STEPS.length - 1 ? (
                      <button className="btn btn-navy" onClick={goNext}>
                        {T("next")} →
                      </button>
                    ) : (
                      <button className="btn btn-primary" onClick={goNext}>
                        {T("submit")} ★
                      </button>
                    )}
                  </div>
                 </div>
              </div>

              <aside>
                <div className="meter-card">
                  <h3>{T("meterTitle")}</h3>
                  <div className="meter-big">{livePct ? `${livePct}%` : "—"}</div>
                  <div className="meter-track">
                    <div className="meter-fill" style={{ width: `${livePct}%` }}></div>
                  </div>
                  <div className="meter-hint">
                    {answeredSections.length ? T("meterHintHigh") : T("meterHintLow")}
                  </div>
                  {answeredSections.length > 0 && (
                    <span className="verdict">{verdict[lang]}</span>
                  )}
                </div>
              </aside>
            </div>
          </section>
        )}

        {phase === "done" && (
          <section className="anim-in" style={{ padding: "40px 0 10px" }}>
            <div style={{ textAlign: "center", marginBottom: 26 }}>
              <div style={{ fontSize: 44, lineHeight: 1 }}>🍟</div>
              <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", marginTop: 8 }}>{T("thanks")}</h1>
              <p style={{ color: "var(--muted)", maxWidth: "62ch", margin: "8px auto 0" }}>
                {THANKS_BODY[lang]}
              </p>
            </div>

            <div className="score-hero">
              <div className="score-ring" style={{ ["--pct" as string]: overall }}>
                <div className="hole">
                  <div>
                    <div className="num">{overall}%</div>
                    <div className="cap">{T("globalScore")}</div>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 260 }}>
                <span className={`stamp ${overall < 50 ? "red" : overall < 75 ? "amber" : ""}`}>
                  {SCORE_META[Math.min(3, Math.floor(overall / 34))][lang]}
                </span>
                <p style={{ marginTop: 14, fontWeight: 700 }}>
                  {T("resultsSub")}
                </p>
                {npsVal !== null && (
                  <p style={{ marginTop: 6, color: "var(--muted)" }}>
                    {T("npsLabel")}: <strong>{npsVal}/10</strong> — {npsVerdict(npsVal)?.[lang]}
                  </p>
                )}
                {answers["restaurant"] ? (
                  <p style={{ marginTop: 6, color: "var(--muted)" }}>
                    {String(answers["restaurant"])}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="panel" style={{ marginTop: 22 }}>
              <h2>{T("byCategory")}</h2>
              <div className="bars">
                {sections.map((sec) => (
                  <div className="bar-row" key={sec.id}>
                    <span className="bar-label">{sec.title[lang]}</span>
                    <div className="bar-track">
                      <div
                        className={"bar-fill" + (sec.pct < 50 ? " warn" : "")}
                        style={{ width: `${Math.max(sec.pct, 3)}%` }}
                      ></div>
                    </div>
                    <span className="bar-num">{sec.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            <h2 style={{ margin: "30px 0 4px", fontSize: 26 }}>{T("yourActions")}</h2>
            {tips.length === 0 && (
              <p style={{ color: "var(--muted)" }}>
                {lang === "fr"
                  ? "Aucun point critique détecté — belle performance !"
                  : "No critical points detected — great performance!"}
              </p>
            )}
            {tips.map((tp: Tip) => (
              <div className="tip-card" key={tp.id}>
                <div className="tip-head">
                  <span className={`prio p${tp.prio}`}>P{tp.prio}</span>
                  <h3>{tp.title[lang]}</h3>
                </div>
                <p>{tp.body[lang]}</p>
              </div>
            ))}

            <div className="download-strip">
              <button className="btn btn-navy" onClick={downloadJSON}>
                ⬇ {T("download")}
              </button>
              <button className="btn btn-cream" onClick={copySummary}>
                ⧉ {T("copy")}
              </button>
              <button className="btn btn-cream" onClick={restart}>
                ↺ {T("restart")}
              </button>
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <div className="checker red"></div>
        <div className="shell footer-inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="logo-foot" src="/assets/logo-groupe-lbp.png" alt="Groupe LBP" />
          <p className="fineprint">
            {T("disclaimer")} ·{" "}
            <a href="https://www.bellepros.com" style={{ color: "var(--cream)" }}>
              bellepros.com
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}
