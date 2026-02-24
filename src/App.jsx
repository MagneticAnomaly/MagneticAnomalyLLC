import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Ring, Icosahedron, Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Terminal, Smartphone, Lock, Activity, Shield, ArrowRight, XSquare, MessageSquare } from 'lucide-react';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

/** ====== WEBGL BACKGROUND ====== */
function AsteroidField({ count = 150 }) {
  const meshRef = useRef();
  const dummy = new THREE.Object3D();
  const particles = React.useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 800;
      const y = (Math.random() - 0.5) * 400;
      const z = (Math.random() - 0.5) * 800;
      const scale = Math.random() * 0.8 + 0.1;
      temp.push({ x, y, z, scale });
    }
    return temp;
  }, [count]);

  useFrame(() => {
    particles.forEach((particle, i) => {
      dummy.position.set(particle.x, particle.y, particle.z);
      dummy.scale.set(particle.scale, particle.scale, particle.scale);
      dummy.rotation.x += 0.001;
      dummy.rotation.y += 0.002;
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#8B949E" wireframe transparent opacity={0.3} />
    </instancedMesh>
  );
}

function SaturnRings({ ringMap }) {
  const meshRef = useRef();

  useEffect(() => {
    if (meshRef.current) {
      const geometry = meshRef.current.geometry;
      const pos = geometry.attributes.position;
      const v3 = new THREE.Vector3();
      const uvs = [];
      for (let i = 0; i < pos.count; i++) {
        v3.fromBufferAttribute(pos, i);
        // Radius of this vertex (distance from center)
        const radius = v3.length();
        // Map radius from innerRadius(18) to outerRadius(42)  => U coordinate from 0 to 1
        const u = (radius - 18) / (42 - 18);
        uvs.push(u, 0); // V doesn't matter
      }
      geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    }
  }, []);

  return (
    <Ring ref={meshRef} args={[18, 42, 128]} rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial
        map={ringMap}
        color="#E58D57"
        transparent
        alphaMap={ringMap}
        alphaTest={0.01}
        side={THREE.DoubleSide}
        roughness={0.4}
      />
    </Ring>
  );
}

function SaturnScene() {
  const groupRef = useRef();
  const saturnRef = useRef();
  const enceladusRef = useRef();
  const ceresRef = useRef();
  const makemakeRef = useRef();

  // Load standard solar system textures
  const [saturnMap, ceresMap, makemakeMap, ringMap, milkyWayMap] = useTexture([
    '/textures/saturn.jpg',
    '/textures/ceres.jpg',
    '/textures/2k_makemake_fictional.jpg',
    '/textures/2k_saturn_ring_alpha.png',
    '/textures/2k_stars_milky_way.jpg'
  ]);

  useFrame((state) => {
    if (saturnRef.current) {
      saturnRef.current.rotation.y += 0.001; // Only rotate around Y axis (day/night)
    }
    if (enceladusRef.current) {
      enceladusRef.current.rotation.y -= 0.005;
    }
    if (ceresRef.current) {
      ceresRef.current.rotation.y += 0.005;
    }
    if (makemakeRef.current) {
      makemakeRef.current.rotation.y += 0.002;
      makemakeRef.current.rotation.x += 0.001;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Normalized ambient light to balance textures */}
      <ambientLight intensity={0.4} />
      {/* Front lighting 180 degrees from dark side, balanced */}
      <directionalLight position={[10, 10, 40]} intensity={1.8} color="#FFEAC2" />
      <directionalLight position={[-20, -5, -10]} intensity={0.5} color="#F8F9FA" />

      {/* Saturn Group */}
      <group position={[-15, 0, -45]}>
        {/* Tilted Axis Group for alignment */}
        <group rotation={[Math.PI / 12, 0, Math.PI / 12]}>
          <Sphere ref={saturnRef} args={[16, 64, 64]}>
            <meshStandardMaterial
              map={saturnMap}
              roughness={0.9}
              metalness={0.1}
            />
          </Sphere>

          <SaturnRings ringMap={ringMap} />
        </group>
      </group>

      {/* Hero Moon (Enceladus) */}
      <Sphere ref={enceladusRef} args={[2.5, 32, 32]} position={[-40, -5, 405]}>
        <meshStandardMaterial
          map={ceresMap}
          color="#ECECEC"
          roughness={0.4}
          metalness={0.0}
        />
      </Sphere>

      {/* Ceres */}
      <Sphere ref={ceresRef} args={[3.5, 32, 32]} position={[150, 20, -100]}>
        <meshStandardMaterial
          map={ceresMap}
          color="#DDDDDD"
          roughness={0.2}
          metalness={0.1}
        />
      </Sphere>

      {/* Makemake */}
      <Sphere ref={makemakeRef} args={[5.5, 32, 32]} position={[-150, -30, 50]}>
        <meshStandardMaterial
          map={makemakeMap}
          roughness={0.9}
          metalness={0.0}
        />
      </Sphere>

      <AsteroidField count={1500} />

      {/* Milky Way Skybox */}
      <Sphere args={[2500, 64, 64]}>
        <meshBasicMaterial
          map={milkyWayMap}
          side={THREE.BackSide}
          color="#333333"
        />
      </Sphere>
    </group>
  );
}

const HERO_START_ANGLE = Math.PI * 0.45; // Just a tiny bit off-center
const HERO_END_ANGLE = Math.PI * 0.6; // Rotate the opposite direction
const HERO_RADIUS = 15;
const HERO_CENTER = new THREE.Vector3(-40, -5, 405);

export const globalCamera = {
  pos: new THREE.Vector3(
    HERO_CENTER.x + Math.cos(HERO_START_ANGLE) * HERO_RADIUS,
    HERO_CENTER.y,
    HERO_CENTER.z + Math.sin(HERO_START_ANGLE) * HERO_RADIUS
  ),
  lookAt: HERO_CENTER.clone()
};

function CameraRig() {
  const currentPos = useRef(globalCamera.pos.clone());
  const currentLookAt = useRef(globalCamera.lookAt.clone());

  useFrame((state) => {
    // 1. Base Target
    const targetPos = globalCamera.pos.clone();
    const targetLookAt = globalCamera.lookAt.clone();

    // 2. Very subtle ambient vertical bob
    const time = state.clock.getElapsedTime();
    targetPos.y += Math.sin(time * 0.5) * 2;

    // 3. Mouse parallax (applied gently on top of the orbit)
    const parallaxOffset = new THREE.Vector3(state.pointer.x * 2, state.pointer.y * 2, 0);
    targetPos.add(parallaxOffset);

    // 4. Smooth damp the actual camera position towards the calculated point
    if (state.clock.elapsedTime < 0.2) {
      currentPos.current.copy(targetPos);
      currentLookAt.current.copy(targetLookAt);
    } else {
      currentPos.current.lerp(targetPos, 0.03);
      currentLookAt.current.lerp(targetLookAt, 0.03);
    }

    state.camera.position.copy(currentPos.current);
    state.camera.lookAt(currentLookAt.current);
  });
  return null;
}

/** ====== COMPONENTS ====== */

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 border-b border-white/5 ${scrolled ? 'bg-void/60 backdrop-blur-xl py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <h1 className="font-sans font-bold text-xl tracking-widest text-ice">MAGNETIC ANOMALY</h1>
        <div className="hidden md:flex items-center space-x-8">
          <a href="#payloads" className="font-mono text-sm text-telemetry hover:text-titan transition-colors">PORTFOLIO</a>
          <a href="#manifesto" className="font-mono text-sm text-telemetry hover:text-titan transition-colors">MANIFESTO</a>
          <a href="#commlink" className="font-mono text-sm text-telemetry hover:text-titan transition-colors">CONTACT</a>
          <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <div className="w-2 h-2 rounded-full bg-signal animate-pulse" />
            <span className="font-mono text-xs text-signal tracking-wider">SYSTEM ONLINE</span>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  const container = useRef();

  useGSAP(() => {
    gsap.from(".hero-anim", {
      y: 40,
      opacity: 0,
      duration: 1.5,
      stagger: 0.2,
      ease: "power3.out",
      delay: 0.2
    });
  }, { scope: container });

  return (
    <section id="hero" ref={container} className="relative h-[100dvh] flex items-center justify-center px-6">
      <div className="text-center z-10 max-w-4xl mx-auto mt-20">
        <div className="hero-anim inline-block mb-6 px-4 py-1.5 border border-titan/30 rounded-full bg-titan/10">
          <p className="font-mono text-xs tracking-[0.2em] text-titan">SYSTEM ONLINE</p>
        </div>
        <h2 className="hero-anim font-serif text-6xl md:text-8xl italic text-ice mb-8 leading-tight">We Make Things That<br />Dont Exist Yet.</h2>
        <p className="hero-anim font-mono text-telemetry text-lg md:text-xl max-w-2xl mx-auto">High-fidelity digital experiences and mobile utilities.</p>

        <div className="hero-anim mt-12 cursor-pointer flex items-center justify-center space-x-3 group mx-auto w-fit">
          <div className="w-12 h-12 rounded-full border border-titan flex items-center justify-center group-hover:bg-titan transition-all duration-300">
            <ArrowRight className="text-titan group-hover:text-void w-5 h-5 transition-colors" />
          </div>
          <span className="font-mono text-sm tracking-widest text-titan uppercase">Explore Portfolio</span>
        </div>
      </div>
    </section>
  );
}

function Payloads() {
  const container = useRef();

  return (
    <>
      <div id="gap-to-payloads" className="h-[150vh] pointer-events-none" />
      <section id="payloads" ref={container} className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h3 className="font-mono text-sm tracking-[0.2em] text-titan mb-4">// OUR WORK</h3>
            <h2 className="font-sans font-bold text-4xl md:text-5xl uppercase tracking-wider">Portfolio</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* APP 01 - Tachyon */}
            <div className="payload-card group relative glass-panel rounded-[2rem] p-1 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-titan/50 hover:shadow-[0_0_40px_rgba(229,141,87,0.15)]">
              <div className="absolute inset-0 bg-gradient-to-br from-titan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="h-[300px] w-full bg-[#030305] rounded-[1.75rem] border border-white/5 p-6 relative overflow-hidden flex flex-col font-mono text-xs">
                <div className="flex items-center space-x-2 mb-6 border-b border-white/10 pb-4">
                  <Terminal className="w-4 h-4 text-telemetry" />
                  <span className="text-telemetry">tachyon-cli ~ bash</span>
                </div>
                <div className="space-y-2 text-green-400/80 mt-2">
                  <p>&gt; tachyon init --workspace</p>
                  <p className="text-telemetry animate-pulse">Initializing local environment...</p>
                  <p>&gt; workspace configured at 40.6895° N</p>
                  <p>&gt; loading core modules...</p>
                  <div className="w-2 h-4 bg-titan animate-ping mt-4" />
                </div>
              </div>
              <div className="p-8 pb-4 relative z-10">
                <span className="font-mono text-xs text-telemetry tracking-widest mb-3 block">[ DESKTOP / CLI ]</span>
                <h4 className="font-sans text-2xl font-bold mb-2 text-ice">Tachyon</h4>
                <p className="font-mono text-sm text-telemetry mb-6">Advanced development tooling for engineers.</p>
                <button className="font-mono text-xs bg-white/5 hover:bg-titan hover:text-void text-ice border border-white/10 hover:border-titan px-6 py-3 rounded-full transition-all w-full md:w-auto uppercase tracking-wider">
                  View Details
                </button>
              </div>
            </div>

            {/* APP 02 - Axiom */}
            <div className="payload-card group relative glass-panel rounded-[2rem] p-1 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-titan/50 hover:shadow-[0_0_40px_rgba(229,141,87,0.15)]">
              <div className="h-[300px] w-full bg-[#030305] rounded-[1.75rem] border border-white/5 p-6 flex items-center justify-center relative overflow-hidden">
                {/* App Mockup */}
                <div className="w-[280px] h-full bg-void border-x border-t border-white/10 rounded-t-[2.5rem] p-4 relative translate-y-8 group-hover:translate-y-4 transition-transform duration-700 ease-out shadow-2xl">
                  <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6" />
                  <div className="space-y-4">
                    <div className="h-12 rounded-xl bg-white/5 flex items-center px-4 border border-white/5">
                      <Shield className="w-4 h-4 text-titan mr-3" />
                      <div className="h-2 w-24 bg-white/10 rounded-full" />
                    </div>
                    <div className="h-32 rounded-xl bg-gradient-to-br from-titan/10 to-transparent border border-titan/20 p-4">
                      <Activity className="w-5 h-5 text-signal mb-4" />
                      <div className="space-y-2">
                        <div className="h-2 w-full bg-white/10 rounded-full" />
                        <div className="h-2 w-2/3 bg-white/10 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-8 pb-4 relative z-10">
                <span className="font-mono text-xs text-telemetry tracking-widest mb-3 block">[ iOS / MOBILE ]</span>
                <h4 className="font-sans text-2xl font-bold mb-2 text-ice">Axiom</h4>
                <p className="font-mono text-sm text-telemetry mb-6">Privacy-first mobile utility.</p>
                <button className="font-mono text-xs bg-white/5 hover:bg-titan hover:text-void text-ice border border-white/10 hover:border-titan px-6 py-3 rounded-full transition-all w-full md:w-auto uppercase tracking-wider">
                  View Details
                </button>
              </div>
            </div>

            {/* APP 03 - Project 3 */}
            <div className="payload-card group relative glass-panel rounded-[2rem] p-1 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-titan/50 hover:shadow-[0_0_40px_rgba(229,141,87,0.15)]">
              <div className="h-[300px] w-full bg-[#030305] rounded-[1.75rem] border border-white/5 p-6 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="w-32 h-32 rounded-[2rem] border-2 border-dashed border-titan/30 flex items-center justify-center animate-spin-slow">
                  <div className="w-16 h-16 rounded-full border border-titan/50 group-hover:scale-150 transition-transform duration-700" />
                </div>
                <p className="mt-8 font-mono text-xs tracking-widest text-titan/50 uppercase">Securing Data</p>
              </div>
              <div className="p-8 pb-4 relative z-10">
                <span className="font-mono text-xs text-telemetry tracking-widest mb-3 block">[ iOS / MOBILE ]</span>
                <h4 className="font-sans text-2xl font-bold mb-2 text-ice">Project 3</h4>
                <p className="font-mono text-sm text-telemetry mb-6">Currently in private beta testing.</p>
                <button className="font-mono text-xs text-telemetry border border-white/5 px-6 py-3 rounded-full uppercase tracking-wider w-full md:w-auto cursor-not-allowed opacity-50 flex items-center justify-center">
                  <Lock className="w-3 h-3 mr-2" /> Locked
                </button>
              </div>
            </div>

            {/* APP 04 - Project 4 */}
            <div className="payload-card group relative glass-panel rounded-[2rem] p-1 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-titan/50 hover:shadow-[0_0_40px_rgba(229,141,87,0.15)]">
              <div className="h-[300px] w-full bg-[#030305] rounded-[1.75rem] border border-white/5 p-6 flex flex-col justify-center relative overflow-hidden">
                <div className="space-y-4 opacity-30 px-4">
                  <div className="h-4 w-3/4 bg-telemetry hidden-block" />
                  <div className="h-4 w-full bg-telemetry hidden-block" />
                  <div className="h-4 w-5/6 bg-telemetry hidden-block" />
                  <div className="h-4 w-1/2 bg-telemetry hidden-block" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px]">
                  <div className="font-mono text-4xl text-ice font-bold">T-MINUS</div>
                </div>
              </div>
              <div className="p-8 pb-4 relative z-10">
                <span className="font-mono text-xs text-telemetry tracking-widest mb-3 block">[ iOS / MOBILE ]</span>
                <h4 className="font-sans text-2xl font-bold mb-2 text-ice">Project 4</h4>
                <p className="font-mono text-sm text-telemetry mb-6">Upcoming release.</p>
                <button className="font-mono text-xs text-telemetry border border-white/5 px-6 py-3 rounded-full uppercase tracking-wider w-full md:w-auto cursor-not-allowed opacity-50 flex items-center justify-center">
                  <Lock className="w-3 h-3 mr-2" /> Locked
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}

function Manifesto() {
  const container = useRef();

  useGSAP(() => {
    gsap.from(".manifesto-neutral", {
      scrollTrigger: { trigger: container.current, start: "top 70%" },
      y: 20, opacity: 0, duration: 1
    });
    gsap.from(".manifesto-drama", {
      scrollTrigger: { trigger: container.current, start: "top 60%" },
      y: 40, opacity: 0, duration: 1.5, ease: "power3.out"
    });
  }, { scope: container });

  return (
    <>
      <div id="gap-to-manifesto" className="h-[150vh] pointer-events-none" />
      <section id="manifesto" ref={container} className="min-h-screen relative z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <div className="text-center max-w-5xl mx-auto space-y-12">
          <p className="manifesto-neutral font-mono text-sm md:text-base text-telemetry tracking-widest uppercase">
            Most software is noisy. Bloated. Distracting.
          </p>
          <h2 className="manifesto-drama font-serif text-5xl md:text-7xl lg:text-8xl italic text-titan leading-tight text-shadow-titan">
            We build precise instruments.
          </h2>
        </div>
      </section>
    </>
  );
}

function CommLink() {
  return (
    <>
      <div id="gap-to-commlink" className="h-[150vh] pointer-events-none" />
      <section id="commlink" className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto glass-panel rounded-[3rem] p-8 md:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

            {/* FAQ */}
            <div>
              <div className="mb-12">
                <h3 className="font-mono text-sm tracking-[0.2em] text-titan mb-4">// CONTACT US</h3>
                <h2 className="font-sans font-bold text-3xl md:text-4xl uppercase tracking-wider">Support & Inquiries</h2>
              </div>

              <div className="space-y-6 font-mono text-sm">
                <div className="border border-white/10 rounded-xl p-6 bg-white/5 hover:bg-white/10 transition-colors">
                  <p className="text-titan mb-2 flex items-center"><MessageSquare className="w-4 h-4 mr-2" />&gt; QUERY: How do I restore purchases?</p>
                  <p className="text-telemetry pl-6">Access the settings menu within any app and tap 'Restore Purchases'. Standard App Store authentication is required.</p>
                </div>
                <div className="border border-white/10 rounded-xl p-6 bg-white/5 hover:bg-white/10 transition-colors">
                  <p className="text-titan mb-2 flex items-center"><MessageSquare className="w-4 h-4 mr-2" />&gt; QUERY: Can I access the beta?</p>
                  <p className="text-telemetry pl-6">Beta access is currently restricted. Join our waitlist below.</p>
                </div>
                <div className="border border-white/10 rounded-xl p-6 bg-white/5 hover:bg-white/10 transition-colors">
                  <p className="text-titan mb-2 flex items-center"><MessageSquare className="w-4 h-4 mr-2" />&gt; QUERY: Who builds these tools?</p>
                  <p className="text-telemetry pl-6">Magnetic Anomaly LLC is based in Brooklyn, NY.</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-[#030305] border border-white/5 rounded-[2rem] p-8 font-mono">
              <h4 className="text-ice mb-8 pb-4 border-b border-white/10">Secure Contact Form</h4>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-xs text-telemetry mb-2 tracking-widest uppercase">Email Address</label>
                  <input type="email" className="w-full bg-void border border-white/10 rounded-xl p-4 text-ice focus:border-titan focus:outline-none focus:ring-1 focus:ring-titan transition-all" placeholder="Enter email..." />
                </div>
                <div>
                  <label className="block text-xs text-telemetry mb-2 tracking-widest uppercase">Subject</label>
                  <input type="text" className="w-full bg-void border border-white/10 rounded-xl p-4 text-ice focus:border-titan focus:outline-none focus:ring-1 focus:ring-titan transition-all" placeholder="How can we help?" />
                </div>
                <div>
                  <label className="block text-xs text-telemetry mb-2 tracking-widest uppercase">Message</label>
                  <textarea rows="4" className="w-full bg-void border border-white/10 rounded-xl p-4 text-ice focus:border-titan focus:outline-none focus:ring-1 focus:ring-titan transition-all resize-none" placeholder="Type message..."></textarea>
                </div>
                <button type="submit" className="w-full bg-titan hover:bg-titan/80 text-void font-bold py-4 rounded-xl transition-all uppercase tracking-widest text-sm flex justify-center items-center group">
                  Send Message
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-[#030305] pt-16 pb-8 px-6 font-mono text-xs text-telemetry">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div>
          <h2 className="font-sans font-bold text-lg text-ice tracking-widest mb-4">MAGNETIC ANOMALY</h2>
          <p className="mb-2">ENTITY: MAGNETIC ANOMALY LLC.</p>
          <p>ORIGIN: CLINTON HILL, BROOKLYN</p>
          <p>COORDS: 40.6895° N, 73.9646° W</p>
        </div>
        <div className="md:text-right flex flex-col md:items-end justify-between">
          <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 w-fit mb-4">
            <div className="w-2 h-2 rounded-full bg-signal animate-pulse" />
            <span className="text-signal tracking-wider">SYSTEM ONLINE</span>
          </div>
          <div className="space-x-4">
            <a href="#" className="hover:text-ice transition-colors">Privacy Policy</a>
            <span className="text-white/20">|</span>
            <a href="#" className="hover:text-ice transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto text-center border-t border-white/5 pt-8 opacity-50">
        &copy; {new Date().getFullYear()} Magnetic Anomaly LLC. All rights reserved.
      </div>
    </footer>
  );
}

export default function App() {
  const appContainer = useRef();

  useGSAP(() => {
    // CONSTANTS FOR ORBITS (Hardcoded to match 3D Mesh positions)
    const saturnLookAt = new THREE.Vector3(-15, 0, -45);
    const saturnHighRadius = 120;
    const saturnHighY = 35;

    const enceladusLookAt = new THREE.Vector3(-40, -5, 405);
    const enceladusRadius = 15;

    const ceresLookAt = new THREE.Vector3(150, 20, -100);
    const ceresRadius = 50;

    const makemakeLookAt = new THREE.Vector3(-150, -30, 50);
    const makemakeRadius = 60;

    const HERO_START_ANGLE = Math.PI * 0.45;
    const HERO_END_ANGLE = Math.PI * 0.6;

    // --- 1. HERO (ORBIT ENCELADUS) ---
    const enceladusOrbit = { angle: HERO_START_ANGLE };
    ScrollTrigger.create({
      trigger: "#hero",
      start: "top top",
      end: "+=1500",
      pin: true,
      animation: gsap.to(enceladusOrbit, { angle: HERO_END_ANGLE, ease: "none" }),
      scrub: true,
      onUpdate: (self) => {
        if (!self.isActive) return;
        globalCamera.pos.x = enceladusLookAt.x + Math.cos(enceladusOrbit.angle) * enceladusRadius;
        globalCamera.pos.z = enceladusLookAt.z + Math.sin(enceladusOrbit.angle) * enceladusRadius;
        globalCamera.pos.y = enceladusLookAt.y;
        globalCamera.lookAt.copy(enceladusLookAt);
      }
    });

    // --- 2. TRAVEL (ENCELADUS TO CERES) ---
    const travel1Pos = {
      x: enceladusLookAt.x + Math.cos(HERO_END_ANGLE) * enceladusRadius,
      y: enceladusLookAt.y,
      z: enceladusLookAt.z + Math.sin(HERO_END_ANGLE) * enceladusRadius
    };
    const travel1LookAt = { x: enceladusLookAt.x, y: enceladusLookAt.y, z: enceladusLookAt.z };
    ScrollTrigger.create({
      trigger: "#gap-to-payloads", start: "top bottom", endTrigger: "#payloads", end: "top 20%", scrub: 1,
      animation: gsap.timeline()
        .to(travel1Pos, { x: ceresLookAt.x - ceresRadius, y: ceresLookAt.y, z: ceresLookAt.z, ease: "expo.inOut" }, 0)
        .to(travel1LookAt, { x: ceresLookAt.x, y: ceresLookAt.y, z: ceresLookAt.z, ease: "expo.inOut" }, 0),
      onUpdate: (self) => {
        if (!self.isActive) return;
        globalCamera.pos.copy(travel1Pos);
        globalCamera.lookAt.copy(travel1LookAt);
      }
    });

    // --- 3. PAYLOADS (ORBIT CERES) ---
    const ceresOrbit = { angle: Math.PI }; // Start Left
    ScrollTrigger.create({
      trigger: "#payloads",
      start: "top 20%",
      end: "+=2000",
      pin: true,
      animation: gsap.to(ceresOrbit, { angle: Math.PI / 2, ease: "none" }),
      scrub: true,
      onUpdate: (self) => {
        if (!self.isActive) return;
        globalCamera.pos.x = ceresLookAt.x + Math.cos(ceresOrbit.angle) * ceresRadius;
        globalCamera.pos.z = ceresLookAt.z + Math.sin(ceresOrbit.angle) * ceresRadius;
        globalCamera.pos.y = ceresLookAt.y;
        globalCamera.lookAt.copy(ceresLookAt);
      }
    });

    // Independent entrace for payload cards (No Scrub, just entrance stagger)
    gsap.from(".payload-card", {
      scrollTrigger: { trigger: "#payloads", start: "top 20%" },
      y: 60, opacity: 0, duration: 1, ease: "power2.out", stagger: 0.15
    });

    // --- 4. TRAVEL (CERES TO SATURN HIGH VIEW) ---
    const travel2Pos = { x: ceresLookAt.x, y: ceresLookAt.y, z: ceresLookAt.z + ceresRadius };
    const travel2LookAt = { x: ceresLookAt.x, y: ceresLookAt.y, z: ceresLookAt.z };
    ScrollTrigger.create({
      trigger: "#gap-to-manifesto", start: "top bottom", endTrigger: "#manifesto", end: "center center", scrub: 1,
      animation: gsap.timeline()
        .to(travel2Pos, { x: saturnLookAt.x, y: saturnHighY, z: saturnLookAt.z + saturnHighRadius, ease: "expo.inOut" }, 0)
        .to(travel2LookAt, { x: saturnLookAt.x, y: saturnLookAt.y, z: saturnLookAt.z, ease: "expo.inOut" }, 0),
      onUpdate: (self) => {
        if (!self.isActive) return;
        globalCamera.pos.copy(travel2Pos);
        globalCamera.lookAt.copy(travel2LookAt);
      }
    });

    // --- 5. MANIFESTO (ORBIT SATURN HIGH VIEW) ---
    const saturnHighOrbit = { angle: Math.PI / 2 }; // Start Front
    ScrollTrigger.create({
      trigger: "#manifesto",
      start: "center center",
      end: "+=1500",
      pin: true,
      animation: gsap.to(saturnHighOrbit, { angle: 0, ease: "none" }),
      scrub: true,
      onUpdate: (self) => {
        if (!self.isActive) return;
        globalCamera.pos.x = saturnLookAt.x + Math.cos(saturnHighOrbit.angle) * saturnHighRadius;
        globalCamera.pos.z = saturnLookAt.z + Math.sin(saturnHighOrbit.angle) * saturnHighRadius;
        globalCamera.pos.y = saturnHighY;
        globalCamera.lookAt.copy(saturnLookAt);
      }
    });

    // --- 6. TRAVEL (SATURN HIGH VIEW TO MAKEMAKE) ---
    const travel3Pos = { x: saturnLookAt.x + saturnHighRadius, y: saturnHighY, z: saturnLookAt.z };
    const travel3LookAt = { x: saturnLookAt.x, y: saturnLookAt.y, z: saturnLookAt.z };
    ScrollTrigger.create({
      trigger: "#gap-to-commlink", start: "top bottom", endTrigger: "#commlink", end: "center center", scrub: 1,
      animation: gsap.timeline()
        .to(travel3Pos, { x: makemakeLookAt.x + makemakeRadius, y: makemakeLookAt.y, z: makemakeLookAt.z, ease: "expo.inOut" }, 0)
        .to(travel3LookAt, { x: makemakeLookAt.x, y: makemakeLookAt.y, z: makemakeLookAt.z, ease: "expo.inOut" }, 0),
      onUpdate: (self) => {
        if (!self.isActive) return;
        globalCamera.pos.copy(travel3Pos);
        globalCamera.lookAt.copy(travel3LookAt);
      }
    });

    // --- 7. COMMLINK (ORBIT MAKEMAKE) ---
    const makemakeOrbit = { angle: 0 }; // Start aligned to the right
    ScrollTrigger.create({
      trigger: "#commlink",
      start: "center center",
      end: "+=1500",
      pin: true,
      animation: gsap.to(makemakeOrbit, { angle: -Math.PI / 2, ease: "none" }),
      scrub: true,
      onUpdate: (self) => {
        if (!self.isActive) return;
        globalCamera.pos.x = makemakeLookAt.x + Math.cos(makemakeOrbit.angle) * makemakeRadius;
        globalCamera.pos.z = makemakeLookAt.z + Math.sin(makemakeOrbit.angle) * makemakeRadius;
        globalCamera.pos.y = makemakeLookAt.y;
        globalCamera.lookAt.copy(makemakeLookAt);
      }
    });

    // --- 8. FOOTER SLOW REVEAL ---
    gsap.from("footer", {
      yPercent: 100,
      ease: "none",
      scrollTrigger: {
        trigger: "#gap-to-footer",
        start: "top bottom",
        end: "bottom bottom",
        scrub: 1
      }
    });

  }, { scope: appContainer });

  return (
    <div ref={appContainer} className="relative w-full overflow-x-hidden selection:bg-titan/30 selection:text-titan">
      {/* WebGL Canvas sits behind everything */}
      <div className="fixed inset-0 z-0 bg-void pointer-events-none">
        <Canvas camera={{ position: [0, 0, 15], fov: 45, far: 5000 }}>
          <SaturnScene />
          <CameraRig />
        </Canvas>
      </div>

      <Navbar />
      <Hero />
      <Payloads />
      <Manifesto />
      <CommLink />
      <div id="gap-to-footer" className="h-[100vh] pointer-events-none" />
      <Footer />
    </div>
  );
}
