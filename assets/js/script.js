/*******************************************************
 * script.js
 *
 * Demonstrates:
 * - User-defined locations
 * - Toggleable viewpoints (always include Protagonist with higher weight)
 * - First scene hook logic
 ******************************************************/

// ---------------------
// 1) Base Data
// ---------------------
const pacingOptionsBase = [
  { label: "Slow", weight: 2 },
  { label: "Moderate", weight: 3 },
  { label: "Fast", weight: 1 },
];

const emotionalIntensityOptionsBase = [
  { label: "Low", weight: 2 },
  { label: "Medium", weight: 3 },
  { label: "High", weight: 1 },
];

const structureMap = {
  "Scene & Sequel":
    "A classic structure: The character aims for something, meets conflict, and processes the outcome.",
  "In Medias Res":
    "Opening in the middle of the action to immediately engage the reader.",
  "Micro-Tension Focus":
    "Building small, continuous questions or mysteries that maintain reader interest.",
  "Circular Bookends":
    "Starting and ending with mirrored images or situations to create a sense of completeness.",
};

const structuralPatternOptionsBase = [
  {
    label: "Scene & Sequel",
    weight: 3,
    explanation: structureMap["Scene & Sequel"],
  },
  {
    label: "In Medias Res",
    weight: 2,
    explanation: structureMap["In Medias Res"],
  },
  {
    label: "Micro-Tension Focus",
    weight: 2,
    explanation: structureMap["Micro-Tension Focus"],
  },
  {
    label: "Circular Bookends",
    weight: 1,
    explanation: structureMap["Circular Bookends"],
  },
];

// Note we won't define viewpointOptionsBase directly.
// Instead, we’ll build it dynamically based on user toggles below.

// Example conflicts
const conflictOptionsBase = [
  { label: "Internal Doubt", weight: 2 },
  { label: "A Rival Appears", weight: 3 },
  { label: "Mystery Revelation", weight: 2 },
  { label: "Physical Battle", weight: 1 },
  { label: "Moral Dilemma", weight: 2 },
  { label: "Natural Disaster", weight: 1 },
  { label: "Betrayal", weight: 2 },
  { label: "Unexpected Romance", weight: 1 },
  { label: "Secret Exposed", weight: 2 },
  { label: "Life-Threatening Situation", weight: 1 },
  { label: "Time Pressure/Deadline", weight: 2 },
  { label: "Social/Political Upheaval", weight: 1 },
];

// We'll also keep an array for user-defined locations
let locationOptionsBase = []; // loaded from localStorage or empty if none

// This object will hold the "last scene" to apply penalty logic
let lastScene = {
  pacing: null,
  emotionalIntensity: null,
  structure: null,
  structureExplanation: null,
  location: null,
  conflict: null,
  viewpoint: null,
};

// 5-stage story arc with cumulative limits
// (feel free to adjust these as needed)

const storyStages = [
  { name: "Exposition", limit: 0.15 }, // 0–15%
  { name: "Rising Action", limit: 0.45 }, // 15–45%
  { name: "Climax", limit: 0.55 }, // 45–55%
  { name: "Falling Action", limit: 0.8 }, // 55–80%
  { name: "Resolution", limit: 1.0 }, // 80–100%
];

// Helper to figure out which stage a scene belongs to

function getArcStage5(sceneIndex, totalScenes) {
  // sceneIndex is 0-based
  const pct = (sceneIndex + 1) / totalScenes; // fraction from 0 to 1

  for (const stage of storyStages) {
    if (pct <= stage.limit) {
      return stage.name;
    }
  }
  // fallback (shouldn't happen if limit=1.0 for the last)
  return storyStages[storyStages.length - 1].name;
}
// ---------------------
// 2) Local Storage for Locations and Scenes
// ---------------------
function loadLocationsFromLocalStorage() {
  const data = localStorage.getItem("userLocations");
  return data ? JSON.parse(data) : [];
}
function saveLocationsToLocalStorage(locations) {
  localStorage.setItem("userLocations", JSON.stringify(locations));
}

function saveScenesToLocalStorage(scenes) {
  localStorage.setItem("generatedScenes", JSON.stringify(scenes));
}
function loadScenesFromLocalStorage() {
  const data = localStorage.getItem("generatedScenes");
  return data ? JSON.parse(data) : [];
}
function clearLocalStorage() {
  localStorage.removeItem("generatedScenes");
}

// ---------------------
// 3) Penalty Logic
// ---------------------
function applyPenalty(optionsArray, lastUsedLabel, penaltyAmount = 1) {
  if (!lastUsedLabel) return;
  for (let option of optionsArray) {
    // If the option is an object with a label property
    if (option.label === lastUsedLabel) {
      option.weight = Math.max(option.weight - penaltyAmount, 0);
    }
  }
}

// ---------------------
// 4) Weighted Random
// ---------------------
function getWeightedRandom(options) {
  let totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
  // Edge case: if totalWeight <= 0, just pick first
  if (totalWeight <= 0) {
    return { label: options[0].label };
  }

  let randomNum = Math.random() * totalWeight;
  for (const opt of options) {
    if (randomNum < opt.weight) {
      return opt.explanation
        ? { label: opt.label, explanation: opt.explanation }
        : { label: opt.label };
    }
    randomNum -= opt.weight;
  }

  // Fallback
  return { label: options[0].label };
}

// ---------------------
// 5) Build Viewpoint List Based on User Toggles
// ---------------------
function buildViewpointOptions() {
  // Protagonist is always included, with a higher weight, e.g. 4
  const viewpoints = [{ label: "Protagonist", weight: 4 }];

  // Check toggles for other viewpoints
  const antagonistCheck = document.getElementById("viewAntagonist");
  const supportingAllyCheck = document.getElementById("viewSupportingAlly");
  const neutralObserverCheck = document.getElementById("viewNeutralObserver");

  if (antagonistCheck && antagonistCheck.checked) {
    viewpoints.push({ label: "Antagonist", weight: 1 });
  }
  if (supportingAllyCheck && supportingAllyCheck.checked) {
    viewpoints.push({ label: "Supporting Ally", weight: 2 });
  }
  if (neutralObserverCheck && neutralObserverCheck.checked) {
    viewpoints.push({ label: "Neutral Observer", weight: 1 });
  }

  return viewpoints;
}

// ---------------------
// 6) Reset Weights (including viewpoints & locations)
// ---------------------
let pacingOptions, emotionalIntensityOptions, structuralPatternOptions;
let conflictOptions, viewpointOptions;
let locationOptions;

function resetWeights() {
  // Clone each base array so we don't mutate the original
  pacingOptions = JSON.parse(JSON.stringify(pacingOptionsBase));
  emotionalIntensityOptions = JSON.parse(
    JSON.stringify(emotionalIntensityOptionsBase)
  );
  structuralPatternOptions = JSON.parse(
    JSON.stringify(structuralPatternOptionsBase)
  );
  conflictOptions = JSON.parse(JSON.stringify(conflictOptionsBase));

  // Rebuild viewpoint options from toggles each time
  viewpointOptions = buildViewpointOptions();

  // Re-load user-defined locations from localStorage
  const storedLocations = loadLocationsFromLocalStorage();
  locationOptionsBase = storedLocations.map((loc) => {
    return {
      label: loc.label,
      weight: loc.weight !== undefined ? loc.weight : 2,
    };
  });
  locationOptions = JSON.parse(JSON.stringify(locationOptionsBase));
}

// ---------------------
// 7) Special First Scene Logic
// ---------------------
function generateFirstScene() {
  resetWeights();

  // Heavily weight "In Medias Res"
  for (let s of structuralPatternOptions) {
    if (s.label === "In Medias Res") {
      s.weight *= 5;
    }
  }

  // Remove "Low" emotional intensity by setting weight = 0
  for (let e of emotionalIntensityOptions) {
    if (e.label === "Low") {
      e.weight = 0;
    }
  }

  // If no locations are set, use default
  if (locationOptions.length === 0) {
    locationOptions = [{ label: "Default Starting Point", weight: 2 }];
  }

  // Pick each attribute
  const pacingPick = getWeightedRandom(pacingOptions).label;
  const intensityPick = getWeightedRandom(emotionalIntensityOptions).label;
  const structurePick = getWeightedRandom(structuralPatternOptions);
  const locationPick = getWeightedRandom(locationOptions).label;
  const conflictPick = getWeightedRandom(conflictOptions).label;
  const viewpointPick = getWeightedRandom(viewpointOptions).label;

  lastScene = {
    pacing: pacingPick,
    emotionalIntensity: intensityPick,
    structure: structurePick.label,
    structureExplanation: structurePick.explanation,
    location: locationPick,
    conflict: conflictPick,
    viewpoint: viewpointPick,
  };
  return lastScene;
}

// ---------------------
// 8) Generate Subsequent Scene
// ---------------------
function generateSubsequentScene() {
  resetWeights();

  applyPenalty(pacingOptions, lastScene.pacing);
  applyPenalty(emotionalIntensityOptions, lastScene.emotionalIntensity);
  applyPenalty(structuralPatternOptions, lastScene.structure);
  applyPenalty(locationOptions, lastScene.location);
  applyPenalty(conflictOptions, lastScene.conflict);
  applyPenalty(viewpointOptions, lastScene.viewpoint);

  if (locationOptions.length === 0) {
    locationOptions = [{ label: "Default Location", weight: 2 }];
  }

  const pacingPick = getWeightedRandom(pacingOptions).label;
  const intensityPick = getWeightedRandom(emotionalIntensityOptions).label;
  const structurePick = getWeightedRandom(structuralPatternOptions);
  const locationPick = getWeightedRandom(locationOptions).label;
  const conflictPick = getWeightedRandom(conflictOptions).label;
  const viewpointPick = getWeightedRandom(viewpointOptions).label;

  lastScene = {
    pacing: pacingPick,
    emotionalIntensity: intensityPick,
    structure: structurePick.label,
    structureExplanation: structurePick.explanation,
    location: locationPick,
    conflict: conflictPick,
    viewpoint: viewpointPick,
  };
  return lastScene;
}

// ---------------------
// 9) Generate Scenes (entry point)
// ---------------------
function generateScenes(num) {
  const scenes = [];
  for (let i = 0; i < num; i++) {
    let scene;
    if (i === 0) {
      scene = generateFirstScene();
    } else {
      scene = generateSubsequentScene();
    }

    // 1) Determine which stage this scene belongs to
    const stageName = getArcStage5(i, num);
    scene.arcStage = stageName;

    // 2) (Optional) Apply stage-based overrides
    // This modifies pacing, conflict, etc. based on the stage
    scene = applyStageWeighting(scene);

    // Push to array
    scenes.push(scene);
  }
  return scenes;
}

// ---------------------
// 9.1) Apply Stage Weighting
// ---------------------
function applyStageWeighting(scene) {
  // Example logic to modify scene attributes based on the arc stage
  switch (scene.arcStage) {
    case "Exposition":
      scene.pacing = "Slow";
      break;
    case "Rising Action":
      scene.conflict = "A Rival Appears";
      break;
    case "Climax":
      scene.emotionalIntensity = "High";
      break;
    case "Falling Action":
      scene.pacing = "Moderate";
      break;
    case "Resolution":
      scene.conflict = "Internal Doubt";
      break;
    default:
      break;
  }
  return scene;
}

// ---------------------
// 10) Render Scenes
// ---------------------
function renderScenes(scenes) {
  const sceneList = document.getElementById("sceneList");
  if (!sceneList) return;

  sceneList.innerHTML = "";
  scenes.forEach((scene, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="card mb-3 shadow-sm">
        <div class="card-body">
          <h5 class="card-title">Scene ${index + 1}</h5>

          <p class="card-text mb-1">
            <strong>Arc Stage:</strong> ${scene.arcStage || ""}
          </p>
          <p class="card-text mb-1">
            <strong>Pacing:</strong> ${scene.pacing}
          </p>
          <p class="card-text mb-1">
            <strong>Emotional Intensity:</strong> ${scene.emotionalIntensity}
          </p>
          <p class="card-text mb-1">
            <strong>Structure:</strong> ${scene.structure}
            <br/>
            <em>${scene.structureExplanation || ""}</em>
          </p>
          <p class="card-text mb-1">
            <strong>Location:</strong> ${scene.location}
          </p>
          <p class="card-text mb-1">
            <strong>Conflict:</strong> ${scene.conflict}
          </p>
          <p class="card-text mb-0">
            <strong>Viewpoint:</strong> ${scene.viewpoint}
          </p>
        </div>
      </div>
    `;
    sceneList.appendChild(li);
  });
}

// ---------------------
// 11) CSV Export
// ---------------------
function scenesToCsv(scenes) {
  if (!scenes.length) return "";

  const headers = Object.keys(scenes[0]);
  const csvRows = [headers.join(",")];
  for (let s of scenes) {
    const row = headers.map((h) => {
      let val = s[h] || "";
      val = ("" + val).replace(/"/g, '""');
      return `"${val}"`;
    });
    csvRows.push(row.join(","));
  }
  return csvRows.join("\n");
}

function downloadCsv(filename, csvData) {
  const blob = new Blob([csvData], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// ---------------------
// 12) Handle DOM Loaded
// ---------------------
window.addEventListener("DOMContentLoaded", () => {
  // Load any existing scenes
  const storedScenes = loadScenesFromLocalStorage();
  if (storedScenes.length > 0) {
    lastScene = storedScenes[storedScenes.length - 1];
    renderScenes(storedScenes);
  }

  // Render the user location list
  renderLocationList();

  // Add location event
  const addLocationBtn = document.getElementById("addLocationBtn");
  if (addLocationBtn) {
    addLocationBtn.addEventListener("click", () => {
      const locInput = document.getElementById("locationInput");
      const locValue = locInput.value.trim();
      if (!locValue) {
        alert("Please enter a location name.");
        return;
      }
      const locations = loadLocationsFromLocalStorage();
      locations.push({ label: locValue, weight: 2 });
      saveLocationsToLocalStorage(locations);
      locInput.value = "";
      renderLocationList();
    });
  }

  // Generate Scenes button
  const generateBtn = document.getElementById("generateBtn");
  if (generateBtn) {
    generateBtn.addEventListener("click", () => {
      const numScenesInput = document.getElementById("numScenes");
      const numScenes = parseInt(numScenesInput.value, 10);
      if (isNaN(numScenes) || numScenes < 1) {
        alert("Please enter a valid number of scenes.");
        return;
      }

      // Reset lastScene before new batch
      lastScene = {
        pacing: null,
        emotionalIntensity: null,
        structure: null,
        structureExplanation: null,
        location: null,
        conflict: null,
        viewpoint: null,
      };

      const newScenes = generateScenes(numScenes);
      saveScenesToLocalStorage(newScenes);
      renderScenes(newScenes);
    });
  }

  // Clear Data button
  const clearDataBtn = document.getElementById("clearDataBtn");
  if (clearDataBtn) {
    clearDataBtn.addEventListener("click", () => {
      clearLocalStorage();
      const sceneList = document.getElementById("sceneList");
      if (sceneList) {
        sceneList.innerHTML = "";
      }
      lastScene = {
        pacing: null,
        emotionalIntensity: null,
        structure: null,
        structureExplanation: null,
        location: null,
        conflict: null,
        viewpoint: null,
      };
      alert("All scene data cleared.");
    });
  }

  // Save to CSV button
  const exportCsvBtn = document.getElementById("exportCsvBtn");
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener("click", () => {
      const scenes = loadScenesFromLocalStorage();
      if (!scenes || !scenes.length) {
        alert("No scenes to export. Generate scenes first!");
        return;
      }
      const csvContent = scenesToCsv(scenes);
      downloadCsv("generated_scenes.csv", csvContent);
    });
  }
});

// ---------------------
// 13) Render User Location List + Remove
// ---------------------
function renderLocationList() {
  const locationList = document.getElementById("locationList");
  if (!locationList) return;
  locationList.innerHTML = "";

  const locations = loadLocationsFromLocalStorage();
  if (!locations.length) {
    locationList.innerHTML =
      '<li class="text-muted">No locations added yet.</li>';
    return;
  }

  locations.forEach((loc, idx) => {
    const li = document.createElement("li");
    li.className = "mb-1";
    li.innerHTML = `
      <span>${loc.label}</span>
      <button class="btn btn-sm btn-danger ms-2" onclick="removeLocation(${idx})">
        Remove
      </button>
    `;
    locationList.appendChild(li);
  });
}

function removeLocation(index) {
  const locations = loadLocationsFromLocalStorage();
  locations.splice(index, 1);
  saveLocationsToLocalStorage(locations);
  renderLocationList();
}
