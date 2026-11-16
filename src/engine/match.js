import { FACE, BODY, SUPP } from "../data/products";

function item(product, step, why, extra) {
  return { ...product, step, why, ...extra };
}

/** Really-clean wash is FRESH soap liquid, not the bar and not the body wash. */
function liquidSoap() {
  return {
    ...BODY.soapLiquid,
    kind: "Liquid soap",
    desc: "Liquid soap, for the face or the sink. It has NBC7 in it, so a real wash doesn't have to finish tight. This is not the body wash, and not the bar.",
    use: "Wet your face, work a small amount into a lather, massage, rinse. Morning and night if this is your cleanse. Moisturizer after.",
  };
}

export function buildFace(a) {
  const am = [];
  const pm = [];
  const weekly = [];
  const minimal = a.depth === "minimal";
  const full = a.depth === "full";
  const ex = a.extras || [];
  const also = new Set(a.also || []);
  const oilyish = a.skinType === "oily" || a.concern === "breakouts";
  const cityStress = a.climate === "city";
  const dryClimate = a.climate === "dryAir";
  const humid = a.climate === "humidity";
  const wantsMakeup = a.makeup === "yes" || a.makeup === "sometimes";
  const sensitiveAging = a.skinType === "sensitive" && a.concern === "aging";
  const hasConcern = (c) => a.concern === c || also.has(c);

  // —— Cleanse. Their answer picks the products. Makeup only changes how they use them. ——
  const cleanse = a.cleanse || (minimal && !wantsMakeup ? "cream" : "both");
  const makeupDays = a.makeup === "yes";
  if (cleanse === "soap") {
    am.push(
      item(
        liquidSoap(),
        "Cleanse",
        makeupDays
          ? "You like a really clean wash. FRESH soap liquid morning and night, makeup days included. Work it over the makeup until it lifts, then rinse. Moisturizer after so it doesn't finish tight."
          : "You like a really clean wash. This is FRESH soap liquid. Not the body wash, and not the bar. Lather, rinse, then moisturize so it doesn't finish tight."
      )
    );
    pm.push(
      item(
        liquidSoap(),
        "Cleanse",
        "Same liquid soap at night. Not the body wash."
      )
    );
  } else if (cleanse === "cream") {
    const creamCleanse = makeupDays
      ? "Cream cleanser on its own. It takes makeup and sunscreen off. No second cleanse."
      : "You wanted the cream cleanser by itself. Morning and night, then rinse. No micellar step.";
    am.push(item(FACE.cleanser, "Cleanse", creamCleanse));
    pm.push(item(FACE.cleanser, "Cleanse", "Same cream cleanser at night. One step, then the rest of the routine."));
  } else if (cleanse === "water") {
    const waterOnly = {
      desc: "Micellar water. This is the whole cleanse, morning and night — not a second step after a cream cleanser.",
      use: "Cotton pad, morning and night. It can stay on. No cream cleanser before it.",
    };
    am.push(
      item(
        FACE.cleansingWater,
        "Cleanse",
        "Cleansing water on a cotton pad. It can stay on. This is the micellar cleanse, not a sink wash.",
        waterOnly
      )
    );
    pm.push(
      item(
        FACE.cleansingWater,
        "Cleanse",
        makeupDays
          ? "Same at night. On makeup days, use a fresh side of the pad until the cotton comes away clean."
          : "Same at night. A cotton pad, and it can stay on.",
        makeupDays
          ? {
              ...waterOnly,
              use: "On makeup days, use a fresh side of the pad until the cotton comes away clean. No cream cleanser before it.",
            }
          : waterOnly
      )
    );
  } else {
    am.push(
      item(
        FACE.cleansingWater,
        "Cleanse",
        makeupDays
          ? "Morning is the micellar water. Last night did the heavy lift."
          : "Morning cleanse is the micellar water. Light, and it can stay on."
      )
    );
    pm.push(
      item(
        FACE.cleanser,
        "Cleanse",
        makeupDays
          ? "Night: cream cleanser first. It melts makeup, sunscreen, and the day."
          : "Night: the cream cleanser. One real wash, not a foam strip."
      )
    );
    pm.push(
      item(
        FACE.cleansingWater,
        "Cleansing water",
        "Then cleansing water. The cream starts it. The micellar water finishes it."
      )
    );
  }

  // —— Tone (skip when lean) ——
  if (!minimal) {
    const t = oilyish || humid ? FACE.tonicPure : FACE.tonicCalm;
    const tWhy =
      oilyish || humid
        ? "This is the clarifying toner. Mulberry in it helps with oil and blackheads. I like it even when skin isn't oily."
        : a.skinType === "sensitive"
          ? "This is the gentle toner. Better if your skin reddens or stings."
          : "This is the gentle toner.";
    am.push(item(t, "Tone", tWhy));
    pm.push(item(t, "Tone", "Same toner at night, before serum."));
  }

  // —— One serum. Firmness gets anti wrinkle. Every other concern gets hydro. ——
  if (a.concern === "aging") {
    pm.push(
      item(
        FACE.antiWrinkle,
        "Treat",
        sensitiveAging
          ? "You asked about firmness, and your skin is sensitive. Evening only. Every other night to start."
          : "You asked about firmness, so this is the serum. Evening. Every other night is enough to start."
      )
    );
  } else if (a.concern === "breakouts") {
    am.push(
      item(
        FACE.hydroSerum,
        "Hydrate",
        "Breakouts often get worse when skin is dried out. This serum is the moisture under the clarifying step."
      )
    );
    if (!minimal) {
      pm.push(
        item(FACE.addsRepair, "Treat", "This is the breakout step. Mix it into the serum, or just on the spot.")
      );
    } else {
      pm.push(item(FACE.hydroSerum, "Hydrate", "Same serum at night while skin settles. You can add the clarifying booster later."));
    }
  } else if (a.concern === "dullness" || a.concern === "brightening" || a.concern === "scarring") {
    am.push(
      item(
        FACE.hydroSerum,
        "Hydrate",
        "Brightness shows up better on skin that isn't thirsty. Serum first."
      )
    );
    const glowWhy =
      a.concern === "scarring"
        ? "For marks left behind. Shake it, then one pump into your serum. Not around the eyes."
        : a.concern === "brightening"
          ? "For dark spots and uneven color. Shake it, then one pump into your serum."
          : cityStress
            ? "Skin looks flat, and you're in city air a lot. Shake it, then one pump into your serum."
            : "Skin looks flat. Shake it, then one pump into the hydro serum.";
    am.push(item(FACE.addsGlow, "Treat", glowWhy));
    pm.push(
      item(
        FACE.hydroSerum,
        "Hydrate",
        a.concern === "scarring"
          ? "Same serum at night if you want it. The glow booster stays in the morning."
          : "Same serum at night if you want it. You don't have to."
      )
    );
  } else if (a.concern === "eyes") {
    am.push(item(FACE.hydroSerum, "Hydrate", "A little moisture on the rest of the face, since the eyes are the main thing."));
    am.push(item(FACE.eyeSerum, "Eyes", "This is the eye step. Face cream is too heavy here."));
    pm.push(item(FACE.eyeSerum, "Eyes", "Same at night. Give it about four weeks."));
  } else {
    // dehydration / default
    const serumWhy =
      a.concern === "dehydration"
        ? "You said skin feels thirsty. This is the serum for that. A few drops."
        : "A simple moisture serum. A few drops, then cream.";
    am.push(item(FACE.hydroSerum, "Treat", serumWhy));
    pm.push(item(FACE.hydroSerum, "Treat", "Same serum at night, if you want it. Every day is optional."));
  }

  // —— One extra treat, and never a second serum ——
  if (full && also.size) {
    if (also.has("breakouts") && a.concern !== "breakouts" && a.concern !== "aging") {
      pm.push(item(FACE.addsRepair, "Spot treat", "You mentioned breakouts. Use this on the spot, not as a second serum all over."));
    } else if (
      (also.has("dullness") || also.has("brightening") || also.has("scarring")) &&
      a.concern !== "dullness" &&
      a.concern !== "brightening" &&
      a.concern !== "scarring" &&
      a.concern !== "breakouts" &&
      a.concern !== "aging"
    ) {
      const why = also.has("scarring")
        ? "You mentioned leftover marks. Morning only, one pump into your serum. Not around the eyes."
        : also.has("brightening")
          ? "You mentioned dark spots. Morning, one pump into your serum."
          : "You said skin looks flat. Morning, one pump into your serum.";
      am.push(item(FACE.addsGlow, "Boost", why));
    }
  }

  const glowAlready =
    a.concern === "dullness" ||
    a.concern === "brightening" ||
    a.concern === "scarring" ||
    am.some((p) => p.id === "addsGlow") ||
    pm.some((p) => p.id === "addsGlow");
  if (
    a.concern !== "aging" &&
    !glowAlready &&
    (also.has("scarring") || also.has("brightening") || (full && also.has("dullness")))
  ) {
    const why = also.has("scarring")
      ? "You mentioned leftover marks. Shake it. Morning only, one pump into your serum. Not around the eyes."
      : also.has("brightening")
        ? "You mentioned dark spots. Shake it. Morning, one pump into your serum."
        : "You said skin looks flat. Shake it. Morning, one pump into your serum.";
    am.push(item(FACE.addsGlow, "Boost", why));
  }

  // Eyes as add-on (not already primary) — secondary concern only, not every extra checkbox
  if (a.concern !== "eyes" && also.has("eyes")) {
    pm.push(
      item(FACE.eyeSerum, "Eyes", "You mentioned the eye area. Night is enough to start.")
    );
  } else if (a.concern !== "eyes" && ex.includes("eyes") && full && a.concern !== "breakouts") {
    pm.push(item(FACE.eyeSerum, "Eyes", "Eye cream, because face cream is too heavy there."));
  }

  // —— One booster max when it sharpens the #1 goal (full ritual only) ——
  if (full && a.concern === "aging" && !sensitiveAging && a.skinType !== "sensitive") {
    pm.push(
      item(
        FACE.addsEffect,
        "Boost",
        "One pump mixed into the anti wrinkle serum. This is the one for expression lines."
      )
    );
  }

  // —— Moisturise. Cream rich unless the answers are exactly a light or medium case. ——
  const menRoutine = ex.includes("men");
  const thirsty = hasConcern("dehydration") || a.skinType === "dry" || dryClimate || also.has("barrier") || hasConcern("aging");
  const creamLightCase = a.skinType === "oily" && a.concern === "breakouts" && !thirsty;
  const creamMediumCase = a.skinType === "sensitive" && !thirsty && a.concern !== "breakouts";
  const cream = menRoutine
    ? FACE.menMoisturiser
    : creamLightCase
      ? FACE.creamLight
      : creamMediumCase
        ? FACE.creamMedium
        : FACE.creamRich;
  const creamExtra =
    cream.id === "creamRich" ? { kind: "The everyday cream" } : undefined;
  const creamWhy = menRoutine
    ? "You wanted a man's routine, so this is the moisturiser. One step."
    : cream.id === "creamLight"
      ? "Skin is oily and breaking out, and you didn't say it feels dry. This is the cream for that."
      : cream.id === "creamMedium"
        ? "Skin is sensitive, and it isn't dry or tight. This is the cream that usually gets along with that."
        : "This is the cream I recommend. It has the best reviews, and it works on more skin types than the label suggests.";

  am.push(item(cream, "Moisturise", creamWhy, creamExtra));
  pm.push(
    item(
      cream,
      "Moisturise",
      menRoutine ? "Same step at night." : "Same cream at night. It seals whatever came before it.",
      creamExtra
    )
  );

  // Skin perfecting cream is the extra people love, not a second everyday cream.
  const showPerfecting = !menRoutine && ((!minimal && a.concern !== "breakouts") || also.has("barrier"));
  if (showPerfecting) {
    pm.push(
      item(
        FACE.skinPerfection,
        "When you want more",
        "Use this when skin feels dry, tight, or overworked. Your day cream is still the everyday one.",
        { kind: "The extra cream" }
      )
    );
  }

  // Nice-to-haves — only when explicitly asked, and never in the morning pile for after sun
  if (full && ex.includes("tint")) {
    am.push(item(FACE.tinted, "Perfect", "You asked for light coverage. This goes over the serum."));
  }
  if (full && ex.includes("lips")) {
    am.push(item(FACE.lipBalm, "Lips", "You asked for lip care. No petroleum in this one."));
  }

  // After sun: only when they asked for it — never from climate alone, never AM
  if (ex.includes("afterSun")) {
    pm.push(
      item(
        FACE.afterSun,
        "As needed · after sun",
        "You asked for after-sun care. Use it after a day outside. Not a morning step, and not sunscreen."
      )
    );
  }

  // Weekly — prefer one polish, not mask + scrub stacked
  const wantMask = full || ex.includes("mask");
  const wantScrub =
    ex.includes("scrub") || (full && hasConcern("dullness") && a.skinType !== "sensitive" && !also.has("barrier"));

  if (wantMask) {
    const oilyishMask = a.skinType === "oily" || a.concern === "breakouts";
    const gentleMask = a.skinType === "sensitive" || a.skinType === "dry" || also.has("barrier");
    let mask = FACE.exfoliatingMask;
    let maskWhy = "A weekly mask with fruit enzymes. No scrubbing grains.";
    if (gentleMask) {
      mask = FACE.enzymeMask;
      maskWhy = "Enzymes, not a scrub. Every other week is enough for your skin.";
    } else if (oilyishMask) {
      mask = FACE.purifyingMask;
      maskWhy = "A clay mask for the extra oil. It should not leave you tight.";
    } else if (a.concern === "aging" || also.has("aging")) {
      mask = FACE.peptideMask;
      maskWhy = "A weekly firming mask. Rinse it off, or leave it on.";
    }
    weekly.push(item(mask, "1–2× weekly", maskWhy));
  }
  if (wantScrub && !wantMask) {
    weekly.push(
      item(FACE.scrub, "1× weekly", "Gentle face & body polish — once a week is plenty")
    );
  } else if (wantScrub && wantMask && ex.includes("scrub")) {
    weekly.push(
      item(
        FACE.scrub,
        "1× weekly · alternate",
        "Skip the same week as your mask if your skin is easily stressed"
      )
    );
  }

  return { am, pm, weekly };
}

export function buildBody(a) {
  const out = [];
  const raw = a.swaps || [];
  const auto = raw.includes("auto") || raw.length === 0;
  const has = (k) => auto || raw.includes(k);
  const bx = a.bodyExtras || [];
  const asked = (k) => raw.includes(k) || bx.includes(k);

  const milk = a.bodySkin === "veryDry" ? BODY.bodyMilkRich : BODY.bodyMilk;
  const skinWhy = {
    veryDry: "Body skin is very dry, so this is the richer milk.",
    normal: "A light body milk. Enough, without feeling heavy.",
    sensitiveBody: "Oat is usually the calmest option when body skin reacts.",
  }[a.bodySkin] || "Daily moisture for the body.";

  // Auto path: smart everyday base
  if (auto) {
    out.push(item(BODY.bodyWash, "Shower", a.bodySkin === "sensitiveBody"
      ? "A body wash that doesn't leave sensitive skin stripped."
      : "NBC7 is in this wash, so it cleans without that stripped feeling."));
    out.push(item(milk, "Body", skinWhy));
    out.push(item(BODY.deodorant, "Deodorant", "A cream deodorant. No aluminium salts."));
    out.push(item(BODY.handBalm, "Hands", "Light enough that you'll actually put it on again. It also helps with spots on the hands."));
    if (bx.includes("legs")) {
      out.push(item(BODY.lightLegs, "Legs", "For legs that feel heavy or tired at the end of the day."));
    }
    if (asked("afterSun")) {
      out.push(item(FACE.afterSun, "After sun", "After a day outside. Not sunscreen."));
    }
    if (asked("scrub")) {
      out.push(item(FACE.scrub, "Polish", "A real scrub, when you want one. Skip it if skin feels raw."));
    }
    if (a.hairType !== "skipHair") {
      out.push(a.hairType === "fine"
        ? item(BODY.volumeShampoo, "Shampoo", "Hair is fine or flat, so this is the volume shampoo.")
        : item(BODY.shampoo, "Shampoo", a.hairType === "dry"
          ? "Hair feels dry, so this is the repair shampoo."
          : "A gentle daily shampoo."));
      out.push(item(BODY.hairTreatment, "Condition", a.hairType === "dry"
        ? "Conditioner for dry hair. Leave it on for a minute."
        : "Conditioner after the shampoo."));
    }
    // has() is true for every key on the auto path. Only add these when they were ticked.
    if (raw.includes("oral")) {
      out.push(item(BODY.toothOil, "Teeth & gums", "Oil pulling. Swish it before you brush."));
    }
    if (raw.includes("wipes")) {
      out.push(item(BODY.stayFresh, "Bum care", "Foam on toilet paper, for the bum and the intimate area."));
    }
    return out;
  }

  const wantsTrio = has("lotion") && has("hands") && has("feet");
  if (wantsTrio) {
    out.push(item(BODY.bodySet, "Head to toe", "You wanted body, hands, and feet. This set is those three."));
  } else {
    if (has("lotion")) out.push(item(milk, "Body", skinWhy));
    if (has("hands") || bx.includes("handsExtra")) {
      out.push(item(BODY.handBalm, "Hands", bx.includes("handsExtra")
        ? "Hands take a beating. Put this on after you wash them."
        : "A light hand balm. It also helps with spots on the hands."));
    }
    if (has("feet") || bx.includes("feetExtra")) {
      out.push(item(BODY.footBalm, "Feet", "For dry, tired feet."));
    }
  }

  if (has("wash")) {
    out.push(item(BODY.bodyWash, "Shower", a.bodySkin === "sensitiveBody"
      ? "A body wash that doesn't leave sensitive skin stripped."
      : "NBC7 is in this wash, so it cleans without that stripped feeling."));
  }
  if (has("handSoap")) out.push(item(BODY.soapLiquid, "Hand soap", "The soap at the sink. It shouldn't leave hands raw."));
  if (has("deo")) out.push(item(BODY.deodorant, "Deodorant", "A cream deodorant. No aluminium salts."));
  if (has("legs") || bx.includes("legs")) {
    out.push(item(BODY.lightLegs, "Legs", "Cooling care for heavy or tired legs."));
  }
  if (asked("afterSun")) {
    out.push(item(FACE.afterSun, "After sun", "After a day outside. Not sunscreen."));
  }
  if (asked("scrub")) {
    out.push(item(FACE.scrub, "Polish", "Gentle face & body scrub — once a week is plenty"));
  }

  const includeHair =
    a.hairType !== "skipHair" && (has("shampoo") || has("conditioner"));

  if (includeHair) {
    if (has("shampoo")) {
      out.push(a.hairType === "fine"
        ? item(BODY.volumeShampoo, "Shampoo", "Hair is fine or flat, so this is the volume shampoo.")
        : item(BODY.shampoo, "Shampoo", a.hairType === "dry"
          ? "Hair feels dry, so this is the repair shampoo."
          : "A gentle daily shampoo."));
    }
    if (has("conditioner") || a.hairType === "dry") {
      out.push(item(BODY.hairTreatment, "Condition", a.hairType === "dry"
        ? "Conditioner for dry hair. Leave it on for a minute."
        : "Conditioner after the shampoo."));
    }
  }

  if (has("oral")) out.push(item(BODY.toothOil, "Teeth & gums", "Oil pulling. Swish it before you brush."));
  if (has("wipes")) out.push(item(BODY.stayFresh, "Bum care", "Foam on toilet paper, for the bum and the intimate area."));

  return out;
}

/** Normalize approach + goals + lifestyle from new or legacy answer shapes. */
function resolveSuppAnswers(a) {
  let approach = a.approach;
  if (!approach) {
    if (a.foundation === "foundation") approach = "both";
    else if (a.foundation === "targeted") approach = "targeted";
    else if (a.goal === "energy") approach = "overall";
    else approach = "targeted";
  }

  let goals = Array.isArray(a.goals) ? [...a.goals] : [];
  if (!goals.length && a.goal) {
    if (a.goal === "gut") goals.push("gut");
    else if (a.goal === "gutMicro" || a.goal === "gutFibre") goals.push("gut");
    else goals.push(a.goal);
  }
  // Legacy extras → lifestyle
  const lifestyle = [
    ...(Array.isArray(a.lifestyle) ? a.lifestyle : []),
    ...(a.suppExtras || []),
  ];
  (a.suppExtras || []).forEach((x) => {
    if (x === "nofish" && !lifestyle.includes("lowFish")) lifestyle.push("lowFish");
    if (x === "meals" && !lifestyle.includes("heavyMeals")) lifestyle.push("heavyMeals");
  });

  goals = [...new Set(goals)].slice(0, 3);
  const life = [...new Set(lifestyle)].slice(0, 4);
  const depth = a.suppDepth || "balanced";
  return { approach, goals, lifestyle: life, depth };
}

export function buildSupp(a) {
  const { approach, goals, lifestyle, depth } = resolveSuppAnswers(a);
  const daily = [];
  const targeted = [];
  const seen = new Set();
  const life = (k) => lifestyle.includes(k);

  const addDaily = (p, why) => {
    if (!p?.id || seen.has(p.id)) return;
    seen.add(p.id);
    daily.push({ ...p, why });
  };
  const addTargeted = (p, why) => {
    if (!p?.id || seen.has(p.id)) return;
    seen.add(p.id);
    targeted.push({ ...p, why });
  };

  const wantFoundation = approach === "overall" || approach === "both";
  const wantTargeted = approach === "targeted" || approach === "both";

  if (wantFoundation) {
    addDaily(
      SUPP.packsABC,
      "The daily base. One berry pack, one greens pack, one fibre pack."
    );
  }

  const mapGoal = (g) => {
    switch (g) {
      case "immune":
        addTargeted(SUPP.immu, "You wanted something for when everyone's getting sick.");
        if (!wantFoundation) addTargeted(SUPP.packAntiox, "The berry pack goes well next to the mushroom capsule.");
        break;
      case "gut":
      case "gutMicro":
      case "gutFibre":
        addTargeted(SUPP.biotic, "You wanted help with gut and digestion.");
        if (!wantFoundation) {
          addTargeted(SUPP.packCleansing, "Fibre for the cultures. Drink it with a lot of water.");
        }
        break;
      case "meals":
        addTargeted(SUPP.dgest, "You said meals sit heavy. Take it with the meal.");
        break;
      case "focus":
        addTargeted(SUPP.cerebro, "You wanted help with focus. It is not a stimulant.");
        break;
      case "mood":
        addTargeted(SUPP.moodoo, "You wanted something for stress and mood.");
        break;
      case "joints":
        addTargeted(SUPP.flx, "You wanted help with joints. Shake it with water.");
        if (depth === "layered") {
          addTargeted(SUPP.move, "A capsule to go with the drink.");
        }
        break;
      case "beauty":
        addTargeted(SUPP.beautyHair, "You wanted skin, hair, and nails from the inside.");
        if (!life("lowFish") && !life("plantHeavy") && !goals.includes("omega")) {
          addTargeted(SUPP.omega, "Plant omega-3, from algae. Useful if you don't eat much fish.");
        }
        break;
      case "energy":
        if (!wantFoundation) {
          addTargeted(SUPP.packBalancing, "You wanted everyday energy. This is the greens pack.");
        }
        break;
      case "longevity":
        addTargeted(SUPP.spermidine, "You wanted the long-game option. Not a quick fix.");
        break;
      case "screens":
        addTargeted(SUPP.protect, "You're on screens a lot. This does not replace sunscreen.");
        break;
      case "omega":
      case "nofish":
        addTargeted(SUPP.omega, "Plant omega-3 from algae. For when you don't eat much fish.");
        break;
      case "women":
        addTargeted(SUPP.fem, "You wanted a women's capsule. Not a diagnosis, and not a treatment.");
        break;
      case "men":
        addTargeted(SUPP.mascu, "You wanted a men's capsule. Not a treatment.");
        break;
      case "bladder":
        addTargeted(SUPP.hydro, "You wanted everyday bladder comfort. Not a treatment for an infection.");
        break;
      case "antiox":
        if (!wantFoundation) {
          addTargeted(SUPP.packAntiox, "Berry and plant antioxidants. A daily pack, not a treatment.");
        }
        break;
      default:
        break;
    }
  };

  const applyLifestyle = () => {
    if (life("heavyMeals") || life("meals")) {
      addTargeted(SUPP.dgest, "You said meals sit heavy. Take this with those meals.");
    }
    if (life("lowFish") || life("nofish") || life("plantHeavy")) {
      addTargeted(SUPP.omega, "You don't eat much fish. This omega-3 comes from algae.");
    }
    if (life("screens") || life("outdoor")) {
      addTargeted(
        SUPP.protect,
        life("screens")
          ? "You're on screens a lot. This does not replace sunscreen."
          : "You're outside a lot. This does not replace sunscreen."
      );
    }
    if (life("women")) {
      addTargeted(SUPP.fem, "You wanted a women's capsule. Not a diagnosis.");
    }
    if (life("men")) {
      addTargeted(SUPP.mascu, "You wanted a men's capsule. Not a treatment.");
    }
    if (life("bladder")) {
      addTargeted(SUPP.hydro, "You wanted everyday bladder comfort. Not a treatment for an infection.");
    }
    if (life("stressed") || life("darkerMonths")) {
      if (!goals.includes("mood")) {
        addTargeted(SUPP.moodoo, "You said stress or darker months.");
      }
      if (life("stressed") && !goals.includes("immune") && depth !== "lean") {
        addTargeted(SUPP.immu, "A busy stretch. This is the mushroom capsule.");
      }
    }
    if (life("active") && !goals.includes("joints")) {
      addTargeted(SUPP.flx, "You're active. This is the once-a-day joint drink.");
    }
  };

  const shouldLayer =
    wantTargeted || (approach === "overall" && (goals.length > 0 || lifestyle.length > 0));

  if (shouldLayer) {
    goals.forEach(mapGoal);
    applyLifestyle();
  }

  // Overall-only with nothing selected
  if (approach === "overall" && goals.length === 0 && lifestyle.length === 0) {
    return { daily, targeted: [], approach, goals, lifestyle, depth };
  }

  // Targeted with nothing selected: suggest foundation
  if (approach === "targeted" && targeted.length === 0) {
    addDaily(
      SUPP.packsABC,
      "You didn't pick a specific goal, so this is the daily base to start with."
    );
  }

  const maxTargeted =
    depth === "lean" ? 2 : depth === "layered" ? approach === "overall" ? 4 : 6 : approach === "overall" ? 3 : 5;

  return {
    daily,
    targeted: targeted.slice(0, maxTargeted),
    approach,
    goals,
    lifestyle,
    depth,
  };
}

export function summarizeAnswers(ans, path) {
  const bits = [];
  if (path === "skin" || path === "both") {
    const skin = { dry: "Dry skin", oily: "Oily skin", combo: "Combination skin", sensitive: "Sensitive skin" }[ans.skinType];
    const concern = {
      aging: "fine lines & firmness",
      dehydration: "dehydration",
      breakouts: "breakouts",
      dullness: "dullness",
      brightening: "dark spots & brightening",
      scarring: "marks & scarring",
      eyes: "eye care",
    }[ans.concern];
    const cleanseLabel = {
      soap: "liquid soap cleanse",
      cream: "cream cleanser only",
      water: "micellar water",
      both: "cream at night, water in the morning",
    }[ans.cleanse];
    if (skin) bits.push(skin);
    if (concern) bits.push(concern);
    if (cleanseLabel) bits.push(cleanseLabel);
    if ((ans.also || []).includes("barrier")) bits.push("barrier support");
    if (ans.makeup === "yes") bits.push("makeup days");
    if (ans.climate === "sunSeason") bits.push("outdoor / sun season");
    if (ans.depth === "minimal") bits.push("lean ritual");
    if (ans.depth === "full") bits.push("full ritual");
  }
  if (path === "supp" || path === "both") {
    const { approach, goals, lifestyle, depth } = resolveSuppAnswers(ans);
    const approachLabel = {
      overall: "daily base",
      targeted: "specific goals",
      both: "daily base plus extras",
    }[approach];
    if (approachLabel) bits.push(approachLabel);
    const goalLabels = {
      immune: "immune support",
      gut: "gut and digestion",
      gutMicro: "gut and digestion",
      gutFibre: "gut and digestion",
      focus: "focus",
      mood: "stress and mood",
      joints: "joints",
      beauty: "skin, hair, and nails",
      energy: "everyday energy",
      longevity: "the long game",
    };
    goals.slice(0, 3).forEach((g) => {
      if (goalLabels[g]) bits.push(goalLabels[g]);
    });
    const lifeLabels = {
      stressed: "a stressful stretch",
      heavyMeals: "heavy meals",
      lowFish: "doesn't eat much fish",
      plantHeavy: "mostly plants",
      screens: "on screens a lot",
      active: "stays active",
      women: "women's health",
      men: "men's health",
      bladder: "bladder comfort",
      darkerMonths: "darker months",
      outdoor: "outdoors a lot",
    };
    lifestyle.slice(0, 2).forEach((k) => {
      if (lifeLabels[k]) bits.push(lifeLabels[k]);
    });
    if (depth === "lean") bits.push("a short list");
    if (depth === "layered") bits.push("the fuller list");
  }
  if (ans.intent === "starter") bits.push("first order");
  if (ans.intent === "upgrade") bits.push("fuller ritual");
  if (ans.intent === "curious") bits.push("learning");
  return bits.join(" · ");
}

/**
 * Rank unique products from the full match into a 3–5 item Start here set.
 */
export function buildHero(ans, path, face, body, supp) {
  const intent = ans.intent || "starter";
  const max =
    intent === "curious" ? 3 : intent === "starter" || ans.depth === "minimal" ? 4 : 5;

  const scores = new Map(); // id -> { product, score, why }

  const bump = (p, score, why) => {
    if (!p?.id) return;
    const prev = scores.get(p.id);
    if (!prev || score > prev.score) {
      scores.set(p.id, {
        ...p,
        step: "Start here",
        why: why || p.why,
        _score: score,
      });
    } else if (prev && score === prev.score && why && !prev.why) {
      scores.set(p.id, { ...prev, why });
    }
  };

  // Face priorities
  if (face) {
    const allFace = [...(face.am || []), ...(face.pm || []), ...(face.weekly || [])];
    const byId = {};
    allFace.forEach((p) => {
      if (!byId[p.id]) byId[p.id] = p;
    });

    // Core treat
    const sensitiveAging = ans.skinType === "sensitive" && ans.concern === "aging";
    if (ans.concern === "aging") {
      bump(byId.antiWrinkle || FACE.antiWrinkle, 100, "Your #1 face goal — one serum, in the evening");
      if (!sensitiveAging && intent !== "curious" && ans.depth !== "minimal") {
        bump(byId.addsEffect || FACE.addsEffect, 88, "One pump mixed into the anti wrinkle serum");
      }
      if (byId.skinPerfection) bump(byId.skinPerfection, 84, byId.skinPerfection.why);
    } else if (ans.concern === "breakouts") {
      bump(byId.addsRepair || FACE.addsRepair, 98, "Your #1 face goal — clear without wrecking your barrier");
      bump(byId.hydroSerum || FACE.hydroSerum, 85, "Hydrated skin produces less compensatory oil");
    } else if (ans.concern === "dullness" || ans.concern === "brightening" || ans.concern === "scarring") {
      const glowHero =
        ans.concern === "scarring"
          ? "Your #1 — glow booster on the marks left behind"
          : ans.concern === "brightening"
            ? "Your #1 — glow booster for dark spots and uneven color"
            : "Your #1 — glow booster for skin that looks flat";
      bump(byId.addsGlow || FACE.addsGlow, 98, glowHero);
      bump(byId.hydroSerum || FACE.hydroSerum, 86, "Hydration underneath, so the brightening has something to sit on");
    } else if (ans.concern === "eyes") {
      bump(byId.eyeSerum || FACE.eyeSerum, 100, "Your #1 concern — dedicated care for the thinnest skin on your face");
      bump(byId.hydroSerum || FACE.hydroSerum, 80, "Whole-face hydration supports the eye area too");
    } else {
      bump(byId.hydroSerum || FACE.hydroSerum, 95, "Your #1 face goal — deep, lasting moisture at six depths");
    }

    // Cream always earns a seat for starters
    const cream = byId.menMoisturiser || byId.creamLight || byId.creamMedium || byId.creamRich || FACE.creamRich;
    bump(cream, 70, cream.why || "Seals your treat step — matched to your skin type");

    const wantsMakeup = ans.makeup === "yes" || ans.makeup === "sometimes";
    const cleansePick = ans.cleanse || (ans.depth === "minimal" && !wantsMakeup ? "cream" : "both");
    if (cleansePick === "soap") {
      bump(byId.soapLiquid || BODY.soapLiquid, 74, "Your cleanse — FRESH soap liquid, the microbiome-friendly liquid soap, not the body wash");
    } else if (cleansePick === "water") {
      bump(byId.cleansingWater || FACE.cleansingWater, 74, "Your cleanse — micellar cleansing water");
    } else if (cleansePick === "cream") {
      bump(byId.cleanser || FACE.cleanser, 74, "Your cleanse — the cream cleanser, and nothing else");
    } else if (intent === "starter" || intent === "curious") {
      bump(byId.cleanser || FACE.cleanser, 68, "Night cream cleanser, morning cleansing water");
      bump(byId.cleansingWater || FACE.cleansingWater, 64, "The morning half of the cleanse");
    }

    if (ans.concern === "breakouts" || ans.skinType === "oily") {
      bump(byId.tonicPure || FACE.tonicPure, 68, "Clarifying toner for oil and congestion");
    }
    if (byId.afterSun) {
      bump(byId.afterSun, 62, byId.afterSun.why || "After-sun soothe and soft glow");
    }
    if ((ans.also || []).includes("barrier") && byId.skinPerfection) {
      bump(byId.skinPerfection, 84, "You flagged a stressed barrier — recovery earns a Start here seat");
    }
  }

  // Body priorities — quieter on "both" so face/supp can share the shortlist
  const bodyScale = path === "both" ? 0.72 : 1;
  if (body?.length) {
    body.forEach((p) => {
      let score = 40;
      if (p.id === "deodorant") score = 82;
      if (p.id === "bodyWash") score = 75;
      if (p.id === "bodyMilk" || p.id === "bodyMilkRich" || p.id === "bodySet") score = 74;
      if (p.id === "lightLegs") score = 80;
      if (p.id === "afterSun") score = 70;
      if (p.id === "volumeShampoo" || p.id === "shampoo") score = 55;
      if (p.id === "handBalm") score = 50;
      if (p.id === "footBalm") score = 52;
      /* Cooling leg spray is not orderable yet, so it stays in the routine
         and off the first-order shortlist. */
      if (p.id === "lightLegs") score = Math.min(score, 36);
      bump(p, Math.round(score * bodyScale), p.why);
    });
  }

  // Supp priorities — on "both", don't let ABC drown face heroes
  if (supp) {
    const dailyScore = path === "both" ? 78 : 92;
    const targetedBase = path === "both" ? 74 : 90;
    (supp.daily || []).forEach((p) => bump(p, dailyScore, p.why || "Your daily foundation"));
    (supp.targeted || []).forEach((p, idx) => {
      bump(p, targetedBase - idx * 8, p.why);
    });
  }

  // Starter / curious: prefer fewer boosters & extras
  if (intent === "starter" || intent === "curious" || ans.depth === "minimal") {
    ["addsEffect", "addsGlow", "addsRepair", "enzymeMask", "exfoliatingMask", "peptideMask", "purifyingMask", "tinted", "lipBalm", "skinPerfection"].forEach((id) => {
      const row = scores.get(id);
      if (row) scores.set(id, { ...row, _score: row._score - 25 });
    });
  }

  // Curious: soft buy — still show heroes but keep list tiny (already max 3)
  const ranked = [...scores.values()]
    .sort((a, b) => b._score - a._score)
    .slice(0, max)
    .map(({ _score, ...p }, idx) => ({
      ...p,
      step: `Priority ${idx + 1}`,
    }));

  const title =
    intent === "upgrade"
      ? "Your ritual shortlist"
      : intent === "curious"
        ? "Start learning here"
        : "Your first order";

  const subtitle =
    intent === "upgrade"
      ? "The ones worth starting with from your full match."
      : intent === "curious"
        ? "A few products to learn the line — start here, no rush."
        : "If you only order a handful, make it these.";

  return { title, subtitle, items: ranked };
}

function week1Cleanse(ans = {}) {
  const minimal = ans.depth === "minimal";
  const wantsMakeup = ans.makeup === "yes" || ans.makeup === "sometimes";
  const cleanse = ans.cleanse || (minimal && !wantsMakeup ? "cream" : "both");
  if (cleanse === "soap") {
    return "Morning and night: FRESH soap liquid. Lather, rinse, then moisturize. Don't add the cream cleanser.";
  }
  if (cleanse === "cream") return "Cream cleanser morning and night. Don't add micellar water.";
  if (cleanse === "water") return "Micellar water morning and night. That's the whole cleanse.";
  return "Morning: micellar water. Night: cream cleanser, then micellar water.";
}

export function buildPlaybook(ans, path, hero, face, body, supp) {
  const heroIds = new Set((hero?.items || []).map((p) => p.id));
  const stretch = [];
  const seen = new Set(heroIds);

  const consider = (list) => {
    (list || []).forEach((p) => {
      if (!p?.id || seen.has(p.id)) return;
      seen.add(p.id);
      stretch.push(p);
    });
  };

  if (face) {
    consider(face.am);
    consider(face.pm);
    consider(face.weekly);
  }
  consider(body);
  if (supp) {
    consider(supp.daily);
    consider(supp.targeted);
  }

  const week1 = [];
  if (path === "skin" || path === "both") {
    week1.push(week1Cleanse(ans));
    week1.push("Serum when you want it, then cream. A serum every day is optional.");
    if (ans.concern === "aging") week1.push("Anti wrinkle serum in the evening. Every other night is plenty to start.");
    else if (ans.concern === "breakouts") week1.push("Zone clarifying booster on active spots; give it 2–3 weeks before judging.");
    else week1.push("Give any new booster 2–3 weeks before you decide it's not for you.");
  }
  if (path === "supp" || path === "both") {
    const { approach } = resolveSuppAnswers(ans);
    if (approach === "overall") {
      week1.push("Start with PACKS ABC daily — antiox, balancing, cleansing — before adding capsules.");
    } else if (approach === "both") {
      week1.push("Take PACKS ABC as your daily base; add targeted capsules with the meal pattern on each label.");
    } else {
      week1.push("Take supplements with the meal pattern on the label — consistency beats stacking.");
    }
  }
  if (body?.some((p) => p.id === "deodorant")) {
    week1.push("Coming off antiperspirant? Give FRESH deodorant 2–3 weeks to recalibrate.");
  }
  while (week1.length < 3 && path) {
    week1.push("Patch-test new skincare if you're reactive — and when in doubt, message me your match.");
    break;
  }

  return {
    buyFirst: hero?.items || [],
    addNext: stretch.slice(0, 3),
    week1: week1.slice(0, 3),
  };
}

export function buildInsight(ans, path, heroItems = []) {
  const parts = [];
  const heroNames = (heroItems || []).slice(0, 3).map((p) => p.name);
  if (heroNames.length) {
    parts.push(
      `Start with ${heroNames.join(", ").replace(/, ([^,]*)$/, " and $1")} — those are the ones that fit your answers best.`
    );
  }

  if (path === "skin" || path === "both") {
    const skinLine = {
      dry: "Your skin runs dry, so we're prioritizing barrier repair and cushion — not stripping cleansers.",
      oily: "Your skin runs oilier, so clarifying steps and a sebum-smart cream lead — not just 'lighter' products.",
      combo: "Combination skin gets the balanced middle path — enough care without weighing the T-zone down.",
      sensitive: "Reactive skin needs harmony more than heroics — calm support and actives that don't pick fights.",
    }[ans.skinType];

    const concernLine = {
      aging: "Firmness and fine lines put anti wrinkle serum at the center of your treat step.",
      dehydration: "Thirst is the brief — hydro serum's six hyaluronic depths, sealed with the right cream.",
      breakouts: "Breakouts called the shot — clear, hydrate underneath, and don't strip the barrier.",
      dullness: "Dullness put hydration and the glow booster on the shortlist.",
      brightening: "Dark spots and brightening put the glow booster on the shortlist, on top of real hydration.",
      scarring: "Marks left behind put the glow booster on those spots. Undiluted only on a mark, never around the eyes.",
      eyes: "The eye area is the priority — dedicated serum, light enough for skin this thin.",
    }[ans.concern];

    if (skinLine) parts.push(skinLine);
    if (concernLine) parts.push(concernLine);
    if (ans.depth === "minimal") parts.push("You asked for lean, so the Start here list stays honest — no filler.");
  }

  if (path === "supp" || path === "both") {
    const { approach, goals, lifestyle, depth } = resolveSuppAnswers(ans);
    if (approach === "overall") {
      parts.push(
        goals.length || lifestyle.length
          ? "You chose overall foundation with focused add-ons — PACKS ABC leads, then a light targeted layer."
          : "You chose overall foundation — PACKS ABC (antiox, balancing, cleansing) is your daily base."
      );
    } else if (approach === "both") {
      parts.push("Foundation plus targeted — PACKS ABC underneath, then capsules and BEYOND matched to your goals and lifestyle notes.");
    } else {
      parts.push("Targeted support — matched from your wellbeing preferences and day-to-day notes.");
    }
    const goalLine = {
      immune: "Immune resilience sits high on your inside shortlist.",
      gut: "Gut comfort and digestion lead the targeted layer.",
      gutMicro: "Gut comfort and digestion lead the targeted layer.",
      gutFibre: "Gut comfort and digestion lead the targeted layer.",
      focus: "Focus and mental clarity called cognitive support to the front.",
      mood: "Calm and emotional balance sit at the center of your inside routine.",
      joints: "Joints and easy movement shape your mobility picks.",
      beauty: "Beauty from within means skin, hair and nails get a dedicated seat.",
      energy: "Steady everyday energy is covered by balancing greens in the foundation.",
      longevity: "Long-game vitality points to cellular renewal support.",
    };
    const first = goals.find((g) => goalLine[g]);
    if (first) parts.push(goalLine[first]);
    else if (lifestyle.includes("stressed") || lifestyle.includes("darkerMonths")) {
      parts.push("Your lifestyle notes pointed to stress or darker-month support.");
    } else if (lifestyle.includes("lowFish") || lifestyle.includes("plantHeavy")) {
      parts.push("A plant-forward or low-fish diet put plant omega-3 on the list.");
    }
    if (depth === "lean") parts.push("You asked for lean, so the inside shortlist stays tight.");
  }

  if (ans.intent === "curious") {
    parts.push("Since you're learning, treat this as a map — not a mandate to buy everything.");
  }

  return parts.slice(0, 4).join(" ");
}

export function countUniqueProducts(face, body, supp) {
  const ids = new Set();
  const add = (list) => (list || []).forEach((p) => ids.add(p.id));
  if (face) {
    add(face.am);
    add(face.pm);
    add(face.weekly);
  }
  add(body);
  if (supp) {
    add(supp.daily);
    add(supp.targeted);
  }
  return ids.size;
}

export function formatMatchSummary(summary, hero, playbook, quizUrl) {
  // Legacy alias — prefer formatTextBrief from lib/share.js
  const lines = [
    "My Fresh Match — Ringana with Taylor",
    summary ? `Profile: ${summary}` : null,
    "",
    "Start here:",
    ...(hero?.items || []).map((p, i) => `${i + 1}. ${p.name}`),
  ];
  if (playbook?.addNext?.length) {
    lines.push("", "Add next:", ...playbook.addNext.map((p) => `• ${p.name}`));
  }
  if (playbook?.week1?.length) {
    lines.push("", "Week 1:", ...playbook.week1.map((line) => `• ${line}`));
  }
  lines.push(
    "",
    "This is just a recommendation, not a prescription. Please check it with Taylor before you order.",
    "Educational match only — not medical advice.",
    quizUrl ? `Open match: ${quizUrl}` : null
  );
  return lines.filter((l) => l !== null).join("\n");
}
