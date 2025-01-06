# Scene Generator

A **scene generator** for novel-writing, featuring:

- Weighted random picks for pacing, emotional intensity, structure, conflict, and viewpoint.
- A user-defined **location** list you can add to on the fly.
- A **5-stage story arc** (Exposition, Rising Action, Climax, Falling Action, Resolution).
- Basic **penalty logic** to reduce repeated elements in consecutive scenes.
- **CSV export** of generated scenes.

---

## Table of Contents

1. [Live Demo](#live-demo)
2. [Features](#features)
3. [Usage](#usage)
   - [Local Use](#local-use)
   - [GitHub Pages](#github-pages)
4. [Repository Structure](#repository-structure)
5. [How to Contribute](#how-to-contribute)
6. [License](#license)

---

## Live Demo

You can access the app at:

**[GitHub Pages URL](https://lesley-byte.github.io/scene-generator/)**

---

## Features

- **Weighted Random Generation:**  
  Each scene gets random pacing, emotional intensity, structure pattern, conflict, location, and viewpoint. Weights influence how often each appears.

- **User-Defined Locations:**  
  You can add any number of locations to local storage, which persist between sessions.

- **Toggleable Viewpoints:**  
  Certain viewpoints (e.g. _Antagonist_, _Neutral Observer_) can be turned on/off, while **Protagonist** is always included.

- **First Scene “Hook” Logic:**  
  The first scene heavily weights “In Medias Res” and disallows “Low” emotional intensity for a strong opening hook.

- **Penalty Logic:**  
  If a scene uses certain attributes, the probability of repeating them in the next scene is reduced.

- **5-Stage Story Arc (Optional Weighting):**  
  Scenes are labeled Exposition, Rising Action, Climax, Falling Action, or Resolution based on their index in the overall story.

- **CSV Export:**  
  Easily download the list of generated scenes and attributes for offline use or further editing.

---

## Usage

### Local Use

1. **Clone or Download** this repository:
   or click “Code → Download ZIP” on the repository page.

2. **Open** `index.html` in your web browser.

   - If you have a local server, place the files in your `htdocs` or similar folder and navigate to `http://localhost/path/to/index.html`.

3. **Add Locations & Generate Scenes**
   - Enter how many scenes you want, click **Generate Scenes**.
   - Add or remove locations as you please.
   - **Save to CSV** to download your results.

### GitHub Pages

1. **Enable GitHub Pages** in your repository settings.
2. **Set** the branch to `main` (and folder to root if you have all files in the root).
3. **Visit** the published URL:
   ```
   https://<your-username>.github.io/<repo-name>/
   ```
4. The page should work just like your local version, allowing you to generate scenes from anywhere.

---

## Repository Structure

```
scene-generator/
│
├─ index.html
├─ README.md           // You're reading this file
├─ assets/
│   └─ js/
│       └─ script.js   // Core logic: weighting, penalty, random picks
│
└─ (optional) other files (e.g. custom CSS, images)
```

---

## How to Contribute

1. **Fork** this repository.
2. **Create a new branch** for your feature/fix (`git checkout -b feature-new-idea`).
3. **Make changes**, commit (`git commit -m "Description"`), and push (`git push origin feature-new-idea`).
4. **Open a Pull Request** on GitHub describing your changes, so we can discuss/merge them.

Feel free to suggest new features, fix bugs, or improve the UI/UX.

---

## License

This project is released under the [MIT License](LICENSE). You’re free to use, modify, and distribute this code as long as you include the original license.
