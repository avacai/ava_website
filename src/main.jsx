import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  Box,
  Brush,
  Cuboid,
  Layers3,
  Mail,
  MousePointer2,
  Palette,
  PenTool,
  Sparkles,
} from "lucide-react";
import * as THREE from "three";
import "./styles.css";

const projects = [
  {
    title: "Drawing Archive",
    year: "2025",
    discipline: "Drawing",
    description:
      "Character studies, gestural line work, and atmosphere sketches built around texture, silhouette, and mood.",
    tags: ["pencil", "ink", "visual systems"],
    accent: "#ff6f61",
  },
  {
    title: "Material Playground",
    year: "2025",
    discipline: "3D",
    description:
      "Small 3D scenes and object studies exploring soft lighting, shiny surfaces, tactile forms, and interface-ready assets.",
    tags: ["three.js", "blender", "motion"],
    accent: "#26a69a",
  },
  {
    title: "Interface Studies",
    year: "2024",
    discipline: "UI/UX",
    description:
      "Product screens, interaction flows, and visual systems for tools that need to feel clear, lively, and easy to navigate.",
    tags: ["prototyping", "systems", "research"],
    accent: "#f5c542",
  },
  {
    title: "Hybrid Experiments",
    year: "2024",
    discipline: "Art Direction",
    description:
      "Web sketches combining illustration, simple 3D, and editorial pacing for portfolio moments and playful storytelling.",
    tags: ["web", "identity", "interaction"],
    accent: "#6c8cff",
  },
];

const abilities = [
  { icon: Brush, label: "Drawing", text: "expressive marks, character, texture" },
  { icon: Cuboid, label: "3D", text: "objects, spatial scenes, lighting" },
  { icon: MousePointer2, label: "UI/UX", text: "flows, prototypes, polished screens" },
  { icon: Layers3, label: "Systems", text: "visual language across media" },
];

function StudioScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.45, 7.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const keyLight = new THREE.DirectionalLight("#fff7e8", 3.6);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);
    scene.add(new THREE.AmbientLight("#b9d9ff", 1.4));

    const group = new THREE.Group();
    scene.add(group);

    const matClay = new THREE.MeshStandardMaterial({
      color: "#ff785f",
      roughness: 0.47,
      metalness: 0.08,
    });
    const matInk = new THREE.MeshStandardMaterial({
      color: "#191919",
      roughness: 0.7,
    });
    const matTeal = new THREE.MeshStandardMaterial({
      color: "#2eb7a6",
      roughness: 0.36,
      metalness: 0.15,
    });
    const matPaper = new THREE.MeshStandardMaterial({
      color: "#f8f0dc",
      roughness: 0.92,
    });
    const matGold = new THREE.MeshStandardMaterial({
      color: "#f8c746",
      roughness: 0.28,
      metalness: 0.18,
    });

    const torus = new THREE.Mesh(new THREE.TorusKnotGeometry(0.92, 0.23, 120, 14), matClay);
    torus.position.set(0.15, 0.2, 0);
    group.add(torus);

    const tablet = new THREE.Mesh(new THREE.BoxGeometry(2.9, 1.9, 0.12), matPaper);
    tablet.position.set(-1.15, -0.85, -0.25);
    tablet.rotation.set(-0.25, -0.25, 0.17);
    group.add(tablet);

    const cube = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.95, 0.95), matTeal);
    cube.position.set(1.55, -0.75, 0.25);
    cube.rotation.set(0.3, 0.4, -0.18);
    group.add(cube);

    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 24), matGold);
    sphere.position.set(-1.85, 0.95, 0.2);
    group.add(sphere);

    const pen = new THREE.Group();
    const penBody = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 18), matInk);
    penBody.rotation.z = Math.PI / 2.8;
    const nib = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.22, 18), matGold);
    nib.position.set(0.91, -0.42, 0);
    nib.rotation.z = -Math.PI / 5;
    pen.add(penBody, nib);
    pen.position.set(0.4, -1.28, 0.55);
    group.add(pen);

    const strokeMat = new THREE.LineBasicMaterial({ color: "#191919", linewidth: 2 });
    for (let i = 0; i < 4; i += 1) {
      const points = [];
      for (let j = 0; j < 40; j += 1) {
        const x = -2.25 + j * 0.09;
        const y = 1.55 + Math.sin(j * 0.38 + i) * 0.1 + i * 0.14;
        points.push(new THREE.Vector3(x, y, -0.35));
      }
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), strokeMat));
    }

    const particles = [];
    const particleGeo = new THREE.IcosahedronGeometry(0.055, 0);
    const particleMats = [matClay, matTeal, matGold, matInk];
    for (let i = 0; i < 34; i += 1) {
      const dot = new THREE.Mesh(particleGeo, particleMats[i % particleMats.length]);
      dot.position.set(
        (Math.random() - 0.5) * 5.4,
        (Math.random() - 0.5) * 3.5,
        (Math.random() - 0.5) * 1.4
      );
      dot.userData.speed = 0.4 + Math.random() * 0.8;
      particles.push(dot);
      group.add(dot);
    }

    let pointerX = 0;
    let pointerY = 0;
    const handlePointer = (event) => {
      const rect = mount.getBoundingClientRect();
      pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.5;
      pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 0.5;
    };

    const resize = () => {
      const width = mount.clientWidth || 640;
      const height = mount.clientHeight || 520;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", resize);
    mount.addEventListener("pointermove", handlePointer);
    resize();

    let frame = 0;
    let animationId = 0;
    const animate = () => {
      frame += 0.01;
      group.rotation.y += (pointerX - group.rotation.y) * 0.04;
      group.rotation.x += (-pointerY - group.rotation.x) * 0.04;
      torus.rotation.x += 0.007;
      torus.rotation.y += 0.011;
      cube.rotation.x -= 0.005;
      cube.rotation.y += 0.008;
      sphere.position.y = 0.95 + Math.sin(frame * 2.2) * 0.08;
      particles.forEach((dot, index) => {
        dot.position.y += Math.sin(frame * dot.userData.speed + index) * 0.0015;
        dot.rotation.x += 0.01;
        dot.rotation.y += 0.006;
      });
      renderer.render(scene, camera);
      animationId = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      mount.removeEventListener("pointermove", handlePointer);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="studio-scene" ref={mountRef} aria-hidden="true" />;
}

function ProjectCard({ project, index, active, onSelect }) {
  return (
    <button
      className={`project-card ${active ? "is-active" : ""}`}
      style={{ "--accent": project.accent }}
      onClick={() => onSelect(index)}
    >
      <span className="project-card__meta">
        {project.discipline} / {project.year}
      </span>
      <span className="project-card__title">{project.title}</span>
      <span className="project-card__text">{project.description}</span>
      <span className="tag-row">
        {project.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </span>
    </button>
  );
}

function VisualPanel({ activeProject }) {
  const rings = useMemo(() => Array.from({ length: 7 }, (_, index) => index), []);

  return (
    <div className="visual-panel" style={{ "--accent": activeProject.accent }}>
      <div className="visual-panel__top">
        <span>{activeProject.discipline}</span>
        <ArrowUpRight size={18} />
      </div>
      <div className="art-board">
        <div className="wire-cube">
          {rings.map((ring) => (
            <i key={ring} style={{ "--i": ring }} />
          ))}
        </div>
        <svg className="gesture-lines" viewBox="0 0 420 260" role="img" aria-label="Abstract drawing preview">
          <path d="M54 183C97 76 145 53 191 100c62 64 118-79 182-5" />
          <path d="M88 204c78-27 126-48 176-19 40 24 82 17 112-20" />
          <path d="M121 72c54 6 84 35 92 88" />
        </svg>
        <div className="screen-stack">
          <span />
          <span />
          <span />
        </div>
      </div>
      <p>{activeProject.description}</p>
    </div>
  );
}

function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeProject = projects[activeIndex];

  return (
    <main>
      <nav className="nav" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="Ava Caii home">
          <Sparkles size={18} />
          Ava Caii
        </a>
        <div>
          <a href="#work">Work</a>
          <a href="#skills">Skills</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>

      <section className="hero" id="top">
        <div className="hero__copy">
          <p className="eyebrow">Drawing / 3D / UIUX</p>
          <h1>A visual designer building playful worlds, useful interfaces, and tactile digital objects.</h1>
          <p>
            I combine hand-drawn image making, spatial experiments, and product thinking to make portfolio pieces,
            interactive scenes, and UI systems that feel personal without losing clarity.
          </p>
          <div className="hero__actions">
            <a className="button button--primary" href="#work">
              <Palette size={18} />
              View work
            </a>
            <a className="button" href="mailto:hello@avacaii.com">
              <Mail size={18} />
              Contact
            </a>
          </div>
        </div>
        <StudioScene />
      </section>

      <section className="ticker" aria-label="Core creative practices">
        <span>sketch</span>
        <span>model</span>
        <span>prototype</span>
        <span>animate</span>
        <span>ship</span>
      </section>

      <section className="section work-section" id="work">
        <div className="section-heading">
          <p className="eyebrow">Selected Work</p>
          <h2>One portfolio, three strengths.</h2>
        </div>
        <div className="work-grid">
          <div className="project-list">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.title}
                project={project}
                index={index}
                active={activeIndex === index}
                onSelect={setActiveIndex}
              />
            ))}
          </div>
          <VisualPanel activeProject={activeProject} />
        </div>
      </section>

      <section className="section skills-section" id="skills">
        <div className="section-heading">
          <p className="eyebrow">Practice</p>
          <h2>Designed for a portfolio that can keep growing.</h2>
        </div>
        <div className="ability-grid">
          {abilities.map(({ icon: Icon, label, text }) => (
            <article className="ability" key={label}>
              <Icon size={22} />
              <h3>{label}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="contact" id="contact">
        <div>
          <p className="eyebrow">Now</p>
          <h2>Available for visual design, 3D web scenes, and UI/UX projects.</h2>
        </div>
        <a className="button button--primary" href="mailto:hello@avacaii.com">
          <Mail size={18} />
          hello@avacaii.com
        </a>
      </section>

      <footer>
        <span>Ava Caii</span>
        <span>Built with React + Three.js</span>
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
